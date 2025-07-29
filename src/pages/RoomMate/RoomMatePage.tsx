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

import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.ts"; // 추가 필요

export default function RoomMatePage() {
  const { tokenInfo, userInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const hasChecklist = userInfo.roommateCheckList;

  const [roommates, setRoommates] = useState<RoommatePost[]>([]);
  const [similarRoommates, setSimilarRoommates] = useState<
    SimilarRoommatePost[]
  >([]);
  const navigate = useNavigate(); // 페이지 이동을 위한 hook

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRoomMateList();
        setRoommates(response.data);
      } catch (error) {
        console.error("룸메이트 목록 가져오기 실패:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isLoggedIn) return;
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
        title={"최신순"}
        description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}
        link={"/roommatelist"}
      >
        <>
          {roommates.length > 0 ? (
            roommates
              .slice(0, 2)
              .map((post) => (
                <RoomMateCard
                  key={post.boardId}
                  boardId={post.boardId}
                  title={post.title}
                  content={post.comment}
                  commentCount={0}
                  likeCount={0}
                />
              ))
          ) : (
            <EmptyMessage>게시글이 없습니다.</EmptyMessage>
          )}
        </>
      </TitleContentArea>

      <TitleContentArea
        title={"나와 비슷한 룸메이트"}
        description={
          "작성한 사전 체크리스트를 바탕으로 생활 패턴이 비슷한 룸메이트를 추천해드려요."
        }
        children={
          <>
            {/*로그인했는데 체크리스트를 작성하지 않은 경우*/}
            {isLoggedIn && !hasChecklist && (
              <ChecklistBanner onClick={() => navigate("/roommatechecklist")}>
                아직 사전 체크리스트를 작성하지 않으셨네요! <br /> 체크리스트를
                작성하면 나와 생활패턴이 비슷한 룸메이트를 추천받을 수 있어요.
                <strong>지금 바로 체크리스트 작성하러 가기 →</strong>
              </ChecklistBanner>
            )}
            {/*로그인하지 않은 경우*/}
            {!isLoggedIn && (
              <ChecklistBanner onClick={() => navigate("/login")}>
                로그인하시면 나와 생활패턴이 비슷한 룸메이트를 추천받을 수
                있어요.
                <strong>지금 바로 로그인하러 가기 →</strong>
              </ChecklistBanner>
            )}

            {similarRoommates.length > 0 ? (
              similarRoommates.map((post) => (
                <RoomMateCard
                  key={post.boardId}
                  boardId={post.boardId}
                  title={post.title}
                  content={post.comment}
                  percentage={post.similarityPercentage}
                  commentCount={0}
                  likeCount={0}
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

// styled-components 부분에 아래 스타일을 추가하세요

const ChecklistBanner = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #ffeeba;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;

  strong {
    display: block;
    margin-top: 6px;
    font-weight: 600;
    color: #8a6d3b;
  }

  &:hover {
    background-color: #ffe8a1;
  }
`;
