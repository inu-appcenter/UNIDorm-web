import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ChatInfo from "../../components/chat/ChatInfo.tsx";
import ChatItemOtherPerson from "../../components/chat/ChatItemOtherPerson.tsx";
import ChatItemMy from "../../components/chat/ChatItemMy.tsx";
import send from "../../assets/chat/send.svg";
import { useRoommateChat } from "./useRoommateChat.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { getRoommateChatHistory } from "../../apis/chat.ts";
import { deleteRoommateChatRoom } from "../../apis/roommate.ts";
import TopNoticeBanner from "../../components/chat/TopNoticeBanner.tsx";

type MessageType = {
  id: number;
  sender: "me" | "other";
  content: string;
  time: string;
};

export default function ChattingPage() {
  const isLeavingRef = useRef(false);

  const { chatType, id } = useParams();
  const [typeString, setTypeString] = useState<string>("");
  const [messageList, setMessageList] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const { tokenInfo, userInfo } = useUserStore();
  const navigate = useNavigate();

  const location = useLocation();
  // navigate 시 넘긴 state 객체에서 partnerName 꺼내기
  const partnerName = location.state?.partnerName ?? undefined;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const roomId = Number(id);
  const userId = userInfo.id;
  const token = tokenInfo.accessToken;

  const { connect, disconnect, sendMessage, isConnected } = useRoommateChat({
    roomId,
    userId,
    token,
    onMessage: (msg) => {
      setMessageList((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "other",
          content: msg.content,
          time: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        },
      ]);
      scrollToBottom();
    },
    onConnect: () => {
      console.log("✅ WebSocket 연결됨");
    },
    onDisconnect: () => {
      console.log("🛑 WebSocket 연결 해제됨");
      if (!isLeavingRef.current) {
        alert(
          "실시간 채팅 연결이 끊어졌습니다.\n현재 페이지를 새로고침합니다.",
        );
        window.location.reload();
      }
    },
  });

  useEffect(() => {
    const init = async () => {
      if (chatType === "roommate") {
        setTypeString("룸메이트");

        try {
          const response = await getRoommateChatHistory(roomId);
          const chats = response.data;

          const formattedMessages: MessageType[] = chats.map((chat) => ({
            id: chat.roommateChatId,
            sender: chat.userId === userId ? "me" : "other",
            content: chat.content,
            time: new Date(chat.createdDate).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          }));

          setMessageList(formattedMessages);
          scrollToBottom();
        } catch (error) {
          console.error("채팅 내역 불러오기 실패:", error);
        }

        connect(); // WebSocket 연결
      } else if (chatType === "groupPurchase") {
        setTypeString("공동구매");
        // 추후 WebSocket 연결
      }
    };

    init();

    return () => {
      isLeavingRef.current = true; // 페이지 떠나는 상태로 설정
      if (isConnected) {
        disconnect();
      }
    };
  }, [chatType]);

  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      const newHeight = Math.min(el.scrollHeight, 96);
      el.style.height = `${newHeight}px`;
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // ✅ 웹소켓 연결 상태 확인
    if (!isConnected) {
      console.error("웹소켓이 연결되지 않았습니다. 메시지를 보낼 수 없습니다.");
      alert(
        "메시지 전송 실패!\n채팅방을 나갔다가 다시 들어와서 시도해 보세요.",
      );
      // 사용자에게 메시지 전송 실패를 알리는 추가 로직 (예: 알림창)
      return;
    }

    const now = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newMessage: MessageType = {
      id: Date.now(),
      sender: "me",
      content: inputValue.trim(),
      time: now,
    };

    setMessageList((prev) => [...prev, newMessage]);
    sendMessage(inputValue.trim()); // ✅ WebSocket 전송
    setInputValue("");

    if (inputRef.current) inputRef.current.style.height = "auto";

    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo?.({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
        // fallback
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  };

  const menuItems = [
    {
      label: "사전 체크리스트 보기",
      onClick: async () => {
        navigate("/roommatelist/opponent", { state: { partnerName, roomId } });
      },
    },
    {
      label: "채팅방 나가기",
      onClick: async () => {
        const confirmed = window.confirm(
          "정말 채팅방을 나갈까요?\n서로에게 더 이상 채팅방이 보이지 않습니다.",
        );
        if (!confirmed) return;
        try {
          if (roomId === undefined)
            throw new Error("채팅방 id가 undefined입니다.");
          const response = await deleteRoommateChatRoom(roomId);
          if (response.status === 201) {
            alert("채팅방에서 나왔어요.");
            console.log("채팅방 나가기 성공, 채팅방이 삭제되었습니다.");
            // 추가 처리(예: 화면 이동, 상태 업데이트 등)
            navigate("/chat");
          }
        } catch (error: any) {
          alert("채팅방 나가기를 실패했어요." + error);
          if (error.response) {
            if (error.response.status === 403) {
              console.error("게스트가 아닌 사용자의 접근입니다.");
            } else if (error.response.status === 404) {
              console.error("유저 또는 채팅방을 찾을 수 없습니다.");
            } else {
              console.error("알 수 없는 오류가 발생했습니다.");
            }
          } else {
            console.error("네트워크 오류 또는 서버 응답 없음");
          }
        }
      },
    },
  ];

  return (
    <ChatPageWrapper>
      <Header
        hasBack={true}
        title={typeString + " 채팅"}
        menuItems={menuItems}
      />
      <ContentWrapper>
        <ChatInfo
          selectedTab={typeString}
          partnerName={partnerName}
          roomId={roomId}
          isChatted={messageList.length > 0}
        />
        <div
          style={{
            marginTop: "10px",
            marginBottom: "10px",
            width: "100%",
            height: "fit-content",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TopNoticeBanner
            message={
              messageList.length > 0
                ? "서로 룸메이트를 하기로 마음먹었다면,\n룸메 신청 버튼을 눌러 룸메이트가 되어보세요!"
                : "자유롭게 채팅을 나누며 서로를 알아가보세요!"
            }
          />
        </div>

        <ChattingWrapper ref={scrollRef}>
          {messageList.map((msg) =>
            msg.sender === "me" ? (
              <ChatItemMy key={msg.id} content={msg.content} time={msg.time} />
            ) : (
              <ChatItemOtherPerson
                key={msg.id}
                content={msg.content}
                time={msg.time}
              />
            ),
          )}
        </ChattingWrapper>
        <InputArea>
          <Input
            placeholder={"메시지 입력"}
            ref={inputRef}
            onInput={handleInput}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <SendButton onClick={handleSendMessage}>
            <img src={send} alt={"send"} />
          </SendButton>
        </InputArea>
      </ContentWrapper>
    </ChatPageWrapper>
  );
}

const ChatPageWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 70px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  //padding-bottom: 70px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  background: #f4f4f4;
`;

const ChattingWrapper = styled.div`
  flex: 1;
  height: 100%;

  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  background: #f4f4f4;

  padding-bottom: 56px;
`;
const InputArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: fit-content;
  min-height: 56px;

  background-color: #fafafa;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  padding: 8px 16px;
  box-sizing: border-box;

  gap: 8px;
`;

const Input = styled.textarea`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px;
  box-sizing: border-box;
  gap: 10px;

  width: 100%;
  height: 100%;

  background: #ffffff;
  border-radius: 4px;
  border: none;

  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;

  letter-spacing: 0.38px;

  color: #1c1c1e;
`;
const SendButton = styled.button`
  background: none;
  border: none;
`;
