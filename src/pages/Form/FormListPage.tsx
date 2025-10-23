import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import FormCard from "../../components/form/FormCard.tsx";

const FormListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filter = ["최근 3개월", "2025"];
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);

  return (
    <PageWrapper>
      <Header title={"폼 목록"} hasBack={true} />
      <MainContent>
        <TitleContentArea title={""}>
          <Wrapper2>
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={"폼 제목을 검색해보세요"}
            />
            <SelectableChipGroup
              Groups={filter}
              selectedIndex={selectedFilterIndex}
              onSelect={setSelectedFilterIndex}
              backgroundColor={"transparent"}
              color={"#0A84FF"}
              borderColor={"#007AFF"}
            />
            <FormCard />
            <FormCard />

            {/*{isListLoading ? (*/}
            {/*  <LoadingSpinner message="폼 목록을 불러오는 중..." />*/}
            {/*) : filteredComplaints.length > 0 ? (*/}
            {/*  <ComplainListTable data={filteredComplaints} />*/}
            {/*) : (*/}
            {/*  <EmptyMessage>조회된 폼이 없습니다.</EmptyMessage>*/}
            {/*)}*/}
          </Wrapper2>
        </TitleContentArea>
      </MainContent>

      {/*{isLoggedIn && (*/}
      <WriteButton onClick={() => navigate("/admin/form/create")}>
        ✏️ 폼 추가하기
      </WriteButton>
      {/*)}*/}
    </PageWrapper>
  );
};
export default FormListPage;

const PageWrapper = styled.div`
  padding: 90px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;

  overflow-y: auto;
  background-color: white;
  flex: 1;
  align-items: center; // 🖥️ PC 레이아웃을 위해 중앙 정렬 추가

  .description {
    font-size: 14px;
  }
`;

// 🔽 추가된 스타일: 메인 콘텐츠 레이아웃 래퍼
const MainContent = styled.div`
  display: flex;
  flex-direction: column; // 모바일 기본: 세로 배치
  gap: 32px;
  flex: 1;
  width: 100%;

  /* PC 화면 (1024px 이상)에서 가로 배치로 변경 */
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start; /* 상단 정렬 */
    max-width: 1200px;
    //padding: 32px;
    box-sizing: border-box;
  }
`;

const Wrapper2 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`;

const WriteButton = styled.button`
  position: fixed;
  bottom: 40px;
  right: 20px;
  background-color: #007bff;
  color: #f4f4f4;
  border-radius: 24px;
  padding: 12px 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 100;
`;
