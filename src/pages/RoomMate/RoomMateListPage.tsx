import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import HomeCard from "../../components/home/HomeCard.tsx";

const mockBoard = [
  {
    type: "공지사항",
    title: "기숙사 공지사항입니다",
    content: "기숙사 전쟁나썽요!!!!!",
    isEmergency: true,
    scrapCount: 121,
  },
  {
    type: "기숙사 꿀팁",
    title: "기숙사 생활 꿀팁 공유합니다",
    content: "세탁기는 이른 아침에 쓰는 게 제일 한가합니다!",
    isEmergency: false,
    scrapCount: 45,
  },
];
export default function RoomMateListPage() {
  return (
    <RoomMateListPageWrapper>
      <TitleContentArea
        type={"최신순"}
        children={
          <>
            <HomeCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              isEmergency={mockBoard[0].isEmergency}
              scrapCount={mockBoard[0].scrapCount}
            />{" "}
            <HomeCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              isEmergency={mockBoard[0].isEmergency}
              scrapCount={mockBoard[0].scrapCount}
            />{" "}
            <HomeCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              isEmergency={mockBoard[0].isEmergency}
              scrapCount={mockBoard[0].scrapCount}
            />{" "}
            <HomeCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              isEmergency={mockBoard[0].isEmergency}
              scrapCount={mockBoard[0].scrapCount}
            />{" "}
            <HomeCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              isEmergency={mockBoard[0].isEmergency}
              scrapCount={mockBoard[0].scrapCount}
            />{" "}
            <HomeCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              isEmergency={mockBoard[0].isEmergency}
              scrapCount={mockBoard[0].scrapCount}
            />
          </>
        }
      />
    </RoomMateListPageWrapper>
  );
}

const RoomMateListPageWrapper = styled.div`
  padding: 90px 20px;

  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;

  background: #fafafa;
`;
