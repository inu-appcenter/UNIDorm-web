import { useEffect, useRef, useState } from "react";
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

  const connect = () => {
    if (connected || wsRef.current?.readyState === WebSocket.OPEN) return;

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
        onConnect?.();

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
          const callback = callbacks.current[destination];

          if (callback) {
            callback(parsed);
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
      onDisconnect?.();
    };

    socket.onerror = (e) => {
      console.error("WebSocket error", e);
    };
  };

  const doSubscribe = (destination: string) => {
    const id = Math.random().toString(36).substring(2, 10);
    const frame =
      `SUBSCRIBE\nid:${id}\ndestination:${destination}\n` +
      (token ? `Authorization:Bearer ${token}\n` : ``) +
      `\n\u0000`;
    wsRef.current?.send(frame);
    subscriptions.current.push(destination);
  };

  const subscribe = (
    destination: string,
    callback: (payload: unknown) => void,
  ) => {
    if (subscriptions.current.includes(destination)) return;

    callbacks.current[destination] = callback;

    if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
      doSubscribe(destination);
    } else {
      pendingSubscriptions.current.push(destination);
    }
  };

  const sendMessage = (content: string) => {
    const message: OpenChatMessagePayload = {
      roomId,
      content,
    };

    console.log("📤 [SEND] 오픈채팅 메시지 전송:", message);
    stompSend("/pub/openchat/socketchat", message);
  };

  const disconnect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send("DISCONNECT\n\n\u0000");
      wsRef.current.close();
    }
    subscriptions.current = [];
    pendingSubscriptions.current = [];
    callbacks.current = {};
    setConnected(false);
  };

  useEffect(() => {
    subscribe(`/sub/openchat/${roomId}`, (payload) =>
      onMessage(payload as OpenChatMessage),
    );
    if (onRead) {
      subscribe(`/sub/openchat/${roomId}/read`, (payload) =>
        onRead(payload as OpenChatReadEvent),
      );
    }

    return () => {
      disconnect();
    };
  }, [roomId, userId]);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: connected,
  };
};
