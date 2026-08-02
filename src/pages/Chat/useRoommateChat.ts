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
  readMessageId?: MessageId;
  lastReadMessageId?: MessageId;
  roommateChatId?: MessageId;
  messageIds?: MessageId[];
  readMessageIds?: MessageId[];
  roommateChatIds?: MessageId[];
  unreadCount?: number;
  read?: boolean;
  isRead?: boolean;
  data?: unknown;
}

interface RoommateReadUpdate {
  messageIds: MessageId[];
  lastReadMessageId?: MessageId;
  markAll: boolean;
}

interface UseRoommateChatProps {
  roomId: number;
  userId: number;
  token?: string;
  enabled?: boolean;
  onMessage: (msg: RoommateChat) => void;
  onRead?: (update: RoommateReadUpdate) => void;
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

const isMessageId = (value: unknown): value is MessageId =>
  typeof value === "string" || typeof value === "number";

const normalizeReadEvent = (payload: unknown): RoommateReadUpdate => {
  if (Array.isArray(payload)) {
    const messageIds = payload.filter(isMessageId);
    return {
      messageIds,
      lastReadMessageId: messageIds.at(-1),
      markAll: false,
    };
  }

  if (isMessageId(payload)) {
    return {
      messageIds: [payload],
      lastReadMessageId: payload,
      markAll: false,
    };
  }

  if (!payload || typeof payload !== "object") {
    return { messageIds: [], markAll: payload === true };
  }

  const event = payload as RoommateReadEvent;
  if (event.data !== undefined) {
    return normalizeReadEvent(event.data);
  }

  const ids = event.readMessageIds ?? event.messageIds ?? event.roommateChatIds;

  if (Array.isArray(ids)) {
    const messageIds = ids.filter(isMessageId);
    return {
      messageIds,
      lastReadMessageId: event.lastReadMessageId ?? messageIds.at(-1),
      markAll: false,
    };
  }

  // 일부 서버 버전은 오픈채팅과 같은 단일 메시지 읽음 이벤트를 보낸다.
  // 1:1 룸메이트 채팅에서는 unreadCount가 0일 때 상대방이 읽은 상태다.
  const lastReadMessageId =
    event.lastReadMessageId ??
    event.readMessageId ??
    event.messageId ??
    event.roommateChatId;

  if (
    isMessageId(lastReadMessageId) &&
    (event.unreadCount === undefined || event.unreadCount === 0)
  ) {
    return {
      messageIds: [lastReadMessageId],
      lastReadMessageId,
      markAll: false,
    };
  }

  return {
    messageIds: [],
    // 이 콜백은 읽음 전용 채널에서만 실행된다. 구형 서버처럼 ID 없이
    // 사용자/방 정보만 보내는 이벤트도 1:1 방에서는 전체 읽음 신호다.
    markAll:
      event.read === true ||
      event.isRead === true ||
      event.unreadCount === undefined ||
      event.unreadCount === 0,
  };
};

export const useRoommateChat = ({
  roomId,
  userId,
  token,
  enabled = true,
  onMessage,
  onRead,
  onConnect,
  onDisconnect,
}: UseRoommateChatProps) => {
  const clientRef = useRef<Client | null>(null);
  const messageSubscriptionRef = useRef<StompSubscription | null>(null);
  const readSubscriptionRefs = useRef<StompSubscription[]>([]);
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
    readSubscriptionRefs.current = [];
    setConnected(false);

    if (!client) return;

    void client.deactivate().finally(() => {
      onDisconnectRef.current?.();
    });
  }, []);

  const connect = useCallback(() => {
    if (clientRef.current?.active) return;
    if (
      !enabled ||
      !token ||
      !Number.isFinite(roomId) ||
      roomId <= 0 ||
      userId <= 0
    ) {
      return;
    }

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
          const handleReadFrame = (frame: IMessage) => {
            const update = normalizeReadEvent(parseFrameBody(frame));
            if (
              update.messageIds.length > 0 ||
              update.lastReadMessageId !== undefined ||
              update.markAll
            ) {
              onReadRef.current?.(update);
            }
          };

          // 서버 버전에 따라 사용자별 채널 또는 방 단위 채널로 읽음 이벤트가 온다.
          // 두 채널의 중복 이벤트는 동일한 메시지를 읽음 처리하므로 안전하다.
          readSubscriptionRefs.current = [
            `/sub/roommate/chat/read/${roomId}/user/${userId}`,
            `/sub/roommate/chat/${roomId}/read`,
          ].map((destination) =>
            client.subscribe(
              destination,
              handleReadFrame,
              authorizationHeaders,
            ),
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
  }, [enabled, roomId, token, userId]);

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

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, enabled, roomId, token, userId]);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: connected,
  };
};
