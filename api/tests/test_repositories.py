import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.models import (
    ChatMessage,
    Citation,
    Concept,
    DocumentChunk,
    DocumentMetadata,
    GuidedQuestion,
    LearningSession,
    MisconceptionCheck,
    SessionStatus,
)
from app.repositories import InMemoryLearningRepository


class InMemoryLearningRepositoryTest(unittest.TestCase):
    def setUp(self) -> None:
        self.repository = InMemoryLearningRepository()

    def test_persists_document_text_and_chunks(self) -> None:
        document = DocumentMetadata(
            document_id="document-1",
            title="Physics",
            file_name="physics.pdf",
            content_type="application/pdf",
            size_bytes=123,
            detected_language="en",
        )
        chunks = [
            DocumentChunk(
                chunk_id="document-1-chunk-1",
                document_id=document.document_id,
                chunk_index=0,
                content="Force changes motion.",
                page=1,
                char_count=21,
                embedding=[1.0, 0.0],
            )
        ]

        self.repository.save_document(document, "Force changes motion.", chunks)

        self.assertEqual(self.repository.get_document(document.document_id), document)
        self.assertEqual(self.repository.get_document_text(document.document_id), "Force changes motion.")
        self.assertEqual(self.repository.get_chunks(document.document_id), chunks)

    def test_persists_full_learning_session_state(self) -> None:
        citation = Citation(chunk_id="document-1-chunk-1", page=1, snippet="Force changes motion.")
        session = LearningSession(
            session_id="session-1",
            document_id="document-1",
            status=SessionStatus.processed,
            summary="Force changes motion.",
            summary_citations=[citation],
            concepts=[
                Concept(
                    concept_id="concept-1",
                    session_id="session-1",
                    name="Force",
                    explanation="Force appears in the source.",
                    citations=[citation],
                )
            ],
            guided_questions=[
                GuidedQuestion(
                    question_id="question-1",
                    session_id="session-1",
                    text="What does the source say about force?",
                    difficulty="foundation",
                    related_concept="Force",
                    evidence=[citation],
                )
            ],
            chat_messages=[
                ChatMessage(
                    message_id="message-1",
                    session_id="session-1",
                    role="assistant",
                    content="Based on the source...",
                    citations=[citation],
                )
            ],
            misconception_checks=[
                MisconceptionCheck(
                    check_id="check-1",
                    session_id="session-1",
                    question="What is force?",
                    student_answer="Force changes motion.",
                    correct=["force"],
                    missing=[],
                    review_next="Review the cited chunk.",
                    citations=[citation],
                )
            ],
            weak_concepts=["Force"],
            next_recommended_action="Review the cited chunk.",
        )

        self.repository.save_session(session)

        self.assertEqual(self.repository.get_session(session.session_id), session)

    def test_persists_eval_runs_and_reset_clears_state(self) -> None:
        run = {
            "run_id": "run-1",
            "retrieval_hit_rate": 1.0,
            "citation_coverage": 1.0,
            "refusal_pass_rate": 1.0,
            "guided_question_quality": "pass",
            "latency_ms": 0,
            "results": [{"case_id": "case-1", "status": "pass", "notes": "ok"}],
        }

        self.repository.save_eval_run(run)
        self.assertEqual(self.repository.get_eval_run("run-1"), run)
        self.assertEqual(self.repository.list_eval_runs(), [run])

        self.repository.reset()

        self.assertIsNone(self.repository.get_eval_run("run-1"))


if __name__ == "__main__":
    unittest.main()
