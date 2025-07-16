import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";
import Header from "../../components/common/Header.tsx";
import { useEffect, useState } from "react";
import { RoommatePost, SimilarRoommatePost } from "../../types/roommates.ts";
import {
  getRoomMateList,
  getSimilarRoomMateList,
} from "../../apis/roommate.ts";

export default function RoomMatePage() {
  const [roommates, setRoommates] = useState<RoommatePost[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRoomMateList();
        setRoommates(response.data); // API에서 받은 데이터 저장
      } catch (error) {
        console.error("룸메이트 목록 가져오기 실패:", error);
      }
    };

    fetchData();
  }, []);

  const [similarRoommates, setSimilarRoommates] = useState<
    SimilarRoommatePost[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSimilarRoomMateList();
        setSimilarRoommates(response.data);
      } catch (error) {
        console.error("유사한 룸메이트 목록 가져오기 실패:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <RoomMatePageWrapper>
      <Header title="룸메이트" hasBack={false} showAlarm={true} />

      <TitleContentArea
        type={"최신순"}
        link={"/roommatelist"}
        children={
          <>
            {roommates.slice(0, 1).map((post) => (
              <RoomMateCard
                key={post.boardId}
                title={post.title}
                content={post.comment}
                commentCount={0} // 서버에서 제공되면 반영
                likeCount={0} // 서버에서 제공되면 반영
              />
            ))}
          </>
        }
      />

      <TitleContentArea
        type={"나와 비슷한 룸메"}
        children={
          <>
            {similarRoommates.length > 0 ? (
              similarRoommates.map((post) => (
                <RoomMateCard
                  key={post.boardId}
                  title={post.title}
                  content={post.comment}
                  percentage={post.similarityPercentage}
                  commentCount={0} // API에서 제공되면 수정
                  likeCount={0} // API에서 제공되면 수정
                />
              ))
            ) : (
              <EmptyMessage>추천 게시글이 없습니다.</EmptyMessage>
            )}
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

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
`;
