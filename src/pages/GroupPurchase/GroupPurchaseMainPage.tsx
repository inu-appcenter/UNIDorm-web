import { useState } from "react";
import styled from "styled-components";
import BottomBar from "../../components/common/BottomBar";
import GroupPurchaseList from "../../components/GroupPurchase/GroupPurchaseList";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import Header from "../../components/common/Header.tsx";

const CATEGORY_LIST = ["전체", "배달", "식자재", "생활용품", "기타"];
const SORT_OPTIONS = ["마감 임박 순", "최신순", "좋아요 순"];

export default function GroupPurchaseMainPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "휴지",
    "마라탕",
    "닭가슴살",
  ]);
  const [sortOption, setSortOption] = useState("마감 임박순");

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleDeleteRecent = (term: string) => {
    setRecentSearches(recentSearches.filter((item) => item !== term));
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
          />
        </SearchBar>

        <RecentSearchWrapper>
          <Label>최근 검색어</Label>
          <TagList>
            {recentSearches.map((term) => (
              <Tag key={term}>
                {term}{" "}
                <DeleteBtn onClick={() => handleDeleteRecent(term)}>
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

        <GroupPurchaseList />
      </ContentArea>

      <WriteButton onClick={() => navigate("/group/write")}>
        ✏️ 글쓰기
      </WriteButton>
      <BottomBar />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding-top: 80px;
  background: #fafafa;

  width: 100%;
  height: 100%;
  box-sizing: border-box;

  overflow-y: auto;
  display: flex;
  flex-direction: column;
  //height: 100vh;
  //overflow-x: hidden;
`;

// const TopFixedSection = styled.div`
//   position: fixed;
//   top: 40px;
//   left: 0;
//   width: 100%;
//   background-color: white;
//   z-index: 999;
//   padding: 70px 20px 8px 20px;
//   box-sizing: border-box;
// `;

const CategoryWrapper = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  //background-color: white;
  border-bottom: 1px solid silver;
`;

const CategoryItem = styled.div`
  flex: 1; /* 균등 너비 분배 */
  text-align: center; /* 텍스트 가운데 정렬 */
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
  margin: 12px 12px 0 12px;
  margin-bottom: 20px;
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

    ::placeholder {
      color: #999;
    }

    :focus {
      outline: none;
    }
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
