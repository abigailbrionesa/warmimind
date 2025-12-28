type Session = {
  text: string;
  chunks: string[];
};

const sessions = new Map<string, Session>();

export function createSession(
  sessionId: string,
  text: string
) {
  sessions.set(sessionId, {
    text,
    chunks: text.match(/.{1,800}/g) ?? [],
  });
}

export function getSession(sessionId: string) {
  return sessions.get(sessionId);
}
