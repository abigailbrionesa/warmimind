export async function POST(req: NextRequest) {
  const { message, sessionId } = await req.json();
  const session = sessions.get(sessionId);

  const relevantChunks = findRelevantChunks(
    message,
    session.chunks
  );

  const systemPrompt = `
You are a Quechua STEM tutor for young girls in Peru.
Use ONLY the provided PDF context.
Explain clearly and kindly.
Respond ONLY in Quechua.
`;

  const result = await model.streamText({
    system: systemPrompt,
    prompt: `
PDF CONTEXT:
${relevantChunks.join("\n")}

QUESTION:
${message}
`,
  });

  return result.toUIMessageStreamResponse();
}
