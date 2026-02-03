import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BsEye } from "react-icons/bs";
import { useEffect, useMemo, useState, useRef } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import { useIsAdminRole } from "@/hooks/useIsAdminRole";
import { formatTimeAgo } from "@/utils/dateUtils";
import {
  NoticeTagWrapper,
  TypeBadge,
  UrgentBadge,
} from "@/styles/announcement";
import {
  ANNOUNCE_CATEGORY_LIST,
  ANNOUNCE_SUB_CATEGORY_LIST,
} from "@/constants/announcement";
import { CategoryItem, CategoryWrapper } from "@/styles/header";
import { FaSearch } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import {
  FilterWrapper,
  Label,
  RecentSearchWrapper,
  SearchArea,
  SearchBar,
  Tag,
  TagList,
} from "@/styles/common";
import { getLabelByValue } from "@/utils/announceUtils";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getAnnouncementScrollList } from "@/apis/announcements";
import type { AnnouncementPost } from "@/types/announcements";

export default function AnnouncementPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useIsAdminRole();
  const { ref, inView } = useInView();

  // 스크롤 컨테이너 ref
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedCategory = (searchParams.get("tab") ||
    "ALL") as (typeof ANNOUNCE_CATEGORY_LIST)[number]["value"];

  const selectedSubValue = searchParams.get("sub");

  const selectedSubCategoryIndex = useMemo(() => {
    if (!selectedSubValue) return 0;
    const index = ANNOUNCE_SUB_CATEGORY_LIST.findIndex(
      (item) => item.value === selectedSubValue,
    );
    return index >= 0 ? index : 0;
  }, [selectedSubValue]);

  const handleCategoryClick = (
    category: (typeof ANNOUNCE_CATEGORY_LIST)[number]["value"],
  ) => {
    setSearchParams({ tab: category }, { replace: true });
  };

  const handleSubCategoryClick = (index: number) => {
    const subValue = ANNOUNCE_SUB_CATEGORY_LIST[index]?.value;

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (subValue && subValue !== "ALL") {
        newParams.set("sub", subValue);
      } else {
        newParams.delete("sub");
      }
      return newParams;
    });
  };

  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(
    JSON.parse(localStorage.getItem("recentSearches_announcement") || "[]"),
  );

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const subCategoryValue = useMemo(() => {
    if (selectedCategory !== "DORMITORY") return "ALL";
    return selectedSubValue || ANNOUNCE_SUB_CATEGORY_LIST[0].value;
  }, [selectedCategory, selectedSubValue]);

  // 탭/서브탭 변경 시 스크롤 최상단 이동 (Window + Element 모두 대응)
  useEffect(() => {
    // 1. 전체 윈도우 스크롤 초기화
    window.scrollTo(0, 0);

    // 2. 내부 컨테이너 스크롤 초기화
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [selectedCategory, subCategoryValue]);

  const pageSize = 10;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: [
      "announcements",
      "scroll",
      selectedCategory,
      subCategoryValue,
      search.trim(),
    ],
    queryFn: ({ pageParam }) =>
      getAnnouncementScrollList(
        selectedCategory,
        subCategoryValue,
        search.trim(),
        pageParam as number | undefined,
        pageSize,
      ),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: AnnouncementPost[]) => {
      if (!lastPage || lastPage.length < pageSize) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const notices = useMemo(() => {
    return (data?.pages.flat() ?? []) as AnnouncementPost[];
  }, [data]);

  const handleSearchSubmit = () => {
    const rawTerm = search;
    const trimmedTerm = search.trim();

    if (rawTerm.trim() === "") return;

    const updatedSearches = [
      trimmedTerm,
      ...recentSearches.filter((item) => item !== trimmedTerm),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem(
      "recentSearches_announcement",
      JSON.stringify(updatedSearches),
    );

    setSearch(trimmedTerm);
  };

  const handleDeleteRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();

    const updatedSearches = recentSearches.filter((item) => item !== term);
    setRecentSearches(updatedSearches);
    localStorage.setItem(
      "recentSearches_announcement",
      JSON.stringify(updatedSearches),
    );
  };

  const headerConfig = useMemo(
    () => ({
      title: "공지사항",
      secondHeader: (
        <CategoryWrapper>
          {ANNOUNCE_CATEGORY_LIST.map((category) => (
            <CategoryItem
              key={category.label.ko}
              className={selectedCategory === category.value ? "active" : ""}
              onClick={() => handleCategoryClick(category.value)}
            >
              {category.label.ko}
            </CategoryItem>
          ))}
        </CategoryWrapper>
      ),
    }),
    [selectedCategory],
  );
  useSetHeader(headerConfig);

  return (
    <NoticePageWrapper ref={scrollRef}>
      {selectedCategory === "DORMITORY" && (
        <FilterWrapper>
          <SelectableChipGroup
            Groups={ANNOUNCE_SUB_CATEGORY_LIST.map((option) => option.label.ko)}
            selectedIndex={selectedSubCategoryIndex}
            onSelect={handleSubCategoryClick}
            unselectable
            rowScrollable={true}
          />
        </FilterWrapper>
      )}

      <SearchArea>
        <SearchBar>
          <FaSearch size={16} color="#999" />
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit();
            }}
            onFocus={() => setIsSearchFocused(true)}
          />
        </SearchBar>

        {isSearchFocused && recentSearches.length > 0 && (
          <RecentSearchWrapper>
            <Label>최근 검색어</Label>
            <TagList>
              {recentSearches.map((term) => (
                <Tag
                  key={term}
                  onClick={() => {
                    setSearch(term);
                  }}
                >
                  {term}{" "}
                  <FiX
                    size="14"
                    color="#1C1C1E"
                    onClick={(e) => handleDeleteRecent(e, term)}
                  />
                </Tag>
              ))}
            </TagList>
          </RecentSearchWrapper>
        )}
      </SearchArea>

      {isLoading ? (
        <LoadingSpinner message="공지사항을 불러오는 중..." />
      ) : isError ? (
        <EmptyMessage message="공지사항을 불러오지 못했습니다." />
      ) : notices.length > 0 ? (
        <>
          <NoticeList>
            {notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                onClick={() => navigate(`/announcements/${notice.id}`)}
              >
                <NoticeTop>
                  <NoticeTitle>{notice.title}</NoticeTitle>
                  <NoticeTagWrapper>
                    {notice.emergency && <UrgentBadge>긴급</UrgentBadge>}
                    <TypeBadge type={notice.type}>
                      {getLabelByValue(notice.type)}
                    </TypeBadge>
                  </NoticeTagWrapper>
                </NoticeTop>

                <NoticeContent>{notice.content}</NoticeContent>

                <NoticeBottom>
                  <div className="viewCount">
                    <BsEye size={16} /> {notice.viewCount}
                  </div>
                  <div className="createdDate">
                    {formatTimeAgo(notice.createdDate)}
                  </div>
                </NoticeBottom>
              </NoticeCard>
            ))}
          </NoticeList>

          <div ref={ref} style={{ height: "20px" }}>
            {isFetchingNextPage && (
              <LoadingSpinner message="추가 데이터 로딩 중..." />
            )}
          </div>
        </>
      ) : (
        <EmptyMessage message="등록된 공지사항이 없습니다." />
      )}

      {isAdmin && (
        <WriteButton onClick={() => navigate("/announcements/write")}>
          ✏️ 공지사항 작성하기
        </WriteButton>
      )}
    </NoticePageWrapper>
  );
}

const NoticePageWrapper = styled.div`
  padding: 40px 16px 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fafafa;
  flex: 1;
`;

// ... 나머지 스타일 컴포넌트 생략 (이전과 동일)
const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 100%;
`;

const NoticeCard = styled.div`
  padding: 16px;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }
`;

const NoticeTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NoticeTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1c1c1e;
  padding-right: 8px;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoticeContent = styled.div`
  font-size: 12px;
  color: #444;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoticeBottom = styled.div`
  font-size: 12px;
  color: #444;
  display: flex;
  align-items: center;
  gap: 4px;

  flex-direction: row;
  justify-content: space-between;

  .viewCount {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
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
