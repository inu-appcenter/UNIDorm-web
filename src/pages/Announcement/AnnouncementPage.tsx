import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import { useNavigate } from "react-router-dom";
import { BsEye } from "react-icons/bs";
import { useEffect, useState } from "react";
import { Announcement } from "../../types/announcements.ts";
import { getAnnouncements } from "../../apis/announcements.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import { useIsAdminRole } from "../../hooks/useIsAdminRole.ts";
import { formatTimeAgo } from "../../utils/dateUtils.ts";
import {
  NoticeTagWrapper,
  TypeBadge,
  UrgentBadge,
} from "../../styles/announcement.ts";
import {
  ANNOUNCE_CATEGORY_LIST,
  ANNOUNCE_SUB_CATEGORY_LIST,
} from "../../constants/announcement.ts";
import { CategoryItem, CategoryWrapper } from "../../styles/header.ts";
import { FaSearch } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import {
  Label,
  RecentSearchWrapper,
  SearchArea,
  SearchBar,
  FilterWrapper,
  Tag,
  TagList,
} from "../../styles/common.ts";
import { getLabelByValue } from "../../utils/announceUtils.ts";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";

export default function AnnouncementPage() {
  const navigate = useNavigate();
  const { isAdmin } = useIsAdminRole();

  const [notices, setNotices] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState<(typeof ANNOUNCE_CATEGORY_LIST)[number]["value"]>("ALL");

  const [selectedSubCategory, setSelectedSubCategory] = useState(0);

  const handleCategoryClick = (
    category: (typeof ANNOUNCE_CATEGORY_LIST)[number]["value"],
  ) => {
    setSelectedCategory(category);
    setSelectedSubCategory(0);
  };

  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(
    JSON.parse(localStorage.getItem("recentSearches_announcement") || "[]"),
  );

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  async function fetchData(search?: string) {
    setLoading(true);
    try {
      const response = await getAnnouncements(
        selectedCategory,
        ANNOUNCE_SUB_CATEGORY_LIST[selectedSubCategory]["value"],
        search,
      );
      console.log("공지사항 불러오기 성공:", response);
      setNotices(response.data);
    } catch (error) {
      console.error("공지사항 불러오기 실패", error);
    } finally {
      setLoading(false);
    }
  }

  //공지사항 불러오기
  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedSubCategory]);

  //검색 실행 시
  const handleSearchSubmit = () => {
    const rawTerm = search;
    const trimmedTerm = search.trim();

    if (rawTerm.trim() === "") return;
    fetchData(trimmedTerm);

    const updatedSearches = [
      trimmedTerm,
      ...recentSearches.filter((item) => item !== trimmedTerm),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem(
      "recentSearches_announcement",
      JSON.stringify(updatedSearches),
    );

    setSearch("");
  };

  // 최근 검색어 삭제
  const handleDeleteRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation(); // 클릭 이벤트 전파 막기

    const updatedSearches = recentSearches.filter((item) => item !== term);
    setRecentSearches(updatedSearches);
    localStorage.setItem(
      "recentSearches_announcement",
      JSON.stringify(updatedSearches),
    );
  };

  return (
    <NoticePageWrapper>
      <Header
        title="공지사항"
        hasBack={true}
        secondHeader={
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
        }
      />
      {selectedCategory === "DORMITORY" && (
        <FilterWrapper>
          <SelectableChipGroup
            Groups={ANNOUNCE_SUB_CATEGORY_LIST.map((option) => option.label.ko)}
            selectedIndex={selectedSubCategory}
            onSelect={setSelectedSubCategory}
            unselectable
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
            // onBlur={() => {
            //   setTimeout(() => {
            //     setIsSearchFocused(false);
            //   }, 100);
            // }}
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
      {/* 🔽 로딩 상태에 따라 스피너, 공지사항 목록, 빈 메시지를 조건부 렌더링합니다. */}
      {loading ? (
        <LoadingSpinner message="공지사항을 불러오는 중..." />
      ) : notices.length > 0 ? (
        <NoticeList>
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              onClick={() => {
                navigate(`/announcements/${notice.id}`);
              }}
            >
              <NoticeTop>
                <NoticeTitle>{notice.title}</NoticeTitle>
                <NoticeTagWrapper>
                  {notice.emergency && <UrgentBadge>긴급</UrgentBadge>}
                  {/* props로 announcementType 전달 */}
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
  padding: 122px 16px 90px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fafafa;

  flex: 1;
`;

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

  display: -webkit-box;
  -webkit-line-clamp: 1; /* 한 줄 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoticeContent = styled.div`
  font-size: 12px;
  color: #444;

  display: -webkit-box;
  -webkit-line-clamp: 2; /* 두 줄 */
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
