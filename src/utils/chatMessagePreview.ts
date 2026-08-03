const DISCLOSURE_PREVIEWS = {
  request: "학번 공유를 요청했어요.",
  accept: "학번 공유가 완료됐어요.",
  decline: "학번 공유 요청을 거절했어요.",
  cancel: "학번 공유 요청을 취소했어요.",
} as const;

const isDisclosureRequestPayload = (value: unknown) => {
  if (!value || typeof value !== "object") return false;

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.requestId === "number" &&
    (typeof payload.requesterId === "number" ||
      typeof payload.requesterNickname === "string")
  );
};

const getDerivedRoomPreview = (value: unknown) => {
  if (!value || typeof value !== "object") return null;

  const payload = value as Record<string, unknown>;
  const roomId = payload.derivedRoomId ?? payload.linkedRoomId;
  const roomName = payload.roomName ?? payload.linkedRoomName;

  if (
    typeof roomId !== "number" ||
    typeof roomName !== "string" ||
    !roomName.trim()
  ) {
    return null;
  }

  return "새 단체 톡방을 만들었어요.";
};

export const formatChatMessagePreview = (message: unknown, fallback = "") => {
  const rawMessage = String(message ?? "").trim();
  if (!rawMessage) return fallback;

  if (rawMessage.startsWith("[STUDENT_ID_SHARE_REQUEST:")) {
    return DISCLOSURE_PREVIEWS.request;
  }
  if (rawMessage.startsWith("[STUDENT_ID_SHARE_ACCEPT:")) {
    return DISCLOSURE_PREVIEWS.accept;
  }
  if (rawMessage.startsWith("[STUDENT_ID_SHARE_DECLINE:")) {
    return DISCLOSURE_PREVIEWS.decline;
  }
  if (rawMessage.startsWith("[STUDENT_ID_SHARE_CANCEL:")) {
    return DISCLOSURE_PREVIEWS.cancel;
  }

  if (rawMessage.startsWith("{")) {
    try {
      const payload = JSON.parse(rawMessage) as unknown;
      if (isDisclosureRequestPayload(payload)) {
        return DISCLOSURE_PREVIEWS.request;
      }

      const derivedRoomPreview = getDerivedRoomPreview(payload);
      if (derivedRoomPreview) {
        return derivedRoomPreview;
      }
    } catch {
      return rawMessage;
    }
  }

  return rawMessage;
};
