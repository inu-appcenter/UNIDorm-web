import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";

const mockBoard = [
  {
    type: "공지사항",
    title: "기숙사 공지사항입니다",
    content: "기숙사 전쟁나썽요!!!!!",
    isEmergency: true,
    scrapCount: 121,
  },
  {
    type: "공지사항",
    title: "21학번 2긱",
    content: "기숙사 상주기간: 월, 화, 수/ 단과대: 법학부/ 엠비티아...",
    isEmergency: true,
    scrapCount: 121,
  },
];
export default function RoomMateListPage() {
  return (
    <RoomMateListPageWrapper>
      <TitleContentArea
        type={"최신순"}
        children={
          <>
            <RoomMateCard
              title={mockBoard[1].title}
              content={mockBoard[1].content}
              commentCount={10}
              likeCount={11}
            />{" "}
            <RoomMateCard
              title={mockBoard[1].title}
              content={mockBoard[1].content}
              commentCount={10}
              likeCount={11}
            />{" "}
            <RoomMateCard
              title={mockBoard[1].title}
              content={mockBoard[1].content}
              commentCount={10}
              likeCount={11}
            />{" "}
            <RoomMateCard
              title={mockBoard[1].title}
              content={mockBoard[1].content}
              commentCount={10}
              likeCount={11}
            />{" "}
            <RoomMateCard
              title={mockBoard[1].title}
              content={mockBoard[1].content}
              commentCount={10}
              likeCount={11}
            />{" "}
            <RoomMateCard
              title={mockBoard[1].title}
              content={mockBoard[1].content}
              commentCount={10}
              likeCount={11}
            />{" "}
            <RoomMateCard
              title={mockBoard[1].title}
              content={mockBoard[1].content}
              commentCount={10}
              likeCount={11}
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
