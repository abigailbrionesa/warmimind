export interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}


export interface TranslateResponse {
  translatedText: string;
  detectedSourceLanguage: string;
}


export interface GeminiSummaryRequest {
  text: string;
  targetLanguage?: string;
}


export interface GeminiSummaryResponse {
  summary: string;
  translatedSummary?: string;
}


export interface ApiErrorResponse {
  error: string;
}
