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

export default function ChatListPage() {
  const navigate = useNavigate();
  const tabItems = ["룸메이트", "공동구매"];
  const [selectedTab, setSelectedTab] = useState("룸메이트");

  const [groupOrderChatRooms, setGroupOrderChatRooms] = useState<
    GroupOrderChatRoom[]
  >([]);
  const [roommateChatRooms, setRoommateChatRooms] = useState<
    RoommateChatRoom[]
  >([]);

  useEffect(() => {
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
  }, [selectedTab]);

  const handleChatClick = (chatRoomId: number) => {
    if (selectedTab === "룸메이트") {
      navigate(`/chat/roommate/${chatRoomId}`);
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
              아직 공동구매 채팅이 없습니다. <br />
              <br /> 지금 바로 공동구매 탭으로 이동해서
              <br />
              같이 살 물건을 찾아보세요!
            </EmptyMessage>
          )
        ) : roommateChatRooms.length > 0 ? (
          roommateChatRooms.map((room) => (
            <ChatListItem
              key={room.chatRoomId}
              selectedTab={selectedTab}
              onClick={() => handleChatClick(room.chatRoomId)}
              title={room.opponentNickname}
              message={room.lastMessage}
              time={room.lastMessageTime}
            />
          ))
        ) : (
          <EmptyMessage>
            아직 룸메이트 채팅이 없습니다.
            <br />
            <br />
            지금 바로 룸메이트 탭으로 이동해서
            <br />
            룸메이트를 찾아보세요!
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
  color: #aaa;
  font-size: 14px;
`;
