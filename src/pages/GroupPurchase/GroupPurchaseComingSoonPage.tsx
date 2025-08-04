import { useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import 공동구매커밍쑨 from "../../assets/groupPurchase/공동구매커밍쑨.png";

const CATEGORY_LIST = ["전체", "배달", "식자재", "생활용품", "기타"];

export default function GroupPurchaseComingSoonPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
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
      <Wrapper>
        <img src={공동구매커밍쑨} className={"comingsoon"} />
      </Wrapper>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding-top: 100px;
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

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .comingsoon {
    width: 100%;
    height: 100%;
    max-width: 500px;
    object-fit: cover;
  }
`;
