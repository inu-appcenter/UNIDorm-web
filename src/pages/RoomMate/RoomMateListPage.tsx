import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";
import Header from "../../components/common/Header.tsx";
import { getRoomMateList } from "../../apis/roommate.ts";
import { useEffect, useState } from "react";
import { RoommatePost } from "../../types/roommates.ts";

export default function RoomMateListPage() {
  const [roommates, setRoommates] = useState<RoommatePost[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRoomMateList();
        setRoommates(response.data); // API에서 받은 데이터 저장
        console.log(response.data);
      } catch (error) {
        console.error("룸메이트 목록 가져오기 실패:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <RoomMateListPageWrapper>
      <Header title={"룸메이트 둘러보기"} hasBack={true} />
      <TitleContentArea
        type={"최신순"}
        children={
          <>
            {roommates.map((post) => (
              <RoomMateCard
                boardId={post.boardId}
                title={post.title}
                content={post.comment}
                commentCount={0} // 서버에서 제공되면 반영
                likeCount={0} // 서버에서 제공되면 반영
              />
            ))}
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
