// src/pages/groupPurchase/GroupPurchaseMainPage.tsx
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import GroupPurchaseList from "../../components/GroupPurchase/GroupPurchaseList";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import Header from "../../components/common/Header.tsx";
import {
  fetchGroupOrders,
  GroupOrderItem,
  GroupOrderType,
} from "../../apis/groupPurchase.ts";

const CATEGORY_LIST: GroupOrderType[] = ["전체", "배달", "식자재", "생활용품", "기타"];
const SORT_OPTIONS = ["마감 임박 순", "최신순", "좋아요 순"] as const;
type SortOption = typeof SORT_OPTIONS[number];

export default function GroupPurchaseMainPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<GroupOrderType>("전체");
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(["휴지", "마라탕", "닭가슴살"]);
  const [sortOption, setSortOption] = useState<SortOption>("마감 임박 순");

  const [rawItems, setRawItems] = useState<GroupOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGroupOrders();
        setRawItems(data);
      } catch (e: any) {
        setError(e?.message ?? "목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filteredSorted = useMemo(() => {
    let arr = [...rawItems];

    if (selectedCategory !== "전체") {
      arr = arr.filter(
        (it) => it.groupOrderType === selectedCategory || it.type === selectedCategory
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter((it) => it.title.toLowerCase().includes(q));
    }

    arr.sort((a, b) => {
      if (sortOption === "마감 임박 순") {
        const d1 = new Date(a.deadline).getTime();
        const d2 = new Date(b.deadline).getTime();
        return d1 - d2;
      }
      if (sortOption === "최신순") {
        return new Date(b.createDate).getTime() - new Date(a.createDate).getTime();
      }
      if (sortOption === "좋아요 순") {
        // likeCount가 없으니 참여율로 대체 정렬
        const p1 = (a.currentPeople ?? 0) / (a.maxPeople || 1);
        const p2 = (b.currentPeople ?? 0) / (b.maxPeople || 1);
        return p2 - p1;
      }
      return 0;
    });

    return arr;
  }, [rawItems, selectedCategory, search, sortOption]);

  const handleCategoryClick = (category: GroupOrderType) => {
    setSelectedCategory(category);
  };

  const handleDeleteRecent = (term: string) => {
    setRecentSearches((prev) => prev.filter((item) => item !== term));
  };

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

      <ContentArea>
        <SearchBar>
          <FaSearch size={16} color="#999" />
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim()) {
                setRecentSearches((prev) =>
                  [search.trim(), ...prev.filter((v) => v !== search.trim())].slice(0, 10)
                );
              }
            }}
          />
        </SearchBar>

        <RecentSearchWrapper>
          <Label>최근 검색어</Label>
          <TagList>
            {recentSearches.map((term) => (
              <Tag key={term} onClick={() => setSearch(term)}>
                {term}
                <DeleteBtn
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRecent(term);
                  }}
                >
                  ×
                </DeleteBtn>
              </Tag>
            ))}
          </TagList>
        </RecentSearchWrapper>

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

        {loading && <div>불러오는 중...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!loading && !error && <GroupPurchaseList items={filteredSorted} />}
      </ContentArea>

      <WriteButton onClick={() => navigate("/groupPurchase/write")}>
        ✏️ 글쓰기
      </WriteButton>
    </PageWrapper>
  );
}

/* ---------- styles (네 기존 스타일 그대로) ---------- */
const PageWrapper = styled.div`
  padding-top: 80px;
  background: #fafafa;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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

const SearchBar = styled.div`
  margin: 12px 12px 20px 12px;
  height: 40px;
  background-color: #f4f4f4;
  border-radius: 999px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;

  input {
    border: none;
    background: none;
    width: 100%;
    font-size: 14px;
    color: #333;

    ::placeholder { color: #999; }
    :focus { outline: none; }
  }
`;

const RecentSearchWrapper = styled.div`
  padding: 0 12px;
  margin-bottom: 12px;
`;

const Label = styled.div`
  font-size: 14px;
  color: #444;
  margin-bottom: 6px;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.div`
  background-color: #f0f0f0;
  border-radius: 20px;
  padding: 6px 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;

const DeleteBtn = styled.button`
  border: none;
  background: none;
  color: #aaa;
  font-size: 14px;
  cursor: pointer;
`;

const ContentArea = styled.div`
  padding-top: 32px;
  padding-bottom: 100px;
  padding-left: 16px;
  padding-right: 16px;
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
  margin-bottom: 12px;
  gap: 8px;
  padding: 0px 12px 0 12px;
  flex-wrap: wrap;
`;

const SortButton = styled.button`
  background-color: #f4f4f4;
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;

  &.active {
    background-color: #007bff;
    color: white;
    font-weight: bold;
  }
`;
