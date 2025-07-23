import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GroupOrderChatRoom } from "../../types/chats";
import { getGroupOrderChatRooms } from "../../apis/chat.ts";
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

  useEffect(() => {
    if (selectedTab === "공동구매") {
      getGroupOrderChatRooms()
        .then((res) => {
          setGroupOrderChatRooms(res.data);
        })
        .catch((err) => {
          console.error("공동구매 채팅방 목록 조회 실패", err);
        });
    }
  }, [selectedTab]);

  const handleChatClick = (chatRoomId: number) => {
    if (selectedTab === "룸메이트") {
      navigate("/chat/roommate/1");
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
          <ChatListItem
            selectedTab={selectedTab}
            onClick={() => handleChatClick(1)}
          />
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
