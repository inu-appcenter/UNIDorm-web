import {
  Client,
  type IMessage,
  type StompHeaders,
  type StompSubscription,
} from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RoommateChat } from "@/types/chats";

interface ChatMessage {
  roommateChattingRoomId: number;
  content: string;
}

type MessageId = string | number;

interface RoommateReadEvent {
  messageId?: MessageId;
  messageIds?: MessageId[];
  readMessageIds?: MessageId[];
  roommateChatIds?: MessageId[];
  unreadCount?: number;
}

interface UseRoommateChatProps {
  roomId: number;
  userId: number;
  token?: string;
  onMessage: (msg: RoommateChat) => void;
  onRead?: (readMessageIds: MessageId[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const parseFrameBody = (frame: IMessage): unknown => {
  try {
    return JSON.parse(frame.body);
  } catch (error) {
    console.error("룸메이트 WebSocket 메시지 파싱 실패:", error);
    return null;
  }
};

const normalizeReadMessageIds = (payload: unknown): MessageId[] => {
  if (Array.isArray(payload)) {
    return payload.filter(
      (value): value is MessageId =>
        typeof value === "string" || typeof value === "number",
    );
  }

  if (!payload || typeof payload !== "object") return [];

  const event = payload as RoommateReadEvent;
  const ids = event.readMessageIds ?? event.messageIds ?? event.roommateChatIds;

  if (Array.isArray(ids)) {
    return ids.filter(
      (value): value is MessageId =>
        typeof value === "string" || typeof value === "number",
    );
  }

  // 일부 서버 버전은 오픈채팅과 같은 단일 메시지 읽음 이벤트를 보낸다.
  // 1:1 룸메이트 채팅에서는 unreadCount가 0일 때 상대방이 읽은 상태다.
  if (
    event.messageId !== undefined &&
    (event.unreadCount === undefined || event.unreadCount === 0)
  ) {
    return [event.messageId];
  }

  return [];
};

export const useRoommateChat = ({
  roomId,
  userId,
  token,
  onMessage,
  onRead,
  onConnect,
  onDisconnect,
}: UseRoommateChatProps) => {
  const clientRef = useRef<Client | null>(null);
  const messageSubscriptionRef = useRef<StompSubscription | null>(null);
  const readSubscriptionRef = useRef<StompSubscription | null>(null);
  const [connected, setConnected] = useState(false);

  const onMessageRef = useRef(onMessage);
  const onReadRef = useRef(onRead);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onReadRef.current = onRead;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
  }, [onConnect, onDisconnect, onMessage, onRead]);

  const disconnect = useCallback(() => {
    const client = clientRef.current;
    clientRef.current = null;
    messageSubscriptionRef.current = null;
    readSubscriptionRef.current = null;
    setConnected(false);

    if (!client) return;

    void client.deactivate().finally(() => {
      onDisconnectRef.current?.();
    });
  }, []);

  const connect = useCallback(() => {
    if (clientRef.current?.active) return;

    const authorizationHeaders: StompHeaders = token
      ? { Authorization: `Bearer ${token}` }
      : {};
    const client = new Client({
      brokerURL: `wss://${import.meta.env.VITE_API_SUBDOMAIN}.inuappcenter.kr/ws-stomp`,
      connectHeaders: authorizationHeaders,
      reconnectDelay: 5_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      onConnect: () => {
        setConnected(true);

        messageSubscriptionRef.current = client.subscribe(
          `/sub/roommate/chat/${roomId}`,
          (frame) => {
            const payload = parseFrameBody(frame);
            if (payload) onMessageRef.current(payload as RoommateChat);
          },
          authorizationHeaders,
        );

        if (onReadRef.current) {
          readSubscriptionRef.current = client.subscribe(
            `/sub/roommate/chat/read/${roomId}/user/${userId}`,
            (frame) => {
              const payload = parseFrameBody(frame);
              const readMessageIds = normalizeReadMessageIds(payload);
              if (readMessageIds.length > 0) {
                onReadRef.current?.(readMessageIds);
              }
            },
            authorizationHeaders,
          );
        }

        onConnectRef.current?.();
      },
      onStompError: (frame) => {
        console.error(
          "룸메이트 STOMP 오류:",
          frame.headers.message || frame.body,
        );
      },
      onWebSocketError: (error) => {
        console.error("룸메이트 WebSocket 오류:", error);
      },
      onWebSocketClose: () => {
        setConnected(false);
        // reconnectDelay가 설정되어 있어 예기치 않은 종료 시 자동 재연결된다.
      },
    });

    clientRef.current = client;
    client.activate();
  }, [roomId, token, userId]);

  const sendMessage = useCallback(
    (content: string) => {
      const client = clientRef.current;
      if (!client?.connected) {
        console.warn("❌ Roommate WebSocket is not connected.");
        return;
      }

      const message: ChatMessage = {
        roommateChattingRoomId: roomId,
        content,
      };

      client.publish({
        destination: "/pub/roommate/socketchat",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify(message),
      });
    },
    [roomId, token],
  );

  useEffect(
    () => () => {
      disconnect();
    },
    [disconnect, roomId, userId],
  );

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: connected,
  };
};
