// hooks/useRoommateChat.ts
import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

const SOCKET_URL = "https://inu-dormitory-dev.inuappcenter.kr"; // 백엔드에서 제공한 WebSocket 접속 URL로 교체 필요

interface UseRoommateChatProps {
  roomId: number;
  userId: number;
  onMessageReceive: (message: any) => void;
  onReadUpdate?: (readMessageIds: number[]) => void;
}

export const useRoommateChat = ({
  roomId,
  userId,
  onMessageReceive,
  onReadUpdate,
}: UseRoommateChatProps) => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const socket = new SockJS(SOCKET_URL);

    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("[STOMP]", str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("✅ WebSocket 연결 완료");

      // 채팅 수신 구독
      client.subscribe(`/sub/roommate/chat/${roomId}`, (message: IMessage) => {
        const parsed = JSON.parse(message.body);
        onMessageReceive(parsed);
      });

      // 읽음 처리 구독 (옵션)
      if (onReadUpdate) {
        client.subscribe(
          `/sub/roommate/chat/read/${roomId}/user/${userId}`,
          (message: IMessage) => {
            const readMessageIds: number[] = JSON.parse(message.body);
            onReadUpdate(readMessageIds);
          },
        );
      }
    };

    client.onStompError = (frame) => {
      console.error("❌ WebSocket STOMP 에러", frame);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      console.log("🛑 WebSocket 연결 해제");
    };
  }, [roomId, userId]);

  const sendMessage = (content: string) => {
    if (!clientRef.current?.connected) {
      console.warn("WebSocket 연결되지 않음");
      return;
    }

    clientRef.current.publish({
      destination: "/pub/roommate/socketchat",
      body: JSON.stringify({
        roommateChattingRoomId: roomId,
        content,
      }),
    });
  };

  return {
    sendMessage,
  };
};
