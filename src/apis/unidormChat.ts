const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_URL ??
  "https://ai-server-dev.inuappcenter.kr";

const GUEST_DEVICE_ID_KEY = "unidorm_ai_guest_device_id";

export interface UnidormChatMessage {
  role: string;
  content: string;
}

export interface StreamUnidormChatOptions {
  question: string;
  history?: UnidormChatMessage[];
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
  userId?: number | string | null;
  sessionId?: string | null;
}

export interface SubmitUnidormFeedbackOptions {
  messageId?: number | string;
  feedback: 1 | -1;
  userId?: number | string | null;
}

const createUuid = () => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
};

const getGuestDeviceId = () => {
  const storedId = localStorage.getItem(GUEST_DEVICE_ID_KEY);
  if (storedId) return storedId;

  const newId = createUuid();
  localStorage.setItem(GUEST_DEVICE_ID_KEY, newId);
  return newId;
};

export const resolveDeviceId = (userId?: number | string | null) => {
  if (
    userId !== undefined &&
    userId !== null &&
    String(userId).trim() !== "" &&
    String(userId) !== "0"
  ) {
    return `unidorm-${userId}`;
  }
  return getGuestDeviceId();
};

export const streamUnidormChat = async ({
  question,
  history = [],
  signal,
  onChunk,
  userId,
  sessionId,
}: StreamUnidormChatOptions) => {
  const deviceId = resolveDeviceId(userId);

  const response = await fetch(`${AI_API_BASE_URL}/unidorm/chat`, {
    method: "POST",
    headers: {
      Accept: "text/plain",
      "Content-Type": "application/json",
      "X-Guest-Device-Id": deviceId,
    },
    body: JSON.stringify({
      question,
      history,
      ...(sessionId ? { sessionId } : {}),
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`챗불이 응답 오류 (${response.status})`);
  }

  if (!response.body) {
    onChunk(await response.text());
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onChunk(chunk);
  }

  const finalChunk = decoder.decode();
  if (finalChunk) onChunk(finalChunk);
};

export const submitUnidormFeedback = async ({
  messageId,
  feedback,
  userId,
}: SubmitUnidormFeedbackOptions) => {
  const deviceId = resolveDeviceId(userId);

  const response = await fetch(`${AI_API_BASE_URL}/unidorm/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Guest-Device-Id": deviceId,
    },
    body: JSON.stringify({
      feedback,
      ...(messageId !== undefined ? { messageId } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`피드백 전송 실패 (${response.status})`);
  }

  return response.json();
};
