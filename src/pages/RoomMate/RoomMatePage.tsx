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
import { getMemberLikePosts } from "@/apis/members";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import ComingSoonOverlay from "../../components/common/ComingSoonOverlay.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { PATHS } from "@/constants/paths";
import { CategoryItem, CategoryWrapper } from "@/styles/header";
import { CATEGORY_LIST } from "@/constants/roommate";
import { useMemo, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { RoommatePost } from "@/types/roommates";
import type { MyPost_RoommateBoard } from "@/types/members";
import FilterButton from "../../components/button/FilterButton.tsx";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import MatchedRoomMateCard from "@/components/roommate/MatchedRoomMateCard";
import { colors, typography } from "@/styles/tokens";
import searchIcon from "@/assets/roommate/search-normal.svg";
import caretDownIcon from "@/assets/roommate/caret-down.svg";

const SEMESTER_OPTIONS = ["2026-1학기", "2025-2학기", "2025-1학기"];

function FilterTags({ filters }: { filters: Record<string, unknown> }) {
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
        const displayValue = Array.isArray(value)
          ? value.join(", ")
          : String(value);
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
  const { flag: isMatchingActive, isLoading: isFeatureFlagLoading } =
    useFeatureFlag("ROOMMATE_MATCHING");

  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const hasChecklist = userInfo.roommateCheckList;

  const selectedCategory = searchParams.get("tab") || CATEGORY_LIST[0];
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(
    SEMESTER_OPTIONS[0],
  );

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
            style={{ position: "relative" }}
          >
            {category}
          </CategoryItem>
        ))}
      </CategoryWrapper>
    ),
    showAlarm: true,
  });

  // 배경 잠금 상태 정의
  const isLocked = !isFeatureFlagLoading && isMatchingActive === false;

  const { data: notificationFilterData } = useQuery({
    queryKey: ["roommateNotificationFilter"],
    queryFn: getNotificationFilter,
    enabled: isLoggedIn,
    select: (res) => res.data,
    staleTime: 1000 * 60 * 30,
  });

  const isFilterSet = useMemo(() => {
    if (!notificationFilterData) return false;

    return Object.values(notificationFilterData).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim().length > 0;
      return value !== null && value !== undefined;
    });
  }, [notificationFilterData]);

  const matchingFilterLabels = useMemo(() => {
    if (!notificationFilterData) return [];

    return Object.values(notificationFilterData).flatMap((value) => {
      if (Array.isArray(value)) {
        return value.filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        );
      }

      return typeof value === "string" && value.trim().length > 0
        ? [value]
        : [];
    });
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

  const searchedRoommates = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    if (!normalizedKeyword) return filteredRoommates;

    return filteredRoommates.filter((post) =>
      [
        post.title,
        post.comment,
        post.dormType,
        post.college,
        post.mbti,
        post.smoking,
        post.arrangement,
        post.dormPeriod?.join(" "),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedKeyword),
        ),
    );
  }, [filteredRoommates, searchKeyword]);

  const { data: matchingRoommates, isLoading: isMatchingLoading } = useQuery({
    queryKey: ["roommates", "matching"],
    queryFn: async () => {
      const response = await getMatchingPostList();
      return response.data;
    },
    enabled: isLoggedIn && hasChecklist && isFilterSet,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: likedRoommates = [],
    isLoading: isLikedLoading,
    isError: isLikedError,
  } = useQuery({
    queryKey: ["memberLikePosts"],
    queryFn: async () => {
      const response = await getMemberLikePosts();
      return response.data.filter(
        (post): post is MyPost_RoommateBoard => post.type === "ROOMMATE",
      );
    },
    enabled: isLoggedIn && selectedCategory === CATEGORY_LIST[1],
    staleTime: 1000 * 60 * 5,
  });

  return (
    <RoomMatePageWrapper $isLocked={isLocked}>
      {!isFeatureFlagLoading && !isMatchingActive && (
        <ComingSoonOverlay
          message={"2026년 1학기 룸메이트 매칭 종료!"}
          subMessage={
            "다음 룸메이트 매칭을 기대해 주세요!\n오픈되면 푸시알림으로 알려드릴게요."
          }
        />
      )}

      {selectedCategory === CATEGORY_LIST[0] && (
        <>
          <SearchBox role="search">
            <SearchInput
              type="search"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="검색어를 입력하세요"
              aria-label="룸메이트 게시글 검색"
            />
            <SearchIcon src={searchIcon} alt="" aria-hidden />
          </SearchBox>

          <TitleContentArea
            title={"내 조건에 맞는 룸메"}
            location="룸메이트_맞춤"
            rightAction={
              isLoggedIn && (
                <FilterEditButton
                  type="button"
                  onClick={() => navigate(PATHS.ROOMMATE.FIND_SETTING)}
                >
                  필터 수정
                </FilterEditButton>
              )
            }
          >
            <>
              {!isLoggedIn ? (
                <ChecklistBanner onClick={() => navigate(PATHS.LOGIN)}>
                  로그인하시면,
                  <br />
                  맞춤 룸메이트가 올라왔을 때 푸시알림을 받을 수 있어요.
                  <strong>인천대학교 포털로 로그인 →</strong>
                </ChecklistBanner>
              ) : !hasChecklist ? (
                <ChecklistBanner
                  onClick={() => navigate(PATHS.ROOMMATE.CHECKLIST)}
                >
                  아직 사전 체크리스트를 작성하지 않으셨네요! <br />{" "}
                  체크리스트를 작성하면 나와 생활패턴이 비슷한 룸메이트를
                  추천받을 수 있어요.
                  <strong>지금 바로 체크리스트 작성하러 가기 →</strong>
                </ChecklistBanner>
              ) : null}

              {isLoggedIn && hasChecklist && isFilterSet && (
                <MatchingFilterSummary>
                  {matchingFilterLabels.slice(0, 2).map((label, index) => (
                    <MatchingFilterChip key={`${label}-${index}`}>
                      {label}
                    </MatchingFilterChip>
                  ))}
                  {matchingFilterLabels.length > 2 && (
                    <MatchingFilterChip>
                      +{matchingFilterLabels.length - 2}
                    </MatchingFilterChip>
                  )}
                </MatchingFilterSummary>
              )}

              {isMatchingLoading ? (
                <LoadingSpinner message="추천 목록을 불러오는 중..." />
              ) : (
                isLoggedIn &&
                hasChecklist && (
                  <>
                    {matchingRoommates && matchingRoommates.length > 0 ? (
                      <MatchingCardRail>
                        {matchingRoommates.map((post) => (
                          <MatchedRoomMateCard key={post.boardId} post={post} />
                        ))}
                      </MatchingCardRail>
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

          <TitleContentArea
            title={"룸메 목록"}
            location="룸메이트_홈"
            rightAction={
              <SemesterSelect
                value={selectedSemester}
                onChange={(event) => setSelectedSemester(event.target.value)}
                aria-label="학기 선택"
              >
                {SEMESTER_OPTIONS.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </SemesterSelect>
            }
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
              ) : searchedRoommates.length > 0 ? (
                searchedRoommates.map((post) => (
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
                    location="룸메이트_홈"
                  />
                ))
              ) : (
                <EmptyMessage>
                  {searchKeyword.trim()
                    ? "검색 결과가 없습니다."
                    : "게시글이 없습니다."}
                </EmptyMessage>
              )}

              <div ref={ref} style={{ height: "20px" }}>
                {isFetchingNextPage && (
                  <LoadingSpinner message="추가 로딩 중..." />
                )}
              </div>
            </>
          </TitleContentArea>
        </>
      )}

      {selectedCategory === CATEGORY_LIST[1] && (
        <LikedPostsSection>
          {!isLoggedIn ? (
            <ChecklistBanner onClick={() => navigate(PATHS.LOGIN)}>
              로그인하시면 좋아요한 룸메이트 게시글을 모아볼 수 있어요.
              <strong>인천대학교 포털로 로그인 →</strong>
            </ChecklistBanner>
          ) : isLikedLoading ? (
            <LoadingSpinner message="좋아요한 게시글을 불러오는 중..." />
          ) : isLikedError ? (
            <EmptyMessage>좋아요한 게시글을 불러오지 못했습니다.</EmptyMessage>
          ) : likedRoommates.length > 0 ? (
            likedRoommates.map((post) => (
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
                location="룸메이트_좋아요"
              />
            ))
          ) : (
            <EmptyMessage>좋아요한 게시글이 없습니다.</EmptyMessage>
          )}
        </LikedPostsSection>
      )}

      {isLoggedIn && (
        <WriteButton onClick={() => navigate(PATHS.ROOMMATE.CHECKLIST)}>
          ✏️ 내 체크리스트 {!hasChecklist ? "작성" : "수정"}
        </WriteButton>
      )}
    </RoomMatePageWrapper>
  );
}

// 스크롤 및 터치 차단 속성 추가
const RoomMatePageWrapper = styled.div<{ $isLocked?: boolean }>`
  padding: 40px 16px 140px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow-y: ${({ $isLocked }) => ($isLocked ? "hidden" : "auto")};
  touch-action: ${({ $isLocked }) => ($isLocked ? "none" : "auto")};
  background: #fafafa;
  width: 100%;
  flex: 1;
`;

const SearchBox = styled.div`
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid ${colors.gray.gray200};
  border-radius: 8px;
  box-sizing: border-box;
  background: ${colors.bg.bg1};
  display: flex;
  align-items: center;
  gap: 8px;

  &:focus-within {
    border-color: ${colors.main.main1};
  }
`;

const SearchInput = styled.input`
  ${typography.label1Normal}
  min-width: 0;
  flex: 1;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${colors.gray.gray800};

  &::placeholder {
    color: ${colors.gray.gray500};
  }

  &::-webkit-search-cancel-button {
    display: none;
  }
`;

const SearchIcon = styled.img`
  width: 20px;
  height: 20px;
  display: block;
  flex: 0 0 20px;
`;

const SemesterSelect = styled.select`
  ${typography.label1Normal}
  width: 126px;
  height: 40px;
  padding: 8px 40px 8px 16px;
  border: 0;
  border-radius: 8px;
  box-sizing: border-box;
  appearance: none;
  background-color: ${colors.bg.bg3};
  background-image: url("${caretDownIcon}");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 9.333px 4.391px;
  color: ${colors.gray.gray500};
  cursor: pointer;
  outline: 0;

  &:focus-visible {
    box-shadow: 0 0 0 2px ${colors.blue.blue200};
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

const LikedPostsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const FilterEditButton = styled.button`
  ${typography.label2}
  min-width: max-content;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  background: ${colors.gray.gray50};
  color: ${colors.gray.gray600};
  font-weight: 600;
  cursor: pointer;
`;

const MatchingFilterSummary = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 0 4px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MatchingFilterChip = styled.span`
  ${typography.caption1}
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid ${colors.gray.gray200};
  border-radius: 999px;
  background: ${colors.bg.bg1};
  color: ${colors.gray.gray600};
`;

const MatchingCardRail = styled.div`
  display: flex;
  gap: 10px;
  margin: 0 -16px;
  padding: 4px 16px 8px;
  overflow-x: auto;
  scroll-padding-inline: 16px;
  scroll-snap-type: x proximity;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
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
