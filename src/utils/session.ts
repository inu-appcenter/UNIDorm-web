const SESSION_ID_KEY = "session_id";

/**
 * 앱(탭) 실행마다 고유한 세션 UUID를 발급하고 sessionStorage에 유지합니다.
 */
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};
