import styled from "styled-components";
import Tab from "../components/chat/Tab.tsx";
import RoomMateItem from "../components/chat/ChatListItem.tsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatListPage() {
  const navigate = useNavigate();
  const tabItems = ["룸메", "공구"];
  const [selectedTab, setSelectedTab] = useState("룸메");

  const handleChatClick = () => {
    if (selectedTab === "룸메") {
      navigate("/chat/roommate/1");
    } else if (selectedTab === "공구") {
      navigate("/chat/groupPurchase/1");
    }
  };
  return (
    <ChatListPageWrapper>
      <ContentWrapper>
        <Tab
          tabItems={tabItems}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
        <RoomMateItem selectedTab={selectedTab} onClick={handleChatClick} />
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
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  height: 100%;
  box-sizing: border-box;
`;
