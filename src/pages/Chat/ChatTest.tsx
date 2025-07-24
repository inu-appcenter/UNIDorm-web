import { useState } from "react";
import { useRoommateChat } from "./useRoommateChat.ts";

const ChatTest = ({ roomId, userId }: { roomId: number; userId: number }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const { sendMessage } = useRoommateChat({
    roomId,
    userId,
    onMessageReceive: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
    onReadUpdate: (ids) => {
      console.log("읽음 처리됨:", ids);
    },
  });

  const handleSend = () => {
    if (input.trim() === "") return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div>
      <div style={{ height: 300, overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div key={idx}>{msg.content}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="메시지를 입력하세요"
      />
      <button onClick={handleSend}>전송</button>
    </div>
  );
};

export default ChatTest;
