import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getRoomMateScrollList, getMatchingPostList } from "@/apis/roommate";
import { getFeatureFlagByKey } from "@/apis/featureFlag";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import ComingSoonOverlay from "../../components/common/ComingSoonOverlay.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { PATHS } from "@/constants/paths";

export default function RoomMatePage() {
  const navigate = useNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const hasChecklist = userInfo.roommateCheckList;

  useSetHeader({ title: "룸메이트" });

  // 피처 플래그 조회 (매칭 활성화 여부)
  const { data: isMatchingActive } = useQuery({
    queryKey: ["featureFlag", "ROOMMATE_MATCHING"],
    queryFn: async () => {
      const response = await getFeatureFlagByKey("ROOMMATE_MATCHING");
      return response.data.flag;
    },
    initialData: true,
  });

  // 최신 룸메이트 목록 (무한 스크롤)
  const { data: scrollData, isLoading: isLatestLoading } = useInfiniteQuery({
    queryKey: ["roommates", "scroll"],
    queryFn: ({ pageParam }) => getRoomMateScrollList(pageParam, 10),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 10) return undefined;
      return lastPage[lastPage.length - 1].boardId;
    },
    staleTime: 1000 * 60 * 5,
  });

  // 필터 조건에 맞는 게시글 목록 조회
  const { data: matchingRoommates, isLoading: isMatchingLoading } = useQuery({
    queryKey: ["roommates", "matching"],
    queryFn: async () => {
      const response = await getMatchingPostList();
      console.log("필터 룸메이트 목록", response);
      return response.data;
    },
    enabled: isLoggedIn && hasChecklist,
    staleTime: 1000 * 60 * 5,
  });

  // 데이터 평탄화
  const allRoommates = scrollData?.pages.flat() || [];

  return (
    <RoomMatePageWrapper>
      {!isMatchingActive && (
        <ComingSoonOverlay
          message={"2025년 2학기 룸메이트 매칭 종료!"}
          subMessage={"다음 룸메이트 매칭을 기대해 주세요."}
        />
      )}

      {/* 섹션 1: 최신 모집 공고 */}
      <TitleContentArea
        title={"2026년 1학기 룸메이트 모집"}
        description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}
        link={PATHS.ROOMMATE.LIST} // 경로 상수 적용
      >
        {isLatestLoading ? (
          <LoadingSpinner message="최신 목록을 불러오는 중..." />
        ) : allRoommates.length > 0 ? (
          allRoommates
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

      {/* 섹션 2: 필터 기반 모아보기 */}
      <TitleContentArea
        title={"모아보기한 룸메이트"}
        description={"설정한 알림 필터 조건에 맞는 룸메이트를 보여드려요."}
      >
        <>
          <SectionActionArea>
            <SettingButton
              onClick={() => navigate(PATHS.ROOMMATE.FIND_SETTING)}
            >
              ⚙️ 모아보기 설정
            </SettingButton>
          </SectionActionArea>

          {isLoggedIn && !hasChecklist && (
            <ChecklistBanner onClick={() => navigate(PATHS.ROOMMATE.CHECKLIST)}>
              아직 사전 체크리스트를 작성하지 않으셨네요! <br /> 체크리스트를
              작성하면 나와 생활패턴이 비슷한 룸메이트를 추천받을 수 있어요.
              <strong>지금 바로 체크리스트 작성하러 가기 →</strong>
            </ChecklistBanner>
          )}
          {!isLoggedIn && (
            <ChecklistBanner onClick={() => navigate(PATHS.LOGIN)}>
              로그인하시면 모아보기한 룸메이트를 찾아볼 수 있어요.
              <strong>인천대학교 포털 로그인 →</strong>
            </ChecklistBanner>
          )}

          {isMatchingLoading ? (
            <LoadingSpinner message="추천 목록을 불러오는 중..." />
          ) : isLoggedIn &&
            hasChecklist &&
            matchingRoommates &&
            matchingRoommates.length > 0 ? (
            matchingRoommates.map((post) => (
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
                matched={post.matched}
              />
            ))
          ) : (
            isLoggedIn &&
            hasChecklist && (
              <EmptyMessage>필터 조건에 맞는 게시글이 없습니다.</EmptyMessage>
            )
          )}
        </>
      </TitleContentArea>

      {isLoggedIn && (
        <WriteButton onClick={() => navigate(PATHS.ROOMMATE.CHECKLIST)}>
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

// 섹션 내 상단 액션 영역
const SectionActionArea = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
`;

// 모아보기 설정 버튼
const SettingButton = styled.button`
  background: #eee;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #e2e2e2;
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
