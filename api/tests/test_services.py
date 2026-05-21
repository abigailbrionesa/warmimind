import unittest
from pathlib import Path
import sys
import types
from unittest.mock import patch

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
from app import document_processing
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

    def test_valid_text_pdf_extracts_expected_text(self) -> None:
        document, chunks = services.create_document(
            "physics.pdf",
            "application/pdf",
            build_pdf_bytes("Force changes motion. " * 20 + "Energy describes the ability to do work. " * 20),
        )

        extracted = services.store.document_text[document.document_id]
        self.assertIn("Force changes motion", extracted)
        self.assertGreaterEqual(len(chunks), 1)

    def test_unextractable_pdf_is_rejected(self) -> None:
        with patch("app.document_processing.PdfReader", side_effect=document_processing.PdfReadError("broken")):
            with self.assertRaises(services.UserFacingError) as context:
                services.create_document("broken.pdf", "application/pdf", b"%PDF-1.4\nnot actually readable")

        self.assertIn("could not be read", str(context.exception))

    def test_upload_endpoint_maps_unextractable_pdf_to_http_400(self) -> None:
        with self.assertRaises(HTTPException) as context:
            with patch("app.document_processing.PdfReader", side_effect=document_processing.PdfReadError("broken")):
                import asyncio

                asyncio.run(learning.create_document(FakeSmallPdfUpload()))

        self.assertEqual(context.exception.status_code, 400)
        self.assertIn("could not be read", context.exception.detail)

    def test_pdf_with_too_little_text_is_rejected(self) -> None:
        with self.assertRaises(services.UserFacingError) as context:
            services.create_document("short.pdf", "application/pdf", build_pdf_bytes("Too short."))

        self.assertIn("does not contain enough extractable text", str(context.exception))

    def test_document_processing_rejects_too_short_extracted_text(self) -> None:
        with patch("app.document_processing.PdfReader") as reader:
            reader.return_value.pages = [types.SimpleNamespace(extract_text=lambda: "tiny")]

            with self.assertRaises(document_processing.PdfTextExtractionError):
                document_processing.extract_text_from_pdf_bytes(b"%PDF-1.4")

    def test_embedding_dimension_matches_migration(self) -> None:
        migration = Path("migrations/0001_v2_learning_core.sql").read_text()
        self.assertIn(f"vector({services.EMBEDDING_DIMENSIONS})", migration)

    def test_session_creation_and_learning_outputs(self) -> None:
        document, chunks = services.create_document(
            "physics.pdf",
            "application/pdf",
            build_pdf_bytes(
                "Force changes motion. Energy describes the ability to do work. "
                "Motion can be measured with velocity. " * 12
            ),
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
            build_pdf_bytes("Force changes motion. Energy describes the ability to do work. " * 12),
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


class FakeSmallPdfUpload:
    filename = "broken.pdf"
    content_type = "application/pdf"

    def __init__(self) -> None:
        self.has_read = False

    async def read(self, _size: int = -1) -> bytes:
        if self.has_read:
            return b""
        self.has_read = True
        return b"%PDF-1.4\nnot actually readable"


class UploadLimitTest(unittest.IsolatedAsyncioTestCase):
    async def test_stream_read_rejects_oversized_upload_before_returning_content(self) -> None:
        with self.assertRaises(HTTPException) as context:
            await learning.read_upload_with_limit(FakeUpload())  # type: ignore[arg-type]

        self.assertEqual(context.exception.status_code, 413)


def build_pdf_bytes(text: str) -> bytes:
    escaped = (
        text.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .replace("\r", " ")
        .replace("\n", " ")
    )
    stream = f"BT /F1 12 Tf 72 720 Td ({escaped}) Tj ET".encode("latin-1", errors="ignore")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
    ]

    output = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode("ascii"))
        output.extend(obj)
        output.extend(b"\nendobj\n")

    xref_offset = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    output.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode(
            "ascii"
        )
    )
    return bytes(output)


if __name__ == "__main__":
    unittest.main()
