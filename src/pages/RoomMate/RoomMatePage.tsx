import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useState } from "react";
import { RoommatePost, SimilarRoommatePost } from "@/types/roommates";
import { getRoomMateList, getSimilarRoomMateList } from "@/apis/roommate";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import ComingSoonOverlay from "../../components/common/ComingSoonOverlay.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { getFeatureFlagByKey } from "@/apis/featureFlag";

export default function RoomMatePage() {
  const navigate = useNavigate();

  const { tokenInfo, userInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const hasChecklist = userInfo.roommateCheckList;

  const [roommates, setRoommates] = useState<RoommatePost[]>([]);
  const [similarRoommates, setSimilarRoommates] = useState<
    SimilarRoommatePost[]
  >([]);

  const [isLatestLoading, setIsLatestLoading] = useState<boolean>(false);
  const [isSimilarLoading, setIsSimilarLoading] = useState<boolean>(false);

  // 피처 플래그 상태 관리
  const [isMatchingActive, setIsMatchingActive] = useState<boolean>(true);

  useEffect(() => {
    // 피처 플래그 확인 함수
    const checkFeatureFlag = async () => {
      try {
        const response = await getFeatureFlagByKey("ROOMMATE_MATCHING");
        // 응답 값 기준 매칭 활성화 여부 설정
        setIsMatchingActive(response.data.flag);
      } catch (error) {
        console.error("피처 플래그 확인 실패:", error);
      }
    };

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

    const loadSimilarRoommates = async () => {
      if (!isLoggedIn) {
        setSimilarRoommates([]);
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

    checkFeatureFlag();
    loadRoommates();
    loadSimilarRoommates();
  }, [isLoggedIn]);

  const filteredSimilarRoommates = similarRoommates.filter(
    (post) => post.dormType === userInfo.dormType,
  );

  useSetHeader({ title: "룸메이트" });

  return (
    <RoomMatePageWrapper>
      {/* 매칭 비활성 시 오버레이 표시 */}
      {!isMatchingActive && (
        <ComingSoonOverlay
          message={"2025년 2학기 룸메이트 매칭 종료!"}
          subMessage={"다음 룸메이트 매칭을 기대해 주세요."}
        />
      )}

      <TitleContentArea
        title={"2026년 1학기 룸메이트 모집"}
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
        title={"모아보기한 룸메이트"}
        description={"모아보기 조건에 해당하는 룸메이트를 보여드려요."}
      >
        <>
          {isLoggedIn && !hasChecklist && (
            <ChecklistBanner onClick={() => navigate("/roommate/checklist")}>
              아직 사전 체크리스트를 작성하지 않으셨네요! <br /> 체크리스트를
              작성하면 나와 생활패턴이 비슷한 룸메이트를 추천받을 수 있어요.
              <strong>지금 바로 체크리스트 작성하러 가기 →</strong>
            </ChecklistBanner>
          )}
          {!isLoggedIn && (
            <ChecklistBanner onClick={() => navigate("/login")}>
              로그인하시면 모아보기한 룸메이트를 찾아볼 수 있어요.
              <strong>인천대학교 포털 로그인 →</strong>
            </ChecklistBanner>
          )}

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
    </RoomMatePageWrapper>
  );
}

const RoomMatePageWrapper = styled.div`
  padding: 0 16px;
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
  margin-bottom: 8px;

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
  z-index: 2;
`;
