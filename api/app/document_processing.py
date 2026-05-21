import re
from io import BytesIO

from pypdf import PdfReader
from pypdf.errors import PdfReadError


MIN_EXTRACTED_TEXT_CHARS = 200


class PdfTextExtractionError(ValueError):
    pass


def extract_text_from_pdf_bytes(content: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(content))
    except (PdfReadError, OSError, ValueError) as exc:
        raise PdfTextExtractionError(
            "This PDF could not be read. Try a valid text-based PDF."
        ) from exc

    page_text = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text.strip():
            page_text.append(text)

    cleaned = normalize_extracted_text("\n".join(page_text))
    if len(cleaned) < MIN_EXTRACTED_TEXT_CHARS:
        raise PdfTextExtractionError(
            "This PDF does not contain enough extractable text. Try a text-based PDF or an OCR version."
        )

    return cleaned


def normalize_extracted_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()
