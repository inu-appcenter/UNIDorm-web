import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { GroupOrderChatRoom, RoommateChatRoom } from "@/types/chats";
import {
  getGroupOrderChatRooms,
  getRoommateChatRooms,
  patchRoommateChatRead, // API 임포트
} from "@/apis/chat";
import ChatListItem from "../../components/chat/ChatListItem.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import BottomBar from "../../components/common/BottomBar/BottomBar.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

export default function ChatListPage() {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken ?? "");

  const [selectedTab] = useState("룸메이트"); // 탭 로직 유지

  const [groupOrderChatRooms, setGroupOrderChatRooms] = useState<
    GroupOrderChatRoom[]
  >([]);
  const [roommateChatRooms, setRoommateChatRooms] = useState<
    RoommateChatRoom[]
  >([]);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (selectedTab === "공동구매") {
      getGroupOrderChatRooms()
        .then((res) => {
          setGroupOrderChatRooms(res.data);
        })
        .catch((err) => {
          console.error("공동구매 채팅방 목록 조회 실패", err);
        });
    } else if (selectedTab === "룸메이트") {
      getRoommateChatRooms()
        .then((res) => {
          setRoommateChatRooms(res.data);
        })
        .catch((err) => {
          console.error("룸메이트 채팅방 목록 조회 실패", err);
        });
    }
  }, [selectedTab, isLoggedIn]);

  const handleChatClick = async (
    chatRoomId: number,
    partnerName?: string,
    partnerProfileImageUrl?: string,
  ) => {
    if (selectedTab === "룸메이트") {
      try {
        // 채팅방 진입 시 읽음 처리 API 호출
        await patchRoommateChatRead(chatRoomId);
      } catch (err) {
        console.error("채팅 읽음 처리 실패", err);
        // 에러가 나더라도 채팅방 입장은 가능하게 할지 여부에 따라 처리
      }

      navigate(`/chat/roommate/${chatRoomId}`, {
        state: { partnerName, partnerProfileImageUrl },
      });
    } else if (selectedTab === "공동구매") {
      navigate(`/chat/groupPurchase/${chatRoomId}`);
    }
  };

  useSetHeader({
    title: "채팅",
    showAlarm: true,
  });

  return (
    <ChatListPageWrapper>
      <ContentWrapper>
        {selectedTab === "공동구매" ? (
          groupOrderChatRooms.length > 0 ? (
            groupOrderChatRooms.map((room) => (
              <ChatListItem
                key={room.chatRoomId}
                chatRoomId={room.chatRoomId} // ID 전달
                selectedTab={selectedTab}
                onClick={() => handleChatClick(room.chatRoomId)}
                title={room.chatRoomTitle}
                message={room.recentChatContent}
                time={room.recentChatTime}
                currentPeople={room.currentPeople}
                maxPeople={room.maxPeople}
                deadline={room.deadline}
              />
            ))
          ) : (
            <EmptyMessage>
              {isLoggedIn ? (
                <>
                  아직 공동구매 채팅이 없습니다. <br />
                  <br /> 지금 바로 공동구매 탭으로 이동해서
                  <br />
                  같이 살 물건을 찾아보세요!
                </>
              ) : (
                <>
                  공동구매 채팅 목록을 확인하려면 <br />
                  로그인이 필요합니다.
                  <br />
                  <br />
                  <span className="login">로그인하러 가기</span>
                </>
              )}
            </EmptyMessage>
          )
        ) : roommateChatRooms.length > 0 ? (
          roommateChatRooms.map((room) => (
            <ChatListItem
              key={room.chatRoomId}
              chatRoomId={room.chatRoomId} // ID 전달
              selectedTab={selectedTab}
              onClick={() =>
                handleChatClick(
                  room.chatRoomId,
                  room.partnerName,
                  room.partnerProfileImageUrl,
                )
              }
              title={room.partnerName}
              message={room.lastMessage}
              time={room.lastMessageTime}
              partnerProfileImageUrl={room.partnerProfileImageUrl}
            />
          ))
        ) : (
          <EmptyMessage>
            {isLoggedIn ? (
              <>
                아직 룸메이트 채팅이 없습니다.
                <br />
                <br />
                지금 바로 룸메이트 탭으로 이동해서
                <br />
                룸메이트를 찾아보세요!
              </>
            ) : (
              <>
                룸메이트 채팅 목록을 확인하려면 <br />
                로그인이 필요합니다.
                <br />
                <br />
                <span
                  className="login"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  로그인하러 가기
                </span>
              </>
            )}
          </EmptyMessage>
        )}
      </ContentWrapper>
      <BottomBar />
    </ChatListPageWrapper>
  );
}

const ChatListPageWrapper = styled.div`
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
  flex: 1;
  overflow-y: auto;

  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const ContentWrapper = styled.div`
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #777;
  font-size: 15px;
  line-height: 1.6;

  .login {
    color: #0070f3;
    cursor: pointer;
    text-decoration: underline;
  }
`;
