import styled from "styled-components";
import RoomMateItem from "../../components/chat/ChatListItem.tsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header.tsx";
import Tab from "../../components/chat/Tab.tsx";

export default function ChatListPage() {
  const navigate = useNavigate();
  const tabItems = ["룸메이트", "공동구매"];
  const [selectedTab, setSelectedTab] = useState("룸메이트");

  const handleChatClick = () => {
    if (selectedTab === "룸메") {
      navigate("/chat/roommate/1");
    } else if (selectedTab === "공동구매") {
      navigate("/chat/groupPurchase/1");
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
  padding-top: 50px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  height: 100%;
  box-sizing: border-box;
`;
