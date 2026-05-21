from __future__ import annotations

import re
from typing import Any, Protocol
from uuid import uuid4

from app.models import (
    ChatMessage,
    Concept,
    DocumentChunk,
    DocumentMetadata,
    GuidedQuestion,
    LearningSession,
    MisconceptionCheck,
)


class LearningRepository(Protocol):
    def save_document(
        self,
        document: DocumentMetadata,
        extracted_text: str,
        chunks: list[DocumentChunk],
        raw_pdf_bytes: bytes | None = None,
    ) -> None:
        ...

    def get_document(self, document_id: str) -> DocumentMetadata | None:
        ...

    def get_document_text(self, document_id: str) -> str | None:
        ...

    def get_chunks(self, document_id: str) -> list[DocumentChunk]:
        ...

    def save_session(self, session: LearningSession) -> None:
        ...

    def get_session(self, session_id: str) -> LearningSession | None:
        ...

    def save_eval_run(self, run: dict[str, Any]) -> None:
        ...

    def list_eval_runs(self) -> list[dict[str, Any]]:
        ...

    def get_eval_run(self, run_id: str) -> dict[str, Any] | None:
        ...

    def create_document_signed_url(self, document_id: str, expires_in_seconds: int) -> str | None:
        ...

    def reset(self) -> None:
        ...


class InMemoryLearningRepository:
    def __init__(self) -> None:
        self.documents: dict[str, DocumentMetadata] = {}
        self.document_text: dict[str, str] = {}
        self.chunks: dict[str, list[DocumentChunk]] = {}
        self.sessions: dict[str, LearningSession] = {}
        self.eval_runs: dict[str, dict[str, Any]] = {}

    def save_document(
        self,
        document: DocumentMetadata,
        extracted_text: str,
        chunks: list[DocumentChunk],
        raw_pdf_bytes: bytes | None = None,
    ) -> None:
        self.documents[document.document_id] = document
        self.document_text[document.document_id] = extracted_text
        self.chunks[document.document_id] = chunks

    def get_document(self, document_id: str) -> DocumentMetadata | None:
        return self.documents.get(document_id)

    def get_document_text(self, document_id: str) -> str | None:
        return self.document_text.get(document_id)

    def get_chunks(self, document_id: str) -> list[DocumentChunk]:
        return self.chunks.get(document_id, [])

    def save_session(self, session: LearningSession) -> None:
        self.sessions[session.session_id] = session

    def get_session(self, session_id: str) -> LearningSession | None:
        return self.sessions.get(session_id)

    def save_eval_run(self, run: dict[str, Any]) -> None:
        self.eval_runs[run["run_id"]] = run

    def list_eval_runs(self) -> list[dict[str, Any]]:
        return list(self.eval_runs.values())

    def get_eval_run(self, run_id: str) -> dict[str, Any] | None:
        return self.eval_runs.get(run_id)

    def create_document_signed_url(self, document_id: str, expires_in_seconds: int) -> str | None:
        return None

    def reset(self) -> None:
        self.documents.clear()
        self.document_text.clear()
        self.chunks.clear()
        self.sessions.clear()
        self.eval_runs.clear()


class SupabaseLearningRepository:
    def __init__(self, supabase_url: str, supabase_service_role_key: str, pdf_bucket: str) -> None:
        try:
            from supabase import create_client
        except ImportError as exc:  # pragma: no cover - depends on optional runtime install.
            raise RuntimeError("Install api requirements to use the Supabase repository.") from exc

        self.client = create_client(supabase_url, supabase_service_role_key)
        self.pdf_bucket = pdf_bucket

    def save_document(
        self,
        document: DocumentMetadata,
        extracted_text: str,
        chunks: list[DocumentChunk],
        raw_pdf_bytes: bytes | None = None,
    ) -> None:
        storage_path = document.storage_path
        if raw_pdf_bytes:
            storage_path = storage_path or _storage_path_for_document(document)
            self.client.storage.from_(self.pdf_bucket).upload(
                storage_path,
                raw_pdf_bytes,
                file_options={
                    "content-type": document.content_type,
                    "upsert": "true",
                },
            )
            document = document.model_copy(update={"storage_path": storage_path})

        self.client.table("documents").upsert(
            {
                "id": document.document_id,
                "title": document.title,
                "file_name": document.file_name,
                "content_type": document.content_type,
                "size_bytes": document.size_bytes,
                "detected_language": document.detected_language,
                "status": document.status,
                "extracted_text": extracted_text,
                "storage_path": document.storage_path,
            }
        ).execute()
        self.client.table("document_chunks").delete().eq("document_id", document.document_id).execute()
        if chunks:
            self.client.table("document_chunks").insert(
                [
                    {
                        "id": chunk.chunk_id,
                        "document_id": chunk.document_id,
                        "chunk_index": chunk.chunk_index,
                        "content": chunk.content,
                        "page": chunk.page,
                        "char_count": chunk.char_count,
                        "embedding": chunk.embedding,
                    }
                    for chunk in chunks
                ]
            ).execute()

    def get_document(self, document_id: str) -> DocumentMetadata | None:
        rows = self.client.table("documents").select("*").eq("id", document_id).limit(1).execute().data
        if not rows:
            return None
        return _document_from_row(rows[0])

    def get_document_text(self, document_id: str) -> str | None:
        rows = (
            self.client.table("documents")
            .select("extracted_text")
            .eq("id", document_id)
            .limit(1)
            .execute()
            .data
        )
        if not rows:
            return None
        return rows[0].get("extracted_text")

    def get_chunks(self, document_id: str) -> list[DocumentChunk]:
        rows = (
            self.client.table("document_chunks")
            .select("*")
            .eq("document_id", document_id)
            .order("chunk_index")
            .execute()
            .data
        )
        return [_chunk_from_row(row) for row in rows]

    def save_session(self, session: LearningSession) -> None:
        self.client.table("learning_sessions").upsert(
            {
                "id": session.session_id,
                "document_id": session.document_id,
                "status": session.status.value,
                "summary": session.summary,
                "summary_citations": _dump_list(session.summary_citations),
                "weak_concepts": session.weak_concepts,
                "next_recommended_action": session.next_recommended_action,
            }
        ).execute()
        self._replace_child_rows("concepts", "session_id", session.session_id, [_concept_row(item) for item in session.concepts])
        self._replace_child_rows(
            "guided_questions",
            "session_id",
            session.session_id,
            [_guided_question_row(item) for item in session.guided_questions],
        )
        self._replace_child_rows(
            "chat_messages",
            "session_id",
            session.session_id,
            [_chat_message_row(item) for item in session.chat_messages],
        )
        self._replace_child_rows(
            "misconception_checks",
            "session_id",
            session.session_id,
            [_misconception_check_row(item) for item in session.misconception_checks],
        )

    def get_session(self, session_id: str) -> LearningSession | None:
        rows = self.client.table("learning_sessions").select("*").eq("id", session_id).limit(1).execute().data
        if not rows:
            return None

        concepts = self.client.table("concepts").select("*").eq("session_id", session_id).execute().data
        questions = self.client.table("guided_questions").select("*").eq("session_id", session_id).execute().data
        messages = self.client.table("chat_messages").select("*").eq("session_id", session_id).execute().data
        checks = self.client.table("misconception_checks").select("*").eq("session_id", session_id).execute().data
        return _session_from_rows(rows[0], concepts, questions, messages, checks)

    def save_eval_run(self, run: dict[str, Any]) -> None:
        self.client.table("eval_runs").upsert(
            {
                "id": run["run_id"],
                "retrieval_hit_rate": run["retrieval_hit_rate"],
                "citation_coverage": run["citation_coverage"],
                "refusal_pass_rate": run["refusal_pass_rate"],
                "guided_question_quality": run["guided_question_quality"],
                "latency_ms": run["latency_ms"],
            }
        ).execute()
        self._replace_child_rows(
            "eval_results",
            "eval_run_id",
            run["run_id"],
            [
                {
                    "id": str(uuid4()),
                    "eval_run_id": run["run_id"],
                    "status": item["status"],
                    "notes": item["notes"],
                    "payload": item,
                }
                for item in run.get("results", [])
            ],
        )

    def list_eval_runs(self) -> list[dict[str, Any]]:
        rows = self.client.table("eval_runs").select("*").order("created_at", desc=True).execute().data
        return [self._eval_run_from_row(row) for row in rows]

    def get_eval_run(self, run_id: str) -> dict[str, Any] | None:
        rows = self.client.table("eval_runs").select("*").eq("id", run_id).limit(1).execute().data
        if not rows:
            return None
        return self._eval_run_from_row(rows[0])

    def create_document_signed_url(self, document_id: str, expires_in_seconds: int) -> str | None:
        document = self.get_document(document_id)
        if not document or not document.storage_path:
            return None
        response = self.client.storage.from_(self.pdf_bucket).create_signed_url(
            document.storage_path,
            expires_in_seconds,
        )
        if isinstance(response, dict):
            return response.get("signedURL") or response.get("signedUrl") or response.get("signed_url")
        return getattr(response, "signed_url", None) or getattr(response, "signedURL", None)

    def reset(self) -> None:
        raise RuntimeError("Refusing to reset Supabase data through the runtime repository.")

    def _replace_child_rows(self, table: str, foreign_key: str, foreign_id: str, rows: list[dict[str, Any]]) -> None:
        self.client.table(table).delete().eq(foreign_key, foreign_id).execute()
        if rows:
            self.client.table(table).insert(rows).execute()

    def _eval_run_from_row(self, row: dict[str, Any]) -> dict[str, Any]:
        results = self.client.table("eval_results").select("*").eq("eval_run_id", row["id"]).execute().data
        return {
            "run_id": row["id"],
            "retrieval_hit_rate": float(row["retrieval_hit_rate"]),
            "citation_coverage": float(row["citation_coverage"]),
            "refusal_pass_rate": float(row["refusal_pass_rate"]),
            "guided_question_quality": row["guided_question_quality"],
            "latency_ms": row["latency_ms"],
            "results": [item.get("payload", {"status": item["status"], "notes": item["notes"]}) for item in results],
        }


def build_repository(settings: Any) -> LearningRepository:
    if (
        settings.repository_backend == "supabase"
        and settings.supabase_url
        and settings.supabase_service_role_key
    ):
        return SupabaseLearningRepository(
            settings.supabase_url,
            settings.supabase_service_role_key,
            settings.supabase_pdf_bucket,
        )
    return InMemoryLearningRepository()


def _dump_model(model: Any) -> dict[str, Any]:
    return model.model_dump(mode="json")


def _dump_list(models: list[Any]) -> list[dict[str, Any]]:
    return [_dump_model(model) for model in models]


def _document_from_row(row: dict[str, Any]) -> DocumentMetadata:
    return DocumentMetadata(
        document_id=row["id"],
        title=row["title"],
        file_name=row["file_name"],
        content_type=row["content_type"],
        size_bytes=row["size_bytes"],
        detected_language=row.get("detected_language", "unknown"),
        status=row.get("status", "processed"),
        storage_path=row.get("storage_path"),
    )


def _storage_path_for_document(document: DocumentMetadata) -> str:
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "-", document.file_name).strip("-") or "uploaded.pdf"
    return f"documents/{document.document_id}/{safe_name}"


def _chunk_from_row(row: dict[str, Any]) -> DocumentChunk:
    return DocumentChunk(
        chunk_id=row["id"],
        document_id=row["document_id"],
        chunk_index=row["chunk_index"],
        content=row["content"],
        page=row.get("page"),
        char_count=row["char_count"],
        embedding=row.get("embedding") or [],
    )


def _concept_row(concept: Concept) -> dict[str, Any]:
    return {
        "id": concept.concept_id,
        "session_id": concept.session_id,
        "name": concept.name,
        "explanation": concept.explanation,
        "confidence": concept.confidence,
        "citations": _dump_list(concept.citations),
    }


def _guided_question_row(question: GuidedQuestion) -> dict[str, Any]:
    return {
        "id": question.question_id,
        "session_id": question.session_id,
        "text": question.text,
        "difficulty": question.difficulty,
        "related_concept": question.related_concept,
        "evidence": _dump_list(question.evidence),
        "attempted_answer": question.attempted_answer,
    }


def _chat_message_row(message: ChatMessage) -> dict[str, Any]:
    return {
        "id": message.message_id,
        "session_id": message.session_id,
        "role": message.role,
        "content": message.content,
        "citations": _dump_list(message.citations),
    }


def _misconception_check_row(check: MisconceptionCheck) -> dict[str, Any]:
    return {
        "id": check.check_id,
        "session_id": check.session_id,
        "question": check.question,
        "student_answer": check.student_answer,
        "correct": check.correct,
        "missing": check.missing,
        "review_next": check.review_next,
        "citations": _dump_list(check.citations),
    }


def _session_from_rows(
    session_row: dict[str, Any],
    concept_rows: list[dict[str, Any]],
    question_rows: list[dict[str, Any]],
    message_rows: list[dict[str, Any]],
    check_rows: list[dict[str, Any]],
) -> LearningSession:
    return LearningSession(
        session_id=session_row["id"],
        document_id=session_row["document_id"],
        status=session_row["status"],
        summary=session_row.get("summary"),
        summary_citations=session_row.get("summary_citations") or [],
        concepts=[
            Concept(
                concept_id=row["id"],
                session_id=row["session_id"],
                name=row["name"],
                explanation=row["explanation"],
                confidence=float(row["confidence"]),
                citations=row.get("citations") or [],
            )
            for row in concept_rows
        ],
        guided_questions=[
            GuidedQuestion(
                question_id=row["id"],
                session_id=row["session_id"],
                text=row["text"],
                difficulty=row["difficulty"],
                related_concept=row["related_concept"],
                evidence=row.get("evidence") or [],
                attempted_answer=row.get("attempted_answer"),
            )
            for row in question_rows
        ],
        chat_messages=[
            ChatMessage(
                message_id=row["id"],
                session_id=row["session_id"],
                role=row["role"],
                content=row["content"],
                citations=row.get("citations") or [],
            )
            for row in message_rows
        ],
        misconception_checks=[
            MisconceptionCheck(
                check_id=row["id"],
                session_id=row["session_id"],
                question=row["question"],
                student_answer=row["student_answer"],
                correct=row.get("correct") or [],
                missing=row.get("missing") or [],
                review_next=row["review_next"],
                citations=row.get("citations") or [],
            )
            for row in check_rows
        ],
        weak_concepts=session_row.get("weak_concepts") or [],
        next_recommended_action=session_row["next_recommended_action"],
    )
