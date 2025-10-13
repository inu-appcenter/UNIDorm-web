import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";
import Header from "../../components/common/Header.tsx";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.ts";
import BottomBar from "../../components/common/BottomBar.tsx";
import { useEffect, useState } from "react";
import { RoommatePost, SimilarRoommatePost } from "../../types/roommates.ts";
import {
  getRoomMateList,
  getSimilarRoomMateList,
} from "../../apis/roommate.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";

export default function RoomMatePage() {
  const navigate = useNavigate();

  const { tokenInfo, userInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const hasChecklist = userInfo.roommateCheckList;

  const [roommates, setRoommates] = useState<RoommatePost[]>([]);
  const [similarRoommates, setSimilarRoommates] = useState<
    SimilarRoommatePost[]
  >([]);

  // 로딩 상태를 각 섹션별로 분리
  const [isLatestLoading, setIsLatestLoading] = useState<boolean>(false);
  const [isSimilarLoading, setIsSimilarLoading] = useState<boolean>(false);

  useEffect(() => {
    // 최신 룸메이트 목록을 불러오는 함수
    const loadRoommates = async () => {
      setIsLatestLoading(true);
      try {
        const response = await getRoomMateList();
        setRoommates(response.data);
      } catch (error) {
        console.error("룸메이트 리스트 불러오기 실패:", error);
      } finally {
        setIsLatestLoading(false);
      }
    };

    // 비슷한 룸메이트 목록을 불러오는 함수
    const loadSimilarRoommates = async () => {
      if (!isLoggedIn) {
        setSimilarRoommates([]); // 로그아웃 시 목록 비우기
        return;
      }
      setIsSimilarLoading(true);
      try {
        const response = await getSimilarRoomMateList();
        const list = Array.isArray(response.data) ? response.data : [];
        setSimilarRoommates(list);
      } catch (error) {
        console.error("유사한 룸메이트 리스트 불러오기 실패:", error);
      } finally {
        setIsSimilarLoading(false);
      }
    };

    loadRoommates();
    loadSimilarRoommates();
  }, [isLoggedIn]); // 로그인 상태가 변경될 때마다 데이터를 다시 불러옴

  const filteredSimilarRoommates = similarRoommates.filter(
    (post) => post.dormType === userInfo.dormType,
  );

  return (
    <RoomMatePageWrapper>
      <Header title="룸메이트" hasBack={false} showAlarm={true} />

      <TitleContentArea
        title={"2025년 1학기 룸메이트 모집"}
        description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}
        link={"list"}
      >
        {isLatestLoading ? (
          <LoadingSpinner message="최신 목록을 불러오는 중..." />
        ) : roommates.length > 0 ? (
          roommates
            .slice(0, 2)
            .map((post) => (
              <RoomMateCard
                key={post.boardId}
                title={post.title}
                boardId={post.boardId}
                dormType={post.dormType}
                mbti={post.mbti}
                college={post.college}
                isSmoker={post.smoking === "피워요"}
                isClean={post.arrangement === "깔끔해요"}
                stayDays={post.dormPeriod}
                description={post.comment}
                roommateBoardLike={post.roommateBoardLike}
                matched={post.matched}
              />
            ))
        ) : (
          <EmptyMessage>게시글이 없습니다.</EmptyMessage>
        )}
      </TitleContentArea>

      <TitleContentArea
        title={"나와 비슷한 룸메이트"}
        description={
          "작성한 사전 체크리스트를 바탕으로 생활 패턴이 비슷한 룸메이트를 추천해드려요."
        }
      >
        <>
          {/* 배너는 로딩 상태와 관계없이 표시 */}
          {isLoggedIn && !hasChecklist && (
            <ChecklistBanner onClick={() => navigate("/roommate/checklist")}>
              아직 사전 체크리스트를 작성하지 않으셨네요! <br /> 체크리스트를
              작성하면 나와 생활패턴이 비슷한 룸메이트를 추천받을 수 있어요.
              <strong>지금 바로 체크리스트 작성하러 가기 →</strong>
            </ChecklistBanner>
          )}
          {!isLoggedIn && (
            <ChecklistBanner onClick={() => navigate("/login")}>
              로그인하시면 나와 생활패턴이 비슷한 룸메이트를 추천받을 수 있어요.
              <strong>지금 바로 로그인하러 가기 →</strong>
            </ChecklistBanner>
          )}

          {/* 비슷한 룸메이트 목록 영역만 조건부 렌더링 */}
          {isSimilarLoading ? (
            <LoadingSpinner message="추천 목록을 불러오는 중..." />
          ) : isLoggedIn &&
            hasChecklist &&
            filteredSimilarRoommates.length > 0 ? (
            filteredSimilarRoommates.map((post) => (
              <RoomMateCard
                key={post.boardId}
                title={post.title}
                boardId={post.boardId}
                dormType={post.dormType}
                mbti={post.mbti}
                college={post.college}
                isSmoker={post.smoking === "피워요"}
                isClean={post.arrangement === "깔끔해요"}
                stayDays={post.dormPeriod || ["요일 정보가 없어요."]}
                description={post.comment}
                roommateBoardLike={post.roommateBoardLike}
                percentage={post.similarityPercentage}
                matched={post.matched}
              />
            ))
          ) : (
            isLoggedIn &&
            hasChecklist && <EmptyMessage>추천 게시글이 없습니다.</EmptyMessage>
          )}
        </>
      </TitleContentArea>

      {isLoggedIn && (
        <WriteButton onClick={() => navigate("/roommate/checklist")}>
          ✏️ 사전 체크리스트 {!hasChecklist ? "작성" : "수정"}
          하기
        </WriteButton>
      )}
      <BottomBar />
    </RoomMatePageWrapper>
  );
}

const RoomMatePageWrapper = styled.div`
  padding: 90px 16px;
  padding-bottom: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fafafa;
  width: 100%;
  flex: 1;

  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
`;

const ChecklistBanner = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #ffeeba;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  margin-bottom: 8px; /* 배너와 목록 사이에 약간의 간격 추가 */

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

const WriteButton = styled.button`
  position: fixed;
  bottom: 90px;
  right: 20px;
  background-color: #007bff;
  color: white;
  border-radius: 24px;
  padding: 12px 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 100;
`;
