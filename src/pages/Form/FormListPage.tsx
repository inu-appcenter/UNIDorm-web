import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import { useNavigate } from "react-router-dom";
// 1. useMemo 임포트 추가
import { useEffect, useState, useMemo } from "react";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import FormCard from "../../components/form/FormCard.tsx";
import { SurveySummary } from "../../types/formTypes.ts";
import { getAllSurveys } from "../../apis/formApis.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useIsAdminRole } from "../../hooks/useIsAdminRole.ts";

const FormListPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useIsAdminRole();

  const [forms, setForms] = useState<SurveySummary[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);

  useEffect(() => {
    const getFormList = async () => {
      try {
        setIsListLoading(true);
        const res = await getAllSurveys();
        console.log("폼 전체 리스트 불러오기 성공", res);
        setForms(res.data);
      } catch (e) {
        console.error("폼 전체 리스트 불러오기 실패", e);
      } finally {
        setIsListLoading(false);
      }
    };

    getFormList();
  }, []);

  const [searchTerm, setSearchTerm] = useState<string>("");

  // 2. 요청하신 대로 필터 이름 변경
  const filter = ["등록순", "신청 시작순", "마감 임박순"];
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);

  // 3. 검색 및 정렬 로직 추가
  const filteredAndSortedForms = useMemo(() => {
    // 3-1. 검색어로 필터링
    const filtered = forms.filter((form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // 3-2. 선택된 인덱스로 정렬
    switch (selectedFilterIndex) {
      case 0: // 등록순 (최신순으로 정렬)
        return filtered.sort(
          (a, b) =>
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime(),
        );
      case 1: // 설문시작순 (시작일이 빠른 순)
        return filtered.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
      case 2: // 설문마감순 (마감일이 빠른 순)
        return filtered.sort(
          (a, b) =>
            new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
        );
      default:
        return filtered;
    }
  }, [forms, selectedFilterIndex, searchTerm]);

  return (
    <PageWrapper>
      <Header title={"폼"} hasBack={true} />
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

            {/* 4. 렌더링 시 forms 대신 filteredAndSortedForms 사용 */}
            {isListLoading ? (
              <LoadingSpinner message="폼 목록을 불러오는 중..." />
            ) : filteredAndSortedForms.length > 0 ? (
              filteredAndSortedForms.map((form, i) => (
                <FormCard key={form.id || i} SurveySummary={form} />
              ))
            ) : (
              <EmptyMessage>
                {searchTerm ? "검색 결과가 없습니다." : "조회된 폼이 없습니다."}
              </EmptyMessage>
            )}
          </Wrapper2>
        </TitleContentArea>
      </MainContent>

      {isAdmin && (
        <WriteButton onClick={() => navigate("/admin/form/create")}>
          ✏️ 폼 등록
        </WriteButton>
      )}
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

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
`;
