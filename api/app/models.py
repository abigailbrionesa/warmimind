from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class SessionStatus(str, Enum):
    created = "created"
    processed = "processed"
    studying = "studying"


class Citation(BaseModel):
    chunk_id: str
    page: int | None = None
    snippet: str


class DocumentMetadata(BaseModel):
    document_id: str
    title: str
    file_name: str
    content_type: str
    size_bytes: int
    detected_language: str = "unknown"
    status: Literal["uploaded", "processed"] = "processed"
    storage_path: str | None = None


class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    chunk_index: int
    content: str
    page: int | None = None
    char_count: int
    embedding: list[float] = Field(default_factory=list)


class Concept(BaseModel):
    concept_id: str
    session_id: str
    name: str
    explanation: str
    confidence: float = 0.5
    citations: list[Citation] = Field(default_factory=list)


class GuidedQuestion(BaseModel):
    question_id: str
    session_id: str
    text: str
    difficulty: Literal["foundation", "practice", "challenge"]
    related_concept: str
    evidence: list[Citation] = Field(default_factory=list)
    attempted_answer: str | None = None


class ChatMessage(BaseModel):
    message_id: str
    session_id: str
    role: Literal["user", "assistant"]
    content: str
    citations: list[Citation] = Field(default_factory=list)


class MisconceptionCheck(BaseModel):
    check_id: str
    session_id: str
    question: str
    student_answer: str
    correct: list[str]
    missing: list[str]
    review_next: str
    citations: list[Citation] = Field(default_factory=list)


class LearningSession(BaseModel):
    session_id: str
    document_id: str
    status: SessionStatus = SessionStatus.created
    summary: str | None = None
    summary_citations: list[Citation] = Field(default_factory=list)
    concepts: list[Concept] = Field(default_factory=list)
    guided_questions: list[GuidedQuestion] = Field(default_factory=list)
    chat_messages: list[ChatMessage] = Field(default_factory=list)
    misconception_checks: list[MisconceptionCheck] = Field(default_factory=list)
    weak_concepts: list[str] = Field(default_factory=list)
    next_recommended_action: str = "Review the document overview, then generate a source-grounded summary."


class RetrievalResult(BaseModel):
    chunk_id: str
    score: float
    snippet: str
    page: int | None = None
