import unittest
from pathlib import Path
import sys
import types

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


class HTTPException(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class APIRouter:
    def post(self, *_args: object, **_kwargs: object) -> object:
        return lambda endpoint: endpoint

    def get(self, *_args: object, **_kwargs: object) -> object:
        return lambda endpoint: endpoint


def File(*_args: object, **_kwargs: object) -> object:
    return None


class UploadFile:
    filename: str | None = None
    content_type: str | None = None


sys.modules.setdefault(
    "fastapi",
    types.SimpleNamespace(
        APIRouter=APIRouter,
        File=File,
        HTTPException=HTTPException,
        UploadFile=UploadFile,
        status=types.SimpleNamespace(HTTP_413_REQUEST_ENTITY_TOO_LARGE=413),
    ),
)

from app import services
from app.api.v1 import learning


class LearningServicesTest(unittest.TestCase):
    def setUp(self) -> None:
        services.store.documents.clear()
        services.store.document_text.clear()
        services.store.chunks.clear()
        services.store.sessions.clear()
        services.store.eval_runs.clear()

    def test_invalid_file_type_is_rejected(self) -> None:
        with self.assertRaises(services.UserFacingError):
            services.create_document("notes.txt", "text/plain", b"not a pdf")

    def test_oversized_file_is_rejected(self) -> None:
        content = b"x" * (services.MAX_FILE_BYTES + 1)
        with self.assertRaises(services.UserFacingError):
            services.create_document("huge.pdf", "application/pdf", content)

    def test_embedding_dimension_matches_migration(self) -> None:
        migration = Path("migrations/0001_v2_learning_core.sql").read_text()
        self.assertIn(f"vector({services.EMBEDDING_DIMENSIONS})", migration)

    def test_session_creation_and_learning_outputs(self) -> None:
        document, chunks = services.create_document(
            "physics.pdf",
            "application/pdf",
            b"Force changes motion. Energy describes the ability to do work. Motion can be measured with velocity.",
        )
        session = services.create_learning_session(document.document_id)

        self.assertGreaterEqual(len(chunks), 1)
        self.assertEqual(session.document_id, document.document_id)

        updated = services.generate_summary(session.session_id)
        concepts = services.extract_concepts(session.session_id)
        questions = services.generate_questions(session.session_id)
        answer = services.answer_chat(session.session_id, "What does the source say about energy?")
        check = services.run_misconception_check(
            session.session_id,
            "What is energy?",
            "Energy is the ability to do work.",
        )

        self.assertIsNotNone(updated.summary)
        self.assertGreaterEqual(len(updated.summary_citations), 1)
        self.assertGreaterEqual(len(concepts), 1)
        self.assertGreaterEqual(len(questions), 1)
        self.assertGreaterEqual(len(answer.citations), 1)
        self.assertGreaterEqual(len(check.citations), 1)
        self.assertIn("Review", services.get_session(session.session_id).next_recommended_action)

    def test_unsupported_question_refuses_without_citations(self) -> None:
        document, _ = services.create_document(
            "physics.pdf",
            "application/pdf",
            b"Force changes motion. Energy describes the ability to do work.",
        )
        session = services.create_learning_session(document.document_id)

        answer = services.answer_chat(session.session_id, "What was the author's childhood like?")

        self.assertEqual(answer.citations, [])
        self.assertIn("could not find enough support", answer.content)

    def test_missing_session_errors_are_mapped_to_http_errors(self) -> None:
        request = learning.QueryRequest(query="energy")

        with self.assertRaises(HTTPException) as context:
            import asyncio

            asyncio.run(learning.retrieve("missing-session", request))

        self.assertEqual(context.exception.status_code, 404)

        with self.assertRaises(HTTPException) as summary_context:
            asyncio.run(learning.summarize("missing-session"))

        self.assertEqual(summary_context.exception.status_code, 404)

    def test_eval_run_is_stored(self) -> None:
        run = services.run_eval()
        self.assertIn(run["run_id"], services.store.eval_runs)


class FakeUpload:
    filename = "huge.pdf"
    content_type = "application/pdf"

    def __init__(self) -> None:
        self.total = 0

    async def read(self, size: int) -> bytes:
        if self.total > services.MAX_FILE_BYTES:
            return b""

        self.total += size
        return b"x" * size


class UploadLimitTest(unittest.IsolatedAsyncioTestCase):
    async def test_stream_read_rejects_oversized_upload_before_returning_content(self) -> None:
        with self.assertRaises(HTTPException) as context:
            await learning.read_upload_with_limit(FakeUpload())  # type: ignore[arg-type]

        self.assertEqual(context.exception.status_code, 413)


if __name__ == "__main__":
    unittest.main()
