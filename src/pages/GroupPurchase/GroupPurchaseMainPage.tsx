import { useState, useEffect } from "react";
import styled from "styled-components";
import GroupPurchaseList from "../../components/GroupPurchase/GroupPurchaseList";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import Header from "../../components/common/Header.tsx";
import BottomBar from "../../components/common/BottomBar.tsx";
import {
  GetGroupPurchaseListParams,
  GroupOrder,
} from "../../types/grouporder.ts";
import { getGroupPurchaseList } from "../../apis/groupPurchase.ts";
import useUserStore from "../../stores/useUserStore.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import { CATEGORY_LIST, SORT_OPTIONS } from "../../constants/constants.ts";
import {
  RecentSearchWrapper,
  TagList,
  Tag,
  Label,
} from "../../styles/groupPurchase.ts";
import { FiX } from "react-icons/fi";

export default function GroupPurchaseMainPage() {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [selectedCategory, setSelectedCategory] =
    useState<GetGroupPurchaseListParams["type"]>("전체");
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sortOption, setSortOption] =
    useState<GetGroupPurchaseListParams["sort"]>("마감임박순");
  // 게시글 상태
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleCategoryClick = (category: (typeof CATEGORY_LIST)[number]) => {
    setSelectedCategory(category);
  };

  const fetchGroupOrders = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const params: GetGroupPurchaseListParams = {
        sort: sortOption,
        type: selectedCategory,
        search: searchTerm || undefined,
      };
      const data = await getGroupPurchaseList(params);
      console.log("공동구매 게시글 불러오기 성공 : ", data);
      setGroupOrders(data);
    } catch (error) {
      console.error("게시글 목록 불러오기 실패:", error);
      setGroupOrders([]); // 에러 발생 시 목록을 비웁니다.
    } finally {
      setLoading(false);
    }
  };

  // 최근 검색어 불러오기
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearchSubmit = () => {
    const rawTerm = search;
    const trimmedTerm = search.trim();

    fetchGroupOrders(trimmedTerm);

    if (rawTerm.trim() === "") return;

    const updatedSearches = [
      trimmedTerm,
      ...recentSearches.filter((item) => item !== trimmedTerm),
    ].slice(0, 10);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    setSearch("");
  };

  const handleDeleteRecent = (term: string) => {
    const updatedSearches = recentSearches.filter((item) => item !== term);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // 게시글 목록 불러오기
  useEffect(() => {
    fetchGroupOrders();
  }, [selectedCategory, sortOption]);

  return (
    <PageWrapper>
      <Header
        title="공동구매"
        hasBack={false}
        showAlarm={true}
        secondHeader={
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
        }
      />

      <SortFilterWrapper>
        {SORT_OPTIONS.map((option) => (
          <SortButton
            key={option}
            className={sortOption === option ? "active" : ""}
            onClick={() => setSortOption(option)}
          >
            {option}
          </SortButton>
        ))}
      </SortFilterWrapper>

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
            // onBlur={() => setIsSearchFocused(false)}
          />
        </SearchBar>

        {isSearchFocused && recentSearches.length > 0 && (
          <RecentSearchWrapper>
            <Label>최근 검색어</Label>
            <TagList>
              {recentSearches.map((term) => (
                <Tag key={term}>
                  {term}{" "}
                  <FiX
                    size="14"
                    color="#1C1C1E"
                    onClick={() => handleDeleteRecent(term)}
                  />
                </Tag>
              ))}
            </TagList>
          </RecentSearchWrapper>
        )}
      </SearchArea>

      {/* 🔽 로딩 상태에 따라 스피너, 목록, 빈 메시지를 조건부 렌더링합니다. */}
      {loading ? (
        <LoadingSpinner message="공동구매 목록을 불러오는 중..." />
      ) : groupOrders.length > 0 ? (
        <GroupPurchaseList groupOrders={groupOrders} />
      ) : (
        <EmptyMessage message="해당 조건의 공동구매가 없습니다." />
      )}

      {isLoggedIn && (
        <WriteButton onClick={() => navigate("/groupPurchase/write")}>
          ✏️ 글쓰기
        </WriteButton>
      )}

      <BottomBar />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding: 122px 16px 140px;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CategoryWrapper = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  border-bottom: 1px solid silver;
`;

const CategoryItem = styled.div`
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: #aaa;
  cursor: pointer;
  padding: 6px 0;

  &.active {
    color: black;
    font-weight: bold;
    border-bottom: 2px solid black;
    padding-bottom: 2px;
  }
`;

const SearchArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SearchBar = styled.div`
  height: fit-content;
  background-color: #f4f4f4;
  border-radius: 999px;
  padding: 12px 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;

  input {
    border: none;
    background: none;
    width: 100%;
    font-size: 14px;
    color: #333;

    ::placeholder {
      color: #999;
    }

    :focus {
      outline: none;
    }
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

const SortFilterWrapper = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  white-space: nowrap;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const SortButton = styled.button`
  background-color: transparent;
  border: 1px solid #007aff;
  border-radius: 999px;
  padding: 4px 16px;
  cursor: pointer;
  box-sizing: border-box;

  color: var(--m-1, #0a84ff);
  font-family: AppleSDGothicNeoM00;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.38px;

  &.active {
    background-color: #007bff;
    color: white;
    font-weight: bold;
  }
`;
