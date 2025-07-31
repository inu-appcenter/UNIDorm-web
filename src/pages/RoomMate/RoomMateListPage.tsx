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
        title={"최신순"}
        description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}
        children={
          <>
            {roommates.length > 0 ? (
              roommates.map((post) => (
                <RoomMateCard
                  boardId={post.boardId}
                  dormType={post.dormType}
                  mbti={post.mbti}
                  college={post.college}
                  isSmoker={true}
                  isClean={true}
                  stayDays={post.dormPeriod}
                  description={post.comment}
                  commentCount={12}
                  likeCount={8}
                />
              ))
            ) : (
              <EmptyMessage>게시글이 없습니다.</EmptyMessage>
            )}
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

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
`;
