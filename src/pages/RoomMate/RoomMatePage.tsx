import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import RoomMateCard from "../../components/roommate/RoomMateCard.tsx";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useUserStore from "../../stores/useUserStore.ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getMyRoommatePost,
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
import { useRoommateMatchingStatus } from "@/hooks/useRoommateMatchingStatus";
import { formatSemesterName } from "@/utils/semester";
import MatchedRoomMateCard from "@/components/roommate/MatchedRoomMateCard";
import { colors, typography } from "@/styles/tokens";
import ChipButton from "@/components/button/ChipButton";
import searchIcon from "@/assets/roommate/search-normal.svg";
import caretDownIcon from "@/assets/roommate/caret-down.svg";
import settingsSlidersIcon from "@/assets/roommate/settings-sliders.svg";

const CURRENT_YEAR = new Date().getFullYear();

function FilterTags({
  filters,
  onClick,
}: {
  filters: Record<string, unknown>;
  onClick: () => void;
}) {
  const filteredTags = Object.values(filters).filter((value) => {
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  });

  if (filteredTags.length === 0) return null;

  return (
    <TagsWrapper onClick={onClick} role="button" tabIndex={0}>
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
  const {
    data: matchingStatus,
    isClosed: isMatchingClosed,
    isLoading: isStatusLoading,
  } = useRoommateMatchingStatus();

  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const hasChecklist = userInfo.roommateCheckList;

  const selectedCategory = searchParams.get("tab") || CATEGORY_LIST[0];
  const semesterParam = searchParams.get("semester");
  const selectedSemesterCode =
    semesterParam !== null
      ? Number(semesterParam)
      : matchingStatus?.semester
        ? Number(matchingStatus.semester)
        : undefined;

  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState("");
  const [isOpeningMyPost, setIsOpeningMyPost] = useState(false);

  const semesterOptions = useMemo(() => {
    if (!matchingStatus) {
      return [{ label: `${CURRENT_YEAR}년 1학기`, value: 1 }];
    }
    const currentVal = Number(matchingStatus.semester) || 1;
    const options = [
      {
        label: `${matchingStatus.year}년 ${formatSemesterName(matchingStatus.semester)}`,
        value: currentVal,
      },
    ];

    // 임시 테스트용: 현재 학기가 1학기가 아니면 1학기 옵션 추가
    if (currentVal !== 1) {
      options.push({
        label: `${matchingStatus.year}년 1학기`,
        value: 1,
      });
    }

    return options;
  }, [matchingStatus]);

  const handleSemesterChange = (code: number) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("semester", String(code));
        return newParams;
      },
      { replace: true },
    );
  };

  const filters = useMemo(() => {
    if (location.state?.filters !== undefined) {
      const stateFilters = location.state.filters || {};
      sessionStorage.setItem(
        "roommateSearchFilters",
        JSON.stringify(stateFilters),
      );
      return stateFilters;
    }
    const stored = sessionStorage.getItem("roommateSearchFilters");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  }, [location.state?.filters]);

  const handleCategoryClick = (category: string) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("tab", category);
        return newParams;
      },
      { replace: true },
    );
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

  const isLocked = !isStatusLoading && isMatchingClosed;

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearchKeyword(searchKeyword.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

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
    queryKey: [
      "roommates",
      "scroll",
      debouncedSearchKeyword,
      selectedSemesterCode,
    ],
    queryFn: ({ pageParam }) =>
      getRoomMateScrollList(pageParam, 10, {
        keyword: debouncedSearchKeyword || undefined,
        year: matchingStatus?.year,
        semester:
          selectedSemesterCode ??
          (matchingStatus?.semester
            ? Number(matchingStatus.semester)
            : undefined),
      }),
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

  const searchedRoommates = filteredRoommates;

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

  const [likedTabFilter, setLikedTabFilter] = useState<"ALL" | "RECRUITING">(
    "ALL",
  );

  const recruitingCount = useMemo(
    () => likedRoommates.filter((post) => !post.matched).length,
    [likedRoommates],
  );

  const filteredLikedRoommates = useMemo(() => {
    if (likedTabFilter === "RECRUITING") {
      return likedRoommates.filter((post) => !post.matched);
    }
    return likedRoommates;
  }, [likedRoommates, likedTabFilter]);

  const handleChecklistButtonClick = async () => {
    if (!hasChecklist) {
      navigate(PATHS.ROOMMATE.CHECKLIST);
      return;
    }

    if (isOpeningMyPost) return;
    setIsOpeningMyPost(true);

    try {
      const loadedMyPost = scrollData?.pages
        .flat()
        .find((post) => post.isMyPost || post.userId === userInfo.id);
      const myPost = loadedMyPost ?? (await getMyRoommatePost()).data;

      navigate(PATHS.ROOMMATE.DETAIL(myPost.boardId), {
        state: { isMyPost: true },
      });
    } catch (error) {
      console.error("내 체크리스트 게시글 조회 실패:", error);
      alert("내 체크리스트 게시글을 불러오지 못했습니다.");
    } finally {
      setIsOpeningMyPost(false);
    }
  };

  return (
    <RoomMatePageWrapper $isLocked={isLocked}>
      {!isStatusLoading && isMatchingClosed && (
        <ComingSoonOverlay
          message={
            matchingStatus
              ? `${matchingStatus.year}년 ${formatSemesterName(matchingStatus.semester)} 룸메이트 매칭 종료!`
              : "룸메이트 매칭 종료!"
          }
          subMessage={
            "다음 룸메이트 매칭을 기대해 주세요!\n오픈되면 푸시알림으로 알려드릴게요."
          }
        />
      )}

      {selectedCategory === CATEGORY_LIST[0] && (
        <>
          <TitleContentArea
            title={"맞춤 룸메이트"}
            description={"조건에 맞는 글이 올라오면 알림을 받을 수 있어요."}
            location="룸메이트_홈"
          >
            <>
              {isLoggedIn && isFilterSet && matchingFilterLabels.length > 0 && (
                <MatchingFilterRow
                  onClick={() => navigate(PATHS.ROOMMATE.FIND_SETTING)}
                  role="button"
                  tabIndex={0}
                >
                  <MatchingFilterChipsGroup>
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
                  </MatchingFilterChipsGroup>

                  <FilterEditIconButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(PATHS.ROOMMATE.FIND_SETTING);
                    }}
                    aria-label="맞춤 필터 설정"
                  >
                    <img
                      src={settingsSlidersIcon}
                      alt=""
                      aria-hidden
                      width={20}
                      height={20}
                    />
                  </FilterEditIconButton>
                </MatchingFilterRow>
              )}

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

              {isMatchingLoading ? (
                <LoadingSpinner message="추천 목록을 불러오는 중..." />
              ) : (
                isLoggedIn &&
                hasChecklist && (
                  <>
                    {matchingRoommates && matchingRoommates.length > 0 ? (
                      <MatchingCardRailWrapper>
                        <MatchingCardRail>
                          {matchingRoommates.map((item) => {
                            const post =
                              "post" in item
                                ? item.post
                                : (item as unknown as RoommatePost);
                            const matchedFilterFields =
                              "matchedFilterFields" in item
                                ? item.matchedFilterFields
                                : undefined;

                            return (
                              <MatchedRoomMateCard
                                key={post.boardId}
                                post={post}
                                matchedFilterFields={matchedFilterFields}
                              />
                            );
                          })}
                        </MatchingCardRail>
                      </MatchingCardRailWrapper>
                    ) : !isFilterSet ? (
                      <EmptyStateCard>
                        <EmptyStateText>
                          조건에 맞는 글이 올라오면
                          <br />
                          푸시 알림을 받아볼 수 있어요.
                        </EmptyStateText>
                        <PrimarySettingButton
                          type="button"
                          onClick={() =>
                            navigate(
                              isLoggedIn
                                ? PATHS.ROOMMATE.FIND_SETTING
                                : PATHS.LOGIN,
                            )
                          }
                        >
                          맞춤 룸메이트 설정
                        </PrimarySettingButton>
                        <EmptyStateSubText>
                          필터를 아직 설정하지 않았다면
                          <br />
                          먼저 원하는 조건을 선택해주세요
                        </EmptyStateSubText>
                      </EmptyStateCard>
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
            title={"전체 목록"}
            location="룸메이트_홈"
            rightAction={
              <SemesterSelect
                value={
                  selectedSemesterCode ??
                  (matchingStatus?.semester
                    ? Number(matchingStatus.semester)
                    : 1)
                }
                onChange={(event) => {
                  handleSemesterChange(Number(event.target.value));
                }}
                aria-label="학기 선택"
              >
                {semesterOptions.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </SemesterSelect>
            }
          >
            <>
              <SearchBox role="search">
                <SearchIcon src={searchIcon} alt="" aria-hidden />
                <SearchInput
                  type="search"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="검색어를 입력하세요"
                  aria-label="룸메이트 게시글 검색"
                />
                <SettingsIconButton
                  type="button"
                  onClick={() =>
                    navigate("/roommate/filter", { state: { filters } })
                  }
                  aria-label="필터 설정"
                >
                  <SettingsIcon src={settingsSlidersIcon} alt="" aria-hidden />
                </SettingsIconButton>
              </SearchBox>

              <FilterTags
                filters={filters}
                onClick={() =>
                  navigate("/roommate/filter", { state: { filters } })
                }
              />

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
        <TitleContentArea
          title={`총 ${likedRoommates.length}개 저장됨`}
          description={isLoggedIn ? `모집중 ${recruitingCount}개` : undefined}
          location="룸메이트_좋아요"
        >
          <>
            {isLoggedIn && likedRoommates.length > 0 && (
              <LikedFilterChipsRow>
                <ChipButton
                  active={likedTabFilter === "ALL"}
                  onClick={() => setLikedTabFilter("ALL")}
                >
                  전체
                </ChipButton>
                <ChipButton
                  active={likedTabFilter === "RECRUITING"}
                  onClick={() => setLikedTabFilter("RECRUITING")}
                >
                  모집중
                </ChipButton>
              </LikedFilterChipsRow>
            )}

            <LikedPostsSection>
              {!isLoggedIn ? (
                <ChecklistBanner onClick={() => navigate(PATHS.LOGIN)}>
                  로그인하시면 좋아요한 룸메이트 게시글을 모아볼 수 있어요.
                  <strong>인천대학교 포털로 로그인 →</strong>
                </ChecklistBanner>
              ) : isLikedLoading ? (
                <LoadingSpinner message="좋아요한 게시글을 불러오는 중..." />
              ) : isLikedError ? (
                <EmptyMessage>
                  좋아요한 게시글을 불러오지 못했습니다.
                </EmptyMessage>
              ) : filteredLikedRoommates.length > 0 ? (
                filteredLikedRoommates.map((post) => (
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
          </>
        </TitleContentArea>
      )}

      {isLoggedIn && (
        <WriteButton
          type="button"
          disabled={isOpeningMyPost}
          onClick={handleChecklistButtonClick}
        >
          ✏️ 내 체크리스트{" "}
          {isOpeningMyPost ? "불러오는 중" : hasChecklist ? "보기" : "작성"}
        </WriteButton>
      )}
    </RoomMatePageWrapper>
  );
}

// 스크롤 및 터치 차단 속성 추가
const RoomMatePageWrapper = styled.div<{ $isLocked?: boolean }>`
  padding: 52px 16px 140px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow-y: ${({ $isLocked }) => ($isLocked ? "hidden" : "auto")};
  touch-action: ${({ $isLocked }) => ($isLocked ? "none" : "auto")};
  //background: #fafafa;
  width: 100%;
  flex: 1;
`;

const MatchingFilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
`;

const MatchingFilterChipsGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
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
    border-color: ${colors.blue.blue200};
  }
`;

const SearchIcon = styled.img`
  width: 16px;
  height: 16px;
  display: block;
  flex: 0 0 16px;
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

const SettingsIconButton = styled.button`
  background: none;
  border: none;
  padding: 2px;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 20px;
`;

const SettingsIcon = styled.img`
  width: 20px;
  height: 20px;
  display: block;
`;

const SemesterSelect = styled.select`
  ${typography.label1Normal}
  min-width: 155px;
  width: auto;
  height: 36px;
  padding: 6px 28px 6px 12px;
  border: 0;
  border-radius: 8px;
  box-sizing: border-box;
  appearance: none;
  background-color: var(--Bg-Bg3, #efefef);
  background-image: url("${caretDownIcon}");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 9px 5px;
  color: var(--Gray-Gray500, #8b8b8b);

  /* Label 1_Normal */
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 21px */
  outline: 0;

  &:focus-visible {
    box-shadow: 0 0 0 2px ${colors.blue.blue200};
  }
`;

const FilterEditIconButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 20px;
    height: 20px;
  }
`;

const LikedPostsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const LikedFilterChipsRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 4px 0 12px;
`;

const MatchingFilterChip = styled.span`
  ${typography.caption1}
  flex: 0 0 auto;
  padding: 4px 12px;
  border: 1px solid ${colors.gray.gray200};
  border-radius: 23px;
  background: ${colors.bg.bg1};
  color: ${colors.gray.gray500};

  &.empty {
    color: ${colors.gray.gray400};
    border-style: dashed;
  }
`;

const MatchingCardRailWrapper = styled.div`
  position: relative;
  width: calc(100% + 32px);
  margin-left: -16px;
  margin-right: -16px;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 48px;
    background: linear-gradient(
      to right,
      rgba(250, 250, 250, 0) 0%,
      #fafafa 100%
    );
    pointer-events: none;
    z-index: 2;
  }
`;

const MatchingCardRail = styled.div`
  display: flex;
  gap: 6px;
  padding: 4px 16px 8px;
  overflow-x: auto;
  scroll-padding-inline: 16px;
  scroll-snap-type: x proximity;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const EmptyStateCard = styled.div`
  background: ${colors.bg.bg1};
  filter: drop-shadow(0px 4px 4px ${colors.gray.gray200});
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 16px 32px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
`;

const EmptyStateText = styled.p`
  ${typography.label1Normal}
  color: ${colors.gray.gray800};
  text-align: center;
  line-height: 1.5;
  margin: 0;
`;

const PrimarySettingButton = styled.button`
  background-color: ${colors.main.main1};
  border: none;
  padding: 8px 68px;
  border-radius: 68px;
  cursor: pointer;
  color: ${colors.bg.bg1};
  ${typography.body1Normal}
  line-height: 1.5;
  white-space: nowrap;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.9;
  }
`;

const EmptyStateSubText = styled.p`
  ${typography.caption1}
  color: ${colors.gray.gray500};
  text-align: center;
  line-height: 1.5;
  margin: 0;
`;

const TagsWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  //margin-top: 8px;
  cursor: pointer;

  .filtertitle {
    font-size: 14px;
    font-weight: 600;
    color: ${colors.gray.gray800};
  }

  &:hover {
    opacity: 0.8;
  }
`;

const Tag = styled.div`
  background-color: ${colors.bg.bg1};
  border: 1px solid ${colors.gray.gray200};
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 13px;
  color: ${colors.gray.gray600};
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

  &:disabled {
    cursor: wait;
    opacity: 0.7;
  }
`;
