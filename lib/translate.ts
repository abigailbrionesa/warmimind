import { TranslationServiceClient } from "@google-cloud/translate";

const client = new TranslationServiceClient();

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID!;
const LOCATION = "global";

export async function detectLanguage(text: string): Promise<string> {
  const [response] = await client.detectLanguage({
    parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
    content: text.slice(0, 5000),
  });

  const languageCode =
    response.languages?.[0]?.languageCode ?? "und";

  return languageCode;
}

export async function translate(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  const [response] = await client.translateText({
    parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
    contents: [text],
    mimeType: "text/plain",
    sourceLanguageCode: sourceLanguage,
    targetLanguageCode: targetLanguage,
  });

  return response.translations?.[0]?.translatedText ?? "";
}

