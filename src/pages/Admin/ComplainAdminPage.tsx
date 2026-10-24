// 📄 ComplainAdminPage.tsx

import styled from "styled-components";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import { useEffect, useMemo, useRef, useState } from "react";
import { ComplaintSearchDto } from "@/types/complain";
import {
  downloadComplaintsCSV,
  downloadFilteredComplaintsCSV,
} from "@/apis/complainAdmin";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import ComplainFilter from "../../components/complain/ComplainFilter.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useAdminComplaints } from "@/queries/complaints";

const ComplainAdminPage = () => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterGroupRef = useRef<HTMLDivElement>(null);

  // 검색어 및 로딩 상태
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 서버 필터링 적용 상태 (CSV 다운로드 시 사용)
  const [appliedFilters, setAppliedFilters] =
    useState<ComplaintSearchDto | null>(null);

  const menus = ["최근 3개월", "2025"];
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);

  // 필터 UI 상태 (필터 컴포넌트와 동기화)
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

  // 적용된 필터가 없으면 전체 민원, 있으면 필터 검색 결과
  const {
    data: complaints = [],
    isLoading: isInitialLoading,
    isPlaceholderData,
  } = useAdminComplaints(appliedFilters, isLoggedIn);
  // 필터를 바꿔 새로 검색하는 동안에만 스피너 (자동 재조회 때는 기존 목록 유지)
  const isLoading = isInitialLoading || isPlaceholderData;

  // 외부 클릭 시 필터 닫기
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

  // 필터 적용 핸들러 (서버 필터링 API 호출)
  const handleApplyFilters = (filters: ComplaintSearchDto) => {
    setAppliedFilters(filters); // 현재 적용된 필터 상태 저장
    setIsFilterOpen(false);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSelectedDormitoryIndex(null);
    setSelectedTypeIndex(null);
    setSelectedStatusIndex(null);
    setSelectedBlockIndex(null);
    setManager("");
    setSelectedFloor("");
    setSelectedRoom("");
    setSelectedBed("");
    setAppliedFilters(null); // 필터 초기화 후 전체 목록 조회
  };

  // CSV 다운로드 통합 핸들러
  const handleDownloadCSV = async () => {
    try {
      if (!window.confirm("현재 필터링된 민원을 다운로드할까요?")) {
        return;
      }

      // 적용된 필터 조건이 있으면 검색 API, 없으면 전체 API 호출
      const response = appliedFilters
        ? await downloadFilteredComplaintsCSV(appliedFilters)
        : await downloadComplaintsCSV();

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const now = new Date();
      const timestamp = now.toISOString().replace(/[:T]/g, "_").split(".")[0];
      const fileName = appliedFilters
        ? `민원목록_검색결과_${timestamp}.csv`
        : `민원목록_전체_${timestamp}.csv`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV 다운로드 실패:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }
  };

  // 클라이언트 측 필터링 (검색어 및 기간)
  const filteredComplaints = useMemo(() => {
    let list = complaints;

    // 검색어 필터링
    if (searchTerm) {
      list = list.filter((complaint) =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const parseSafeDate = (dateString: string) => {
      const safariSafeFormat = dateString.replace(/\./g, "/");
      return new Date(safariSafeFormat);
    };

    // 상단 칩 그룹 필터링 (기간)
    if (selectedMenuIndex === 0) {
      list = list.filter((complaint) => {
        const complaintDate = parseSafeDate(complaint.date);
        return complaintDate >= threeMonthsAgo;
      });
    } else if (selectedMenuIndex === 1) {
      list = list.filter((complaint) => {
        const complaintDate = parseSafeDate(complaint.date);
        const year = complaintDate.getFullYear();
        return year === 2025;
      });
    }

    return list;
  }, [searchTerm, complaints, selectedMenuIndex]);

  // 헤더 우측 메뉴 설정
  const menuItems = [
    { label: "민원 목록 다운로드", onClick: handleDownloadCSV },
  ];
  useSetHeader({ title: "전체 민원 목록(관리자)", menuItems });

  return (
    <ComplainListPageWrapper>
      <TitleContentArea
        title={"민원 목록"}
        children={
          <Wrapper2>
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

            {isLoading ? (
              <LoadingSpinner message="민원 목록을 불러오는 중..." />
            ) : filteredComplaints.length > 0 ? (
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

const ComplainListPageWrapper = styled.div`
  padding: 0 16px 100px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
  overflow-y: auto;
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
