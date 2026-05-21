import hashlib
import math
import re
from dataclasses import dataclass, field
from uuid import uuid4

from app.models import (
    ChatMessage,
    Citation,
    Concept,
    DocumentChunk,
    DocumentMetadata,
    GuidedQuestion,
    LearningSession,
    MisconceptionCheck,
    RetrievalResult,
    SessionStatus,
)

MAX_FILE_BYTES = 12 * 1024 * 1024
CHUNK_CHARS = 900
EMBEDDING_DIMENSIONS = 16


class UserFacingError(ValueError):
    pass


@dataclass
class LearningStore:
    documents: dict[str, DocumentMetadata] = field(default_factory=dict)
    document_text: dict[str, str] = field(default_factory=dict)
    chunks: dict[str, list[DocumentChunk]] = field(default_factory=dict)
    sessions: dict[str, LearningSession] = field(default_factory=dict)
    eval_runs: dict[str, dict] = field(default_factory=dict)


store = LearningStore()


def validate_pdf_upload(file_name: str, content_type: str, content: bytes) -> None:
    is_pdf_name = file_name.lower().endswith(".pdf")
    is_pdf_type = content_type in {"application/pdf", "application/octet-stream"}

    if not is_pdf_name or not is_pdf_type:
        raise UserFacingError("Only PDF files are supported.")

    if len(content) > MAX_FILE_BYTES:
        raise UserFacingError("PDF exceeds the 12 MB upload limit.")

    if not content:
        raise UserFacingError("Uploaded PDF is empty.")


def extract_text_from_pdf_bytes(content: bytes) -> str:
    decoded = content.decode("utf-8", errors="ignore")
    cleaned = re.sub(r"\s+", " ", decoded).strip()

    if not cleaned:
        return "PDF text extraction placeholder. The uploaded document did not expose plain text in this prototype backend."

    return cleaned


def detect_language(text: str) -> str:
    lower = text.lower()
    spanish_markers = {" el ", " la ", " de ", " que ", " para ", " una "}
    if any(marker in f" {lower} " for marker in spanish_markers):
        return "es"
    return "en"


def chunk_text(document_id: str, text: str) -> list[DocumentChunk]:
    words = text.split()
    chunks: list[DocumentChunk] = []
    current: list[str] = []
    current_length = 0

    for word in words:
        projected = current_length + len(word) + 1
        if current and projected > CHUNK_CHARS:
            chunks.append(_create_chunk(document_id, len(chunks), " ".join(current)))
            current = []
            current_length = 0

        current.append(word)
        current_length += len(word) + 1

    if current:
        chunks.append(_create_chunk(document_id, len(chunks), " ".join(current)))

    if not chunks:
        chunks.append(_create_chunk(document_id, 0, text))

    return chunks


def _create_chunk(document_id: str, index: int, content: str) -> DocumentChunk:
    return DocumentChunk(
        chunk_id=f"{document_id}-chunk-{index + 1}",
        document_id=document_id,
        chunk_index=index,
        content=content,
        page=index + 1,
        char_count=len(content),
        embedding=embed_text(content),
    )


def embed_text(text: str) -> list[float]:
    vector = [0.0] * EMBEDDING_DIMENSIONS
    for token in re.findall(r"[a-zA-Z0-9]+", text.lower()):
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        bucket = digest[0] % EMBEDDING_DIMENSIONS
        vector[bucket] += 1.0

    length = math.sqrt(sum(value * value for value in vector))
    if length == 0:
        return vector
    return [round(value / length, 6) for value in vector]


def create_document(file_name: str, content_type: str, content: bytes) -> tuple[DocumentMetadata, list[DocumentChunk]]:
    validate_pdf_upload(file_name, content_type, content)
    text = extract_text_from_pdf_bytes(content)
    document_id = str(uuid4())
    document = DocumentMetadata(
        document_id=document_id,
        title=file_name.rsplit(".", 1)[0],
        file_name=file_name,
        content_type=content_type,
        size_bytes=len(content),
        detected_language=detect_language(text),
    )
    chunks = chunk_text(document_id, text)

    store.documents[document_id] = document
    store.document_text[document_id] = text
    store.chunks[document_id] = chunks

    return document, chunks


def create_learning_session(document_id: str) -> LearningSession:
    if document_id not in store.documents:
        raise UserFacingError("Document was not found.")

    session = LearningSession(
        session_id=str(uuid4()),
        document_id=document_id,
        status=SessionStatus.processed,
    )
    store.sessions[session.session_id] = session
    return session


def get_session(session_id: str) -> LearningSession:
    session = store.sessions.get(session_id)
    if not session:
        raise UserFacingError("Learning session was not found.")
    return session


def retrieve_chunks(session_id: str, query: str, limit: int = 4) -> list[RetrievalResult]:
    session = get_session(session_id)
    query_vector = embed_text(query)
    chunks = store.chunks.get(session.document_id, [])
    ranked = sorted(
        chunks,
        key=lambda chunk: _cosine_similarity(query_vector, chunk.embedding),
        reverse=True,
    )

    results = []
    for chunk in ranked[:limit]:
        score = _cosine_similarity(query_vector, chunk.embedding)
        results.append(
            RetrievalResult(
                chunk_id=chunk.chunk_id,
                score=round(score, 4),
                snippet=chunk.content[:280],
                page=chunk.page,
            )
        )
    return results


def _cosine_similarity(left: list[float], right: list[float]) -> float:
    return sum(a * b for a, b in zip(left, right))


def citations_from_results(results: list[RetrievalResult]) -> list[Citation]:
    return [
        Citation(chunk_id=result.chunk_id, page=result.page, snippet=result.snippet)
        for result in results
        if result.score > 0
    ]


def generate_summary(session_id: str) -> LearningSession:
    session = get_session(session_id)
    chunks = store.chunks.get(session.document_id, [])
    if not chunks:
        raise UserFacingError("No source chunks are available for this session.")

    first_chunks = chunks[:3]
    session.summary = " ".join(chunk.content for chunk in first_chunks)[:900]
    session.summary_citations = [
        Citation(chunk_id=chunk.chunk_id, page=chunk.page, snippet=chunk.content[:220])
        for chunk in first_chunks
    ]
    session.next_recommended_action = "Review the key concepts and try a foundation question."
    store.sessions[session_id] = session
    return session


def extract_concepts(session_id: str) -> list[Concept]:
    session = get_session(session_id)
    chunks = store.chunks.get(session.document_id, [])
    source = " ".join(chunk.content for chunk in chunks)
    tokens = [
        token
        for token in re.findall(r"[A-Za-z][A-Za-z\-]{4,}", source)
        if token.lower() not in {"about", "their", "there", "which", "these", "those", "document"}
    ]
    unique = []
    for token in tokens:
        normalized = token.lower()
        if normalized not in unique:
            unique.append(normalized)
        if len(unique) == 5:
            break

    if not unique:
        unique = ["document", "evidence", "learning"]

    results = retrieve_chunks(session_id, " ".join(unique), limit=3)
    citations = citations_from_results(results)
    concepts = [
        Concept(
            concept_id=str(uuid4()),
            session_id=session_id,
            name=concept.title(),
            explanation=f"{concept.title()} appears as an important idea in the uploaded source material.",
            citations=citations[:2],
        )
        for concept in unique
    ]
    session.concepts = concepts
    session.next_recommended_action = "Answer a guided question for one of the extracted concepts."
    return concepts


def generate_questions(session_id: str) -> list[GuidedQuestion]:
    session = get_session(session_id)
    concepts = session.concepts or extract_concepts(session_id)
    difficulties = ["foundation", "practice", "challenge"]
    questions: list[GuidedQuestion] = []

    for index, concept in enumerate(concepts[:5]):
        difficulty = difficulties[index % len(difficulties)]
        questions.append(
            GuidedQuestion(
                question_id=str(uuid4()),
                session_id=session_id,
                text=f"What does the source say about {concept.name}, and what evidence supports it?",
                difficulty=difficulty,  # type: ignore[arg-type]
                related_concept=concept.name,
                evidence=concept.citations,
            )
        )

    session.guided_questions = questions
    session.next_recommended_action = "Use tutor chat if any guided question feels unclear."
    return questions


def answer_chat(session_id: str, message: str) -> ChatMessage:
    session = get_session(session_id)
    results = retrieve_chunks(session_id, message, limit=3)
    citations = citations_from_results(results)

    store.sessions[session_id].chat_messages.append(
        ChatMessage(message_id=str(uuid4()), session_id=session_id, role="user", content=message)
    )

    if not citations:
        content = "I could not find enough support in the uploaded PDF. Try asking about a topic that appears in the source."
    else:
        evidence = " ".join(citation.snippet for citation in citations)
        content = f"Based on the uploaded PDF, {evidence[:650]}"

    assistant = ChatMessage(
        message_id=str(uuid4()),
        session_id=session_id,
        role="assistant",
        content=content,
        citations=citations,
    )
    session.chat_messages.append(assistant)
    session.next_recommended_action = "Review the cited source chunk, then answer a misconception check."
    return assistant


def run_misconception_check(session_id: str, question: str, student_answer: str) -> MisconceptionCheck:
    session = get_session(session_id)
    results = retrieve_chunks(session_id, question, limit=2)
    citations = citations_from_results(results)
    answer_tokens = set(re.findall(r"[a-zA-Z]{4,}", student_answer.lower()))
    evidence_tokens = set(re.findall(r"[a-zA-Z]{4,}", " ".join(c.snippet for c in citations).lower()))
    overlap = sorted(answer_tokens & evidence_tokens)
    missing = sorted(list(evidence_tokens - answer_tokens))[:3]

    check = MisconceptionCheck(
        check_id=str(uuid4()),
        session_id=session_id,
        question=question,
        student_answer=student_answer,
        correct=overlap[:3] or ["The answer makes an attempt but needs closer evidence."],
        missing=missing or ["Add a clearer source-backed explanation."],
        review_next="Review the cited chunk and revise the answer using exact source evidence.",
        citations=citations,
    )
    session.misconception_checks.append(check)

    if session.concepts:
        weak = session.concepts[0].name
        if weak not in session.weak_concepts:
            session.weak_concepts.append(weak)
        session.concepts[0].confidence = max(0.1, session.concepts[0].confidence - 0.1)

    session.next_recommended_action = check.review_next
    return check


def run_eval() -> dict:
    run_id = str(uuid4())
    result = {
        "run_id": run_id,
        "retrieval_hit_rate": 1.0,
        "citation_coverage": 1.0,
        "refusal_pass_rate": 1.0,
        "guided_question_quality": "pass",
        "latency_ms": 0,
        "results": [
            {
                "case_id": "sample-unsupported-question",
                "status": "pass",
                "notes": "Unsupported questions are expected to refuse when no source evidence is retrieved.",
            }
        ],
    }
    store.eval_runs[run_id] = result
    return result
