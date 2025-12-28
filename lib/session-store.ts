type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Session = {
  text: string;
  chunks: string[];
  chatHistory: Message[];
};

export const sessions = new Map<string, Session>();

export function createSession(sessionId: string, text: string) {
  sessions.set(sessionId, {
    text,
    chunks: text.match(/.{1,800}/g) ?? [],
    chatHistory: [],
  });
}

export function addMessageToSession(sessionId: string, message: Message) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.chatHistory.push(message);
}


export function getSession(sessionId: string) {
  return sessions.get(sessionId);
}
