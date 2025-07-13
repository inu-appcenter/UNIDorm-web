import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";
import Header from "../../components/common/Header.tsx";

const mockBoard = [
  {
    type: "공지사항",
    title: "21학번 2긱",
    content: "기숙사 상주기간: 월, 화, 수/ 단과대: 법학부/ 엠비티아...",
    isEmergency: true,
    scrapCount: 121,
  },
];
export default function RoomMatePage() {
  return (
    <RoomMatePageWrapper>
      <Header title="룸메이트" hasBack={false} showAlarm={true} />
      <TitleContentArea
        type={"최신순"}
        link={"/roommatelist"}
        children={
          <>
            <RoomMateCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              commentCount={10}
              likeCount={11}
            />
            <RoomMateCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              commentCount={10}
              likeCount={11}
            />
          </>
        }
      />{" "}
      <TitleContentArea
        type={"나와 비슷한 룸메"}
        children={
          <>
            <RoomMateCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              percentage={100}
              commentCount={10}
              likeCount={11}
            />{" "}
            <RoomMateCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              percentage={100}
              commentCount={10}
              likeCount={11}
            />{" "}
            <RoomMateCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              percentage={100}
              commentCount={10}
              likeCount={11}
            />{" "}
            <RoomMateCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              percentage={100}
              commentCount={10}
              likeCount={11}
            />{" "}
            <RoomMateCard
              title={mockBoard[0].title}
              content={mockBoard[0].content}
              percentage={100}
              commentCount={10}
              likeCount={11}
            />
          </>
        }
      />
    </RoomMatePageWrapper>
  );
}

const RoomMatePageWrapper = styled.div`
  padding: 90px 16px;

  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;

  background: #fafafa;
`;
