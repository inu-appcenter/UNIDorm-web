import { useEffect, useRef, useState } from "react";
import useUserStore from "../../stores/useUserStore.ts";

interface ChatMessage {
  roommateChattingRoomId: number;
  content: string;
}

interface UseRoommateChatProps {
  roomId: number;
  userId: number;
  token?: string;
  onMessage: (msg: any) => void;
  onRead?: (readMessageIds: string[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useRoommateChat = ({
  roomId,
  userId,
  token,
  onMessage,
  onRead,
  onConnect,
  onDisconnect,
}: UseRoommateChatProps) => {
  const { userInfo } = useUserStore();

  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const subscriptions = useRef<string[]>([]);
  const callbacks = useRef<Record<string, (msg: any) => void>>({});
  const pendingSubscriptions = useRef<string[]>([]);

  const stompSend = (destination: string, body: any) => {
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

    console.log("📡 [STOMP SEND FRAME]:", frame); // 로그 추가
    wsRef.current.send(frame);
  };

  const connect = () => {
    if (connected || wsRef.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(
      "wss://unidorm-server.inuappcenter.kr/ws-stomp",
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

        // 연결 완료 후 구독 처리
        pendingSubscriptions.current.forEach((dest) => {
          doSubscribe(dest);
        });
        pendingSubscriptions.current = [];
      } else if (data.startsWith("MESSAGE")) {
        const headersEnd = data.indexOf("\n\n");
        const headersStr = data.substring(0, headersEnd);
        const body = data.substring(headersEnd + 2, data.length - 1); // \u0000 제거

        const destination = (headersStr.match(/destination:(.+)/) ||
          [])[1]?.trim();
        if (!destination) return;

        try {
          const parsed = JSON.parse(body);
          console.log("📩 [RECEIVED MESSAGE]:", parsed); // 로그 추가
          if (parsed.userId === userInfo.id) {
            return;
          }
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

  const subscribe = (destination: string, callback: (msg: any) => void) => {
    if (subscriptions.current.includes(destination)) return;

    callbacks.current[destination] = callback;

    if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
      doSubscribe(destination);
    } else {
      pendingSubscriptions.current.push(destination);
    }
  };

  const sendMessage = (content: string) => {
    const message: ChatMessage = {
      roommateChattingRoomId: roomId,
      content,
    };

    console.log("📤 [SEND] 메시지 전송:", message); // 로그 추가
    console.log(roomId, userId, token);
    stompSend("/pub/roommate/socketchat", message);
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
    // 자동 구독 등록
    subscribe(`/sub/roommate/chat/${roomId}`, onMessage);
    if (onRead) {
      subscribe(`/sub/roommate/chat/read/${roomId}/user/${userId}`, onRead);
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
