// 📄 ComplainAdminPage.tsx

import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useMemo, useRef, useState } from "react"; // useMemo 추가
import { AdminComplaint, ComplaintSearchDto } from "@/types/complain";
import { getAllComplaints, searchComplaints } from "@/apis/complainAdmin";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import ComplainFilter from "../../components/complain/ComplainFilter.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx"; // 로딩 스피너 추가

const ComplainAdminPage = () => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterGroupRef = useRef<HTMLDivElement>(null);

  // 🔽 검색어 상태 추가
  const [searchTerm, setSearchTerm] = useState<string>("");
  // 🔽 로딩 상태 추가
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const menus = ["최근 3개월", "2025"];
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);

  // ⭐ 필터 상태들을 부모 컴포넌트에서 관리 (상태 끌어올리기)
  const [selectedDormitoryIndex, setSelectedDormitoryIndex] = useState<
    number | null
  >(null);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState<number | null>(
    null,
  );
  const [selectedStatusIndex, setSelectedStatusIndex] = useState<number | null>(
    null,
  );
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(
    null,
  );
  const [manager, setManager] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBed, setSelectedBed] = useState("");

  // 초기 민원 목록 로드
  useEffect(() => {
    const fetchAllComplaints = async () => {
      setIsLoading(true); // 로딩 시작
      try {
        const response = await getAllComplaints();
        setComplaints(response.data);
      } catch (error) {
        console.error("민원 목록 불러오기 실패:", error);
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };
    if (isLoggedIn) {
      fetchAllComplaints();
    }
  }, [isLoggedIn]);

  // 외부 클릭 감지 로직
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        filterGroupRef.current &&
        !filterGroupRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isFilterOpen]);

  const handleToggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // 필터 적용 핸들러 (서버 필터링)
  const handleApplyFilters = async (filters: ComplaintSearchDto) => {
    console.log("적용할 필터:", filters);
    setIsLoading(true); // 로딩 시작
    try {
      // ⚠️ 주의: 서버 필터링(searchComplaints) 시에는 클라이언트 필터링 로직(useMemo)이 필요하지 않을 수 있습니다.
      // 여기서는 searchComplaints를 호출하여 서버에서 필터링된 데이터를 가져옵니다.
      const response = await searchComplaints(filters);
      console.log("필터 응답 결과: ", response);
      setComplaints(response.data);
      setIsFilterOpen(false);
    } catch (error) {
      console.error("민원 검색 실패:", error);
    } finally {
      setIsLoading(false); // 로딩 완료
    }
  };

  // ⭐ 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSelectedDormitoryIndex(null);
    setSelectedTypeIndex(null);
    setSelectedStatusIndex(null);
    setSelectedBlockIndex(null);
    setManager("");
    setSelectedFloor("");
    setSelectedRoom("");
    setSelectedBed("");
    // 필터 초기화 후, 전체 목록을 다시 불러올지 여부는 API 스펙에 따라 결정됩니다.
    // 여기서는 일단 상태만 초기화하고, 목록을 다시 로드하려면 getAllComplaints를 호출해야 합니다.
    // 예: fetchAllComplaints();
  };

  const filteredComplaints = useMemo(() => {
    let list = complaints;
    if (searchTerm) {
      list = list.filter((complaint) =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    /**
     * ❗ 아이폰(Safari) 호환성을 위한 날짜 파싱 헬퍼 함수
     * '2025.10.23' 형식을 '2025/10/23' 형식으로 변경합니다.
     */
    const parseSafeDate = (dateString: string) => {
      // 🔽 수정된 부분: 모든 점(.)을 슬래시(/)로 변경 (g: global)
      const safariSafeFormat = dateString.replace(/\./g, "/");
      return new Date(safariSafeFormat);
    };

    if (selectedMenuIndex === 0) {
      list = list.filter((complaint) => {
        // 🔽 수정된 헬퍼 함수 사용
        const complaintDate = parseSafeDate(complaint.date);
        return complaintDate >= threeMonthsAgo;
      });
    } else if (selectedMenuIndex === 1) {
      list = list.filter((complaint) => {
        // 🔽 수정된 헬퍼 함수 사용
        const complaintDate = parseSafeDate(complaint.date);
        const year = complaintDate.getFullYear();
        return year === 2025;
      });
    }

    return list;
  }, [searchTerm, complaints, selectedMenuIndex]);

  return (
    <ComplainListPageWrapper>
      <Header title={"생활원 민원 관리"} hasBack={true} />
      <TitleContentArea
        title={"민원 목록"}
        children={
          <Wrapper2>
            {/* 🔽 SearchInput에 value와 onChange 핸들러 연결 */}
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterGroup ref={filterGroupRef}>
              <FilterButton onClick={handleToggleFilter}>필터</FilterButton>
              <SelectableChipGroup
                Groups={menus}
                selectedIndex={selectedMenuIndex}
                onSelect={setSelectedMenuIndex}
              />
              {isFilterOpen && (
                <FilterDropdownWrapper>
                  {/* ⭐ 자식 컴포넌트에 상태와 핸들러를 모두 props로 전달 */}
                  <ComplainFilter
                    dormitoryIndex={selectedDormitoryIndex}
                    typeIndex={selectedTypeIndex}
                    statusIndex={selectedStatusIndex}
                    blockIndex={selectedBlockIndex}
                    manager={manager}
                    floor={selectedFloor}
                    room={selectedRoom}
                    bed={selectedBed}
                    onDormitoryChange={setSelectedDormitoryIndex}
                    onTypeChange={setSelectedTypeIndex}
                    onStatusChange={setSelectedStatusIndex}
                    onBlockChange={setSelectedBlockIndex}
                    onManagerChange={setManager}
                    onFloorChange={setSelectedFloor}
                    onRoomChange={setSelectedRoom}
                    onBedChange={setSelectedBed}
                    onApply={handleApplyFilters}
                    onReset={handleResetFilters}
                  />
                </FilterDropdownWrapper>
              )}
            </FilterGroup>

            {/* 🔽 로딩 중이거나, 필터링된 목록을 표시 */}
            {isLoading ? (
              <LoadingSpinner message="민원 목록을 불러오는 중..." />
            ) : filteredComplaints.length > 0 ? (
              // 🔽 필터링된 목록(filteredComplaints)을 테이블에 전달
              <ComplainListTable data={filteredComplaints} isAdmin={true} />
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

// (styled-components 코드는 이전과 동일)
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
  position: relative;
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

const FilterDropdownWrapper = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 99;
  margin-top: 8px;

  transform-origin: top left;
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

  @media (min-width: 768px) {
    max-width: 50%;
  }
`;
