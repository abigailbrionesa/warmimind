from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from app import services
from app.models import LearningSession

router = APIRouter()


class CreateSessionRequest(BaseModel):
    document_id: str


class QueryRequest(BaseModel):
    query: str


class ChatRequest(BaseModel):
    message: str


class MisconceptionRequest(BaseModel):
    question: str
    student_answer: str


@router.post("/documents")
async def create_document(file: UploadFile = File(...)) -> dict:
    try:
        content = await file.read()
        document, chunks = services.create_document(
            file.filename or "uploaded.pdf",
            file.content_type or "application/octet-stream",
            content,
        )
        return {"document": document, "chunks": chunks}
    except services.UserFacingError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/documents/{document_id}")
async def get_document(document_id: str) -> dict:
    document = services.store.documents.get(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document was not found.")
    return {"document": document, "chunks": services.store.chunks.get(document_id, [])}


@router.post("/learning-sessions", response_model=LearningSession)
async def create_learning_session(request: CreateSessionRequest) -> LearningSession:
    try:
        return services.create_learning_session(request.document_id)
    except services.UserFacingError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/learning-sessions/{session_id}", response_model=LearningSession)
async def get_learning_session(session_id: str) -> LearningSession:
    try:
        return services.get_session(session_id)
    except services.UserFacingError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/learning-sessions/{session_id}/retrieve")
async def retrieve(session_id: str, request: QueryRequest) -> dict:
    return {"results": services.retrieve_chunks(session_id, request.query)}


@router.post("/learning-sessions/{session_id}/summary", response_model=LearningSession)
async def summarize(session_id: str) -> LearningSession:
    return services.generate_summary(session_id)


@router.post("/learning-sessions/{session_id}/concepts")
async def concepts(session_id: str) -> dict:
    return {"concepts": services.extract_concepts(session_id)}


@router.post("/learning-sessions/{session_id}/questions")
async def questions(session_id: str) -> dict:
    return {"questions": services.generate_questions(session_id)}


@router.post("/learning-sessions/{session_id}/chat")
async def chat(session_id: str, request: ChatRequest) -> dict:
    return {"message": services.answer_chat(session_id, request.message)}


@router.post("/learning-sessions/{session_id}/misconception-checks")
async def misconception_check(session_id: str, request: MisconceptionRequest) -> dict:
    return {
        "check": services.run_misconception_check(
            session_id,
            request.question,
            request.student_answer,
        )
    }


@router.post("/evals/runs")
async def create_eval_run() -> dict:
    return services.run_eval()


@router.get("/evals/runs")
async def list_eval_runs() -> dict:
    return {"runs": list(services.store.eval_runs.values())}


@router.get("/evals/runs/{run_id}")
async def get_eval_run(run_id: str) -> dict:
    run = services.store.eval_runs.get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Eval run was not found.")
    return run
