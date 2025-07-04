import React, { useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header";
import BottomBar from "../../components/common/BottomBar";
import GroupPurchaseList from "../../components/GroupPurchase/GroupPurchaseList";
import { useNavigate } from "react-router-dom";

// ✅ 카테고리 목록
const CATEGORY_LIST = ["전체", "배달", "식자재", "생활용품", "기타"];

export default function GroupPurchaseMainPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    // 👉 추후 category에 따라 필터링 로직 넣을 수 있음!
  };

  return (
    <PageWrapper>
      <TopSection>
        <Header title="공동구매" hasBack={true} showAlarm={true} />
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
      </TopSection>

      <ContentArea>
        <GroupPurchaseList selectedCategory={selectedCategory} />
        {/* 👆 지금은 필터링 안 하더라도 props 전달 준비해두면 좋아! */}
      </ContentArea>

      <WriteButton onClick={() => navigate("/group/write")}>✏️ 글쓰기</WriteButton>
      <BottomBar />
    </PageWrapper>
  );
}


const PageWrapper = styled.div`
  padding-top: 70px; /* 헤더 높이만큼 */
  padding-bottom: 90px; /* 하단 버튼 영역 */
  background: #fafafa;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const TopSection = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 20px 12px;
  box-sizing: border-box;
  z-index: 1;
`;

const ContentArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px;
  box-sizing: border-box;
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

/* 카테고리 탭 스타일 */
const CategoryWrapper = styled.div`
  display: flex;
  gap: 20px;
  padding: 8px 0;
  overflow-x: auto;
`;

const CategoryItem = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #c1c1c1;
  cursor: pointer;

  &.active {
    color: black;
    font-weight: bold;
    border-bottom: 2px solid black;
  }
`;
