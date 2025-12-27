type Session = {
  chunks: string[];
};

const sessions = new Map<string, Session>();

export function createSession(
  sessionId: string,
  data: Session
) {
  sessions.set(sessionId, data);
}

export function getSession(sessionId: string) {
  return sessions.get(sessionId);
}
