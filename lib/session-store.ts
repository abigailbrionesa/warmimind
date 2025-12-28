type Session = {
  chunks: string[];
};

declare global {
  // eslint-disable-next-line no-var
  var __sessions: Map<string, Session> | undefined;
}

const sessions =
  globalThis.__sessions ?? new Map<string, Session>();

if (!globalThis.__sessions) {
  globalThis.__sessions = sessions;
}

export function createSession(
  sessionId: string,
  data: Session
) {
  sessions.set(sessionId, data);
}

export function getSession(sessionId: string) {
  return sessions.get(sessionId);
}
