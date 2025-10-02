import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useState, useRef } from "react"; // useRef import
import { AdminComplaint } from "../../types/complain.ts";
import { getAllComplaints } from "../../apis/complainAdmin.ts";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import ComplainFilter from "../../components/complain/ComplainFilter.tsx";

const ComplainAdminPage = () => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterGroupRef = useRef<HTMLDivElement>(null); // ⭐ useRef 추가

  const menus = ["최근 3개월", "2025"];
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await getAllComplaints();
        setComplaints(response.data);
      } catch (error) {
        console.error("민원 목록 불러오기 실패:", error);
      }
    };

    if (isLoggedIn) {
      fetchComplaints();
    }
  }, [isLoggedIn]);

  // ⭐ 외부 클릭 감지 로직 추가
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        filterGroupRef.current && // ref가 존재하고
        !filterGroupRef.current.contains(event.target as Node) // 클릭된 요소가 ref 내부에 포함되지 않는 경우
      ) {
        setIsFilterOpen(false); // 필터 닫기
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isFilterOpen]); // isFilterOpen 상태가 변경될 때마다 실행

  const handleToggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <ComplainListPageWrapper>
      <Header
        title={"생활원 민원 관리자 페이지"}
        hasBack={true}
        backPath={"/admin"}
      />

      {/* 민원 목록 */}
      <TitleContentArea
        title={"민원 목록"}
        children={
          <Wrapper2>
            <SearchInput />
            <FilterGroup ref={filterGroupRef}>
              <FilterButton onClick={handleToggleFilter}>필터</FilterButton>
              <SelectableChipGroup
                Groups={menus}
                selectedIndex={selectedMenuIndex}
                onSelect={setSelectedMenuIndex}
              />
              {/* 드롭다운 필터 컴포넌트 */}
              {isFilterOpen && (
                <FilterDropdownWrapper>
                  <ComplainFilter
                    onClose={() => setIsFilterOpen(false)}
                    onApply={() => setIsFilterOpen(false)}
                  />
                </FilterDropdownWrapper>
              )}
            </FilterGroup>

            {complaints ? (
              <ComplainListTable data={complaints} isAdmin={true} />
            ) : (
              <EmptyMessage>조회된 민원이 없습니다.</EmptyMessage>
            )}
          </Wrapper2>
        }
      />
    </ComplainListPageWrapper>
  );
};
export default ComplainAdminPage;

const ComplainListPageWrapper = styled.div`
  padding: 90px 16px 40px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fafafa;

  flex: 1;
`;

const Wrapper2 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const FilterGroup = styled.div`
  position: relative; // 드롭다운 위치 기준
  display: flex;
  flex-direction: row;
  gap: 12px;
`;

const FilterButton = styled.button`
  display: flex;
  padding: 4px 16px;
  justify-content: center;
  align-items: center;
  gap: 5px;
  min-width: fit-content;
  background: none;
  border-radius: 8px;
  border: 1px solid var(--6, #8e8e93);
  color: var(--6, #8e8e93);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.38px;

  cursor: pointer;
`;

const EmptyMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
`;

// 드롭다운 스타일 추가
const FilterDropdownWrapper = styled.div`
  position: absolute;
  top: 100%; // FilterGroup 아래에 위치
  left: 0; // 오른쪽 정렬
  z-index: 99;
  margin-top: 8px;

  /* 애니메이션 적용 */
  transform-origin: top left; // 변형 시작점을 오른쪽 상단으로 설정
  animation: scale-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;

  @keyframes scale-up {
    0% {
      transform: scale(0.1);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* 768px 이상(태블릿, 데스크톱)에서만 max-width: 50% 적용 */
  @media (min-width: 768px) {
    max-width: 50%;
  }
`;
