import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getRoomMateScrollList,
  getMatchingPostList,
  getNotificationFilter,
} from "@/apis/roommate";
import { getFeatureFlagByKey } from "@/apis/featureFlag";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import ComingSoonOverlay from "../../components/common/ComingSoonOverlay.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { PATHS } from "@/constants/paths";
import { CategoryItem, CategoryWrapper } from "@/styles/header";
import { CATEGORY_LIST } from "@/constants/roommate";
import { useMemo, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { RoommatePost } from "@/types/roommates";
import FilterButton from "../../components/button/FilterButton.tsx";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import TopPopupNotification from "@/components/common/TopPopupNotification";

function FilterTags({ filters }: { filters: Record<string, any> }) {
  const filteredTags = Object.values(filters).filter((value) => {
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  });

  if (filteredTags.length === 0) return null;

  return (
    <TagsWrapper>
      <div className="filtertitle">적용된 필터</div>
      {filteredTags.map((value, idx) => {
        const displayValue = Array.isArray(value) ? value.join(", ") : value;
        return <Tag key={idx}>#{displayValue}</Tag>;
      })}
    </TagsWrapper>
  );
}

export default function RoomMatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { ref, inView } = useInView();
  const { tokenInfo, userInfo } = useUserStore();

  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const hasChecklist = userInfo.roommateCheckList;

  const selectedCategory = searchParams.get("tab") || CATEGORY_LIST[0];

  const filters = useMemo(
    () => location.state?.filters || {},
    [location.state?.filters],
  );

  const handleCategoryClick = (category: string) => {
    setSearchParams({ tab: category }, { replace: true });
  };

  useSetHeader({
    title: "룸메이트",
    secondHeader: (
      <CategoryWrapper>
        {CATEGORY_LIST.map((category) => (
          <CategoryItem
            key={category}
            className={selectedCategory === category ? "active" : ""}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </CategoryItem>
        ))}
      </CategoryWrapper>
    ),
  });

  const { data: isMatchingActive } = useQuery({
    queryKey: ["featureFlag", "ROOMMATE_MATCHING"],
    queryFn: async () => {
      const response = await getFeatureFlagByKey("ROOMMATE_MATCHING");
      return response.data.flag;
    },
    initialData: true,
    staleTime: Infinity,
  });

  const { data: notificationFilterData } = useQuery({
    queryKey: ["roommateNotificationFilter"],
    queryFn: getNotificationFilter,
    enabled: isLoggedIn,
    select: (res) => res.data,
    staleTime: 1000 * 60 * 30,
  });

  const isFilterSet = useMemo(() => {
    if (!notificationFilterData) return false;

    return Object.values(notificationFilterData).some(
      (value) => value !== null && value !== undefined && value !== "",
    );
  }, [notificationFilterData]);

  const {
    data: scrollData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLatestLoading,
  } = useInfiniteQuery({
    queryKey: ["roommates", "scroll"],
    queryFn: ({ pageParam }) => getRoomMateScrollList(pageParam, 10),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 10) return undefined;
      return lastPage[lastPage.length - 1].boardId;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (
      inView &&
      hasNextPage &&
      !isFetchingNextPage &&
      selectedCategory === CATEGORY_LIST[0]
    ) {
      fetchNextPage();
    }
  }, [
    inView,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    selectedCategory,
  ]);

  const filteredRoommates = useMemo<RoommatePost[]>(() => {
    const combined = scrollData?.pages.flat() || [];
    if (Object.keys(filters).length === 0) return combined;

    return combined.filter((post: RoommatePost) => {
      if (filters.dormType && post.dormType !== filters.dormType) return false;
      if (filters.college && post.college !== filters.college) return false;
      if (filters.dormPeriod && filters.dormPeriod.length > 0) {
        const matchAllDays = filters.dormPeriod.every((day: string) =>
          post.dormPeriod.includes(day),
        );
        if (!matchAllDays) return false;
      }
      if (filters.mbti) {
        const filterLetters = filters.mbti.split("");
        const matchesAll = filterLetters.every((letter: string) =>
          post.mbti.includes(letter),
        );
        if (!matchesAll) return false;
      }
      if (filters.smoking && post.smoking !== filters.smoking) return false;
      if (filters.snoring && post.snoring !== filters.snoring) return false;
      if (filters.toothGrind && post.toothGrind !== filters.toothGrind)
        return false;
      if (filters.sleeper && post.sleeper !== filters.sleeper) return false;
      if (filters.showerHour && post.showerHour !== filters.showerHour)
        return false;
      if (filters.showerTime && post.showerTime !== filters.showerTime)
        return false;
      if (filters.bedTime && post.bedTime !== filters.bedTime) return false;
      if (filters.arrangement && post.arrangement !== filters.arrangement)
        return false;
      if (filters.religion && post.religion !== filters.religion) return false;
      return true;
    });
  }, [scrollData, filters]);

  const { data: matchingRoommates, isLoading: isMatchingLoading } = useQuery({
    queryKey: ["roommates", "matching"],
    queryFn: async () => {
      const response = await getMatchingPostList();
      return response.data;
    },
    enabled: isLoggedIn && hasChecklist,
    staleTime: 1000 * 60 * 5,
  });

  interface NotificationData {
    title: string;
    message: string;
  }

  const [notification, setNotification] = useState<NotificationData | null>(
    null,
  );

  const handleCloseNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    const platform = getMobilePlatform();
    // 맞춤 룸메이트 탭이고 웹 환경일 때만 알림 노출
    if (
      selectedCategory === CATEGORY_LIST[1] &&
      platform !== "ios_webview" &&
      platform !== "android_webview"
    ) {
      setNotification({
        title: "새 글 알림은 앱에서만 받을 수 있어요",
        message: `스토어에서 유니돔 앱을 설치 후 로그인하세요.`,
      });
    } else {
      setNotification(null);
    }
  }, [selectedCategory]);

  return (
    <RoomMatePageWrapper>
      {notification && (
        <TopPopupNotification
          title={notification.title}
          message={notification.message}
          onClose={handleCloseNotification}
          duration={4000}
        />
      )}
      {!isMatchingActive && (
        <ComingSoonOverlay
          message={"2025년 2학기 룸메이트 매칭 종료!"}
          subMessage={"다음 룸메이트 매칭을 기대해 주세요."}
        />
      )}

      {selectedCategory === CATEGORY_LIST[0] && (
        <TitleContentArea
          title={"2026년 1학기 룸메이트 모집"}
          description={"룸메이트를 구하고 있는 다양한 UNI들을 찾아보세요!"}
        >
          <>
            <FilterArea>
              <FilterButton
                onClick={() =>
                  navigate("/roommate/filter", { state: { filters } })
                }
              />
              <FilterTags filters={filters} />
            </FilterArea>

            {isLatestLoading ? (
              <LoadingSpinner message="최신 목록을 불러오는 중..." />
            ) : filteredRoommates.length > 0 ? (
              filteredRoommates.map((post) => (
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

            <div ref={ref} style={{ height: "20px" }}>
              {isFetchingNextPage && (
                <LoadingSpinner message="추가 로딩 중..." />
              )}
            </div>
          </>
        </TitleContentArea>
      )}

      {selectedCategory === CATEGORY_LIST[1] && (
        <TitleContentArea
          title={"맞춤 룸메이트"}
          description={"설정한 알림 필터 조건에 맞는 룸메이트를 보여드려요."}
          rightAction={
            <SettingButton
              onClick={() => navigate(PATHS.ROOMMATE.FIND_SETTING)}
            >
              ⚙️ 모아보기 설정
            </SettingButton>
          }
        >
          <>
            {!isLoggedIn ? (
              <ChecklistBanner onClick={() => navigate(PATHS.LOGIN)}>
                로그인하시면 모아보기한 룸메이트를 찾아볼 수 있어요.
                <strong>인천대학교 포털 로그인 →</strong>
              </ChecklistBanner>
            ) : !hasChecklist ? (
              <ChecklistBanner
                onClick={() => navigate(PATHS.ROOMMATE.CHECKLIST)}
              >
                아직 사전 체크리스트를 작성하지 않으셨네요! <br /> 체크리스트를
                작성하면 나와 생활패턴이 비슷한 룸메이트를 추천받을 수 있어요.
                <strong>지금 바로 체크리스트 작성하러 가기 →</strong>
              </ChecklistBanner>
            ) : null}

            {isMatchingLoading ? (
              <LoadingSpinner message="추천 목록을 불러오는 중..." />
            ) : (
              isLoggedIn &&
              hasChecklist && (
                <>
                  {matchingRoommates && matchingRoommates.length > 0 ? (
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
                  ) : !isFilterSet ? (
                    <EmptyStateContainer>
                      <EmptyTitle>
                        맞춤 룸메이트를 설정하면 <br />새 글이 올라올 때 푸시
                        알림으로 알려드려요.
                      </EmptyTitle>
                      <PrimarySettingButton
                        onClick={() => navigate(PATHS.ROOMMATE.FIND_SETTING)}
                      >
                        맞춤 룸메이트 설정하기
                      </PrimarySettingButton>
                      <FooterTextGroup>
                        <p>이미 같이 하기로 한 룸메이트가 있다면?</p>
                        <span onClick={() => navigate(PATHS.ROOMMATE.ADD)}>
                          룸메이트 등록하러 가기
                        </span>
                      </FooterTextGroup>
                    </EmptyStateContainer>
                  ) : (
                    <EmptyMessage>
                      필터 조건에 맞는 게시글이 없습니다.
                    </EmptyMessage>
                  )}
                </>
              )
            )}
          </>
        </TitleContentArea>
      )}

      {isLoggedIn && (
        <WriteButton onClick={() => navigate(PATHS.ROOMMATE.CHECKLIST)}>
          ✏️ 내 사전 체크리스트 {!hasChecklist ? "작성" : "수정"}
        </WriteButton>
      )}
    </RoomMatePageWrapper>
  );
}

const RoomMatePageWrapper = styled.div`
  padding: 40px 16px 140px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fafafa;
  width: 100%;
  flex: 1;
`;

const SettingButton = styled.button`
  background: #eee;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  &:hover {
    background: #e2e2e2;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  margin-top: 8px;
`;

const EmptyTitle = styled.h3`
  color: black;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const PrimarySettingButton = styled.button`
  background-color: #007bff;
  border: none;
  padding: 16px;
  border-radius: 34px;
  cursor: pointer;
  margin-bottom: 32px;
  width: 100%;
  max-width: 240px;
  color: var(--7, #f4f4f4);
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

const FooterTextGroup = styled.div`
  p {
    font-size: 13px;
    color: #888;
    margin-bottom: 4px;
  }
  span {
    font-size: 13px;
    color: #007bff;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }
`;

const FilterArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  .filtertitle {
    font-size: 14px;
    font-weight: 600;
  }
`;

const Tag = styled.div`
  background-color: #e0e0e0;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 13px;
  color: #333;
`;

const EmptyMessage = styled.div`
  padding: 48px 24px;
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
  margin-bottom: 16px;
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
