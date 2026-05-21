import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import services


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

    def test_eval_run_is_stored(self) -> None:
        run = services.run_eval()
        self.assertIn(run["run_id"], services.store.eval_runs)


if __name__ == "__main__":
    unittest.main()
