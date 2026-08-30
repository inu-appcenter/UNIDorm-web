import { useCallback, useEffect, useRef, useState } from "react";
import type { OpenChatMessage, OpenChatReadEvent } from "@/types/openchat";

interface OpenChatMessagePayload {
  roomId: number;
  content: string;
}

interface UseOpenChatProps {
  roomId: number;
  userId: number;
  token?: string;
  onMessage: (msg: OpenChatMessage) => void;
  onRead?: (event: OpenChatReadEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useOpenChat = ({
  roomId,
  userId,
  token,
  onMessage,
  onRead,
  onConnect,
  onDisconnect,
}: UseOpenChatProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const subscriptions = useRef<string[]>([]);
  const callbacks = useRef<Record<string, (payload: unknown) => void>>({});
  const pendingSubscriptions = useRef<string[]>([]);
  const isManualDisconnect = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onMessageRef = useRef(onMessage);
  const onReadRef = useRef(onRead);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onReadRef.current = onRead;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
  }, [onMessage, onRead, onConnect, onDisconnect]);

  const stompSend = (destination: string, body: unknown) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("❌ WebSocket is not connected.");
      return;
    }

    const frame =
      `SEND\n` +
      `destination:${destination}\n` +
      (token ? `Authorization:Bearer ${token}\n` : ``) +
      `content-type:application/json\n\n` +
      `${JSON.stringify(body)}\u0000`;

    console.log("📡 [STOMP SEND FRAME]:", frame);
    wsRef.current.send(frame);
  };

  const doSubscribe = (destination: string) => {
    const id = Math.random().toString(36).substring(2, 10);
    const frame =
      `SUBSCRIBE\nid:${id}\ndestination:${destination}\n` +
      (token ? `Authorization:Bearer ${token}\n` : ``) +
      `\n\u0000`;
    wsRef.current?.send(frame);
    if (!subscriptions.current.includes(destination)) {
      subscriptions.current.push(destination);
    }
  };

  const connect = useCallback(() => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }
    if (!token || !roomId || !userId) return;

    isManualDisconnect.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const socket = new WebSocket(
      `wss://${import.meta.env.VITE_API_SUBDOMAIN}.inuappcenter.kr/ws-stomp`,
    );

    wsRef.current = socket;

    socket.onopen = () => {
      const connectFrame =
        `CONNECT\naccept-version:1.2\nheart-beat:10000,10000\n` +
        (token ? `Authorization:Bearer ${token}\n` : ``) +
        `\n\u0000`;
      socket.send(connectFrame);
    };

    socket.onmessage = (event) => {
      const data = event.data;

      if (data.startsWith("CONNECTED")) {
        setConnected(true);
        onConnectRef.current?.();

        subscriptions.current = [];
        doSubscribe(`/sub/openchat/${roomId}`);
        doSubscribe(`/sub/openchat/${roomId}/read`);

        pendingSubscriptions.current.forEach((dest) => {
          doSubscribe(dest);
        });
        pendingSubscriptions.current = [];
      } else if (data.startsWith("MESSAGE")) {
        const headersEnd = data.indexOf("\n\n");
        const headersStr = data.substring(0, headersEnd);
        const body = data.substring(headersEnd + 2, data.length - 1);

        const destination = (headersStr.match(/destination:(.+)/) ||
          [])[1]?.trim();
        if (!destination) return;

        try {
          const parsed = JSON.parse(body);
          console.log("📩 [RECEIVED MESSAGE]:", parsed);

          if (destination === `/sub/openchat/${roomId}`) {
            onMessageRef.current?.(parsed as OpenChatMessage);
          } else if (destination === `/sub/openchat/${roomId}/read`) {
            onReadRef.current?.(parsed as OpenChatReadEvent);
          } else {
            const callback = callbacks.current[destination];
            if (callback) {
              callback(parsed);
            }
          }
        } catch (e) {
          console.error("메시지 파싱 실패:", e);
        }
      } else if (data.startsWith("ERROR")) {
        console.error("STOMP ERROR", data);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      onDisconnectRef.current?.();

      if (!isManualDisconnect.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    socket.onerror = (e) => {
      console.error("WebSocket error", e);
    };
  }, [roomId, token, userId]);

  const subscribe = (
    destination: string,
    callback: (payload: unknown) => void,
  ) => {
    callbacks.current[destination] = callback;

    if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
      doSubscribe(destination);
    } else {
      if (!pendingSubscriptions.current.includes(destination)) {
        pendingSubscriptions.current.push(destination);
      }
    }
  };

  const waitForConnection = useCallback((timeoutMs = 3000): Promise<boolean> => {
    if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve(true);
    }

    connect();

    return new Promise((resolve) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          resolve(true);
        } else if (Date.now() - startTime >= timeoutMs) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    });
  }, [connect, connected]);

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      const isReady = await waitForConnection(3000);
      if (!isReady || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn("❌ OpenChat WebSocket is not connected after retry.");
        return false;
      }

      const message: OpenChatMessagePayload = {
        roomId,
        content,
      };

      console.log("📤 [SEND] 오픈채팅 메시지 전송:", message);
      stompSend("/pub/openchat/socketchat", message);
      return true;
    },
    [roomId, waitForConnection],
  );

  const sendRead = (lastMessageId?: number | null) => {
    const payload = {
      roomId,
      userId,
      messageId: lastMessageId ?? null,
    };

    console.log("📖 [SEND READ] 오픈채팅 읽음 처리 전송:", payload);
    stompSend("/pub/openchat/read", payload);
  };

  const disconnect = useCallback(() => {
    isManualDisconnect.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send("DISCONNECT\n\n\u0000");
      wsRef.current.close();
    }
    wsRef.current = null;
    subscriptions.current = [];
    pendingSubscriptions.current = [];
    callbacks.current = {};
    setConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    sendMessage,
    sendRead,
    subscribe,
    isConnected: connected,
  };
};
