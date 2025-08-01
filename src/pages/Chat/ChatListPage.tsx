import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GroupOrderChatRoom, RoommateChatRoom } from "../../types/chats";
import {
  getGroupOrderChatRooms,
  getRoommateChatRooms,
} from "../../apis/chat.ts";
import Header from "../../components/common/Header.tsx";
import Tab from "../../components/chat/Tab.tsx";
import ChatListItem from "../../components/chat/ChatListItem.tsx";
import styled from "styled-components";
import useUserStore from "../../stores/useUserStore.ts";

export default function ChatListPage() {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken ?? "");

  const tabItems = ["룸메이트", "공동구매"];
  const [selectedTab, setSelectedTab] = useState("룸메이트");

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
  }, [selectedTab, isLoggedIn]); // isLoggedIn도 dependency에 추가

  const handleChatClick = (chatRoomId: number, partnerName?: string) => {
    if (selectedTab === "룸메이트") {
      // partnerName을 쿼리 파라미터나 state로 넘길 수도 있고, URL 경로에 포함할 수도 있습니다.
      // 예시: state로 넘기기
      navigate(`/chat/roommate/${chatRoomId}`, { state: { partnerName } });
    } else if (selectedTab === "공동구매") {
      navigate(`/chat/groupPurchase/${chatRoomId}`);
    }
  };

  return (
    <ChatListPageWrapper>
      <Header
        title="채팅"
        hasBack={false}
        showAlarm={true}
        secondHeader={
          <Tab
            tabItems={tabItems}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        }
      />

      <ContentWrapper>
        {selectedTab === "공동구매" ? (
          groupOrderChatRooms.length > 0 ? (
            groupOrderChatRooms.map((room) => (
              <ChatListItem
                key={room.chatRoomId}
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
              selectedTab={selectedTab}
              onClick={() => handleChatClick(room.chatRoomId, room.partnerName)}
              title={room.partnerName}
              message={room.lastMessage}
              time={room.lastMessageTime}
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
    </ChatListPageWrapper>
  );
}

const ChatListPageWrapper = styled.div`
  padding: 70px 0;

  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  padding-top: 50px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
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
