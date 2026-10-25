// 📄 ComplainAdminPage.tsx

import styled from "styled-components";
import SearchInput from "../../components/complain/SearchInput.tsx";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ComplainListTable from "../../components/complain/ComplainListTable.tsx";
import useUserStore from "../../stores/useUserStore.ts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComplaintSearchDto } from "@/types/complain";
import { downloadComplaintsCSV } from "@/apis/complainAdmin";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import ComplainFilter from "../../components/complain/ComplainFilter.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useAdminComplaints } from "@/queries/complaints";
import { downloadComplaintsAsCsv } from "@/utils/csvUtils";
import { formatBuildingFromServer } from "@/constants/constants";
import { AlertCircle, Filter, RotateCw, X } from "lucide-react";

const PERIOD_MENUS = ["전체", "최근 1개월", "최근 3개월", "올해"];

const ComplainAdminPage = () => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterGroupRef = useRef<HTMLDivElement>(null);

  // 검색창 입력 상태 및 실제 적용된 검색어 (Enter 또는 검색 아이콘 클릭 시 반영)
  const [searchInput, setSearchInput] = useState<string>("");
  const [appliedKeyword, setAppliedKeyword] = useState<string>("");

  // 서버 상세 필터링 상태 (ComplainFilter에서 적용된 조건)
  const [appliedDetailFilters, setAppliedDetailFilters] =
    useState<ComplaintSearchDto | null>(null);

  // 상단 기간 필터 (클라이언트 날짜 기준 필터링)
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState<number>(0);

  // 검색어와 상세 필터를 하나의 통합 서버 검색 DTO로 결합
  const serverSearchDto = useMemo<ComplaintSearchDto | null>(() => {
    const dto: ComplaintSearchDto = {
      ...(appliedDetailFilters || {}),
      ...(appliedKeyword.trim() ? { keyword: appliedKeyword.trim() } : {}),
    };
    return Object.keys(dto).length > 0 ? dto : null;
  }, [appliedDetailFilters, appliedKeyword]);

  // 적용된 필터 조건으로 서버에서 민원 목록 조회
  const {
    data: complaints = [],
    isLoading: isInitialLoading,
    isPlaceholderData,
    isError,
    refetch,
  } = useAdminComplaints(serverSearchDto, isLoggedIn);

  const isLoading = isInitialLoading || isPlaceholderData;

  // 외부 클릭 시 필터 팝업 닫기
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
    setIsFilterOpen((prev) => !prev);
  };

  // 검색창 엔터/아이콘 클릭 핸들러
  const handleSearchSubmit = () => {
    setAppliedKeyword(searchInput.trim());
  };

  // 필터 적용 핸들러
  const handleApplyFilters = (filters: ComplaintSearchDto | null) => {
    setAppliedDetailFilters(filters);
    setIsFilterOpen(false);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setAppliedDetailFilters(null);
    setIsFilterOpen(false);
  };

  // 전체 검색 조건(검색어, 상세 필터, 기간) 완전 초기화
  const handleResetAll = () => {
    setSearchInput("");
    setAppliedKeyword("");
    setAppliedDetailFilters(null);
    setSelectedPeriodIndex(0);
    setIsFilterOpen(false);
  };

  // 개별 상세 필터 조건 제거
  const handleRemoveDetailFilterKey = useCallback(
    (key: keyof ComplaintSearchDto) => {
      setAppliedDetailFilters((prev) => {
        if (!prev) return null;
        const nextFilters = { ...prev };
        delete nextFilters[key];
        const hasRemaining = Object.keys(nextFilters).length > 0;
        return hasRemaining ? nextFilters : null;
      });
    },
    [],
  );

  // 클라이언트 날짜 파싱 헬퍼 (Safari 호환)
  const parseSafeDate = (dateString: string): Date => {
    const safariSafeFormat = dateString.replace(/\./g, "/");
    return new Date(safariSafeFormat);
  };

  // 기간 필터링이 적용된 최종 표시 목록
  const filteredComplaints = useMemo(() => {
    if (selectedPeriodIndex === 0) {
      return complaints; // "전체"
    }

    const now = new Date();

    if (selectedPeriodIndex === 1) {
      // 최근 1개월
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return complaints.filter((c) => parseSafeDate(c.date) >= oneMonthAgo);
    }

    if (selectedPeriodIndex === 2) {
      // 최근 3개월
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return complaints.filter((c) => parseSafeDate(c.date) >= threeMonthsAgo);
    }

    if (selectedPeriodIndex === 3) {
      // 올해
      const currentYear = now.getFullYear();
      return complaints.filter(
        (c) => parseSafeDate(c.date).getFullYear() === currentYear,
      );
    }

    return complaints;
  }, [complaints, selectedPeriodIndex]);

  // CSV 다운로드 핸들러 (현재 화면에 보이는 필터링 목록을 그대로 다운로드)
  const handleDownloadScreenCSV = () => {
    if (filteredComplaints.length === 0) {
      alert("다운로드할 민원 목록이 없습니다.");
      return;
    }
    const confirmed = window.confirm(
      `현재 필터링된 민원 ${filteredComplaints.length}건을 다운로드할까요?`,
    );
    if (!confirmed) return;

    downloadComplaintsAsCsv(filteredComplaints, "민원목록_조회결과");
  };

  // 전체 원본 CSV 다운로드 (서버 원본 전체 API 호출)
  const handleDownloadServerAllCSV = async () => {
    try {
      const confirmed = window.confirm(
        "등록된 모든 민원 전체 원본 데이터를 다운로드할까요?",
      );
      if (!confirmed) return;

      const response = await downloadComplaintsCSV();
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      link.setAttribute("download", `민원목록_서버전체_${timestamp}.csv`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("서버 전체 CSV 다운로드 실패:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }
  };

  // 헤더 우측 메뉴 설정
  const menuItems = [
    { label: "현재 화면 민원 목록 다운로드", onClick: handleDownloadScreenCSV },
    { label: "전체 원본 민원 다운로드 (서버)", onClick: handleDownloadServerAllCSV },
  ];
  useSetHeader({ title: "전체 민원 목록(관리자)", menuItems });

  // 현재 적용된 상세 필터 개수 계산
  const activeDetailFilterCount = appliedDetailFilters
    ? Object.keys(appliedDetailFilters).length
    : 0;

  // 적용된 태그 목록 생성 (사용자에게 한눈에 표시하고 개별 삭제 지원)
  const activeFilterTags = useMemo(() => {
    const tags: { id: string; label: string; onRemove: () => void }[] = [];

    if (appliedKeyword) {
      tags.push({
        id: "keyword",
        label: `검색어: "${appliedKeyword}"`,
        onRemove: () => {
          setSearchInput("");
          setAppliedKeyword("");
        },
      });
    }

    if (appliedDetailFilters) {
      if (appliedDetailFilters.dormType) {
        tags.push({
          id: "dormType",
          label: `기숙사: ${appliedDetailFilters.dormType}`,
          onRemove: () => handleRemoveDetailFilterKey("dormType"),
        });
      }
      if (appliedDetailFilters.officer) {
        tags.push({
          id: "officer",
          label: `담당자: ${appliedDetailFilters.officer}`,
          onRemove: () => handleRemoveDetailFilterKey("officer"),
        });
      }
      if (appliedDetailFilters.type) {
        tags.push({
          id: "type",
          label: `유형: ${appliedDetailFilters.type}`,
          onRemove: () => handleRemoveDetailFilterKey("type"),
        });
      }
      if (appliedDetailFilters.status) {
        tags.push({
          id: "status",
          label: `상태: ${appliedDetailFilters.status}`,
          onRemove: () => handleRemoveDetailFilterKey("status"),
        });
      }
      if (appliedDetailFilters.building) {
        tags.push({
          id: "building",
          label: `동: ${formatBuildingFromServer(appliedDetailFilters.building)}`,
          onRemove: () => handleRemoveDetailFilterKey("building"),
        });
      }
      if (appliedDetailFilters.floor) {
        tags.push({
          id: "floor",
          label: `층: ${appliedDetailFilters.floor}`,
          onRemove: () => handleRemoveDetailFilterKey("floor"),
        });
      }
      if (appliedDetailFilters.roomNumber) {
        tags.push({
          id: "roomNumber",
          label: `호수: ${appliedDetailFilters.roomNumber}`,
          onRemove: () => handleRemoveDetailFilterKey("roomNumber"),
        });
      }
      if (appliedDetailFilters.bedNumber) {
        tags.push({
          id: "bedNumber",
          label: `침대: ${appliedDetailFilters.bedNumber}`,
          onRemove: () => handleRemoveDetailFilterKey("bedNumber"),
        });
      }
    }

    return tags;
  }, [appliedKeyword, appliedDetailFilters, handleRemoveDetailFilterKey]);

  const hasAnyActiveFilters =
    activeFilterTags.length > 0 || selectedPeriodIndex !== 0;

  return (
    <ComplainListPageWrapper>
      <TitleContentArea
        title="민원 목록"
        children={
          <ContentWrapper>
            {/* 검색창 */}
            <SearchInput
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onSearch={handleSearchSubmit}
            />

            {/* 필터 버튼 및 기간 칩 그룹 */}
            <ControlsRow>
              <FilterGroup ref={filterGroupRef}>
                <FilterButton
                  type="button"
                  onClick={handleToggleFilter}
                  $isActive={activeDetailFilterCount > 0}
                >
                  <Filter size={14} />
                  <span>필터</span>
                  {activeDetailFilterCount > 0 && (
                    <Badge>{activeDetailFilterCount}</Badge>
                  )}
                </FilterButton>

                {isFilterOpen && (
                  <FilterDropdownWrapper>
                    <ComplainFilter
                      initialFilters={appliedDetailFilters}
                      onApply={handleApplyFilters}
                      onReset={handleResetFilters}
                      onClose={() => setIsFilterOpen(false)}
                    />
                  </FilterDropdownWrapper>
                )}
              </FilterGroup>

              <SelectableChipGroup
                Groups={PERIOD_MENUS}
                selectedIndex={selectedPeriodIndex}
                onSelect={(idx) =>
                  setSelectedPeriodIndex(idx === null ? 0 : idx)
                }
              />
            </ControlsRow>

            {/* 적용된 조건 태그 목록 (있을 때만 노출) */}
            {hasAnyActiveFilters && (
              <ActiveTagsContainer>
                {activeFilterTags.map((tag) => (
                  <TagChip key={tag.id}>
                    <span>{tag.label}</span>
                    <TagCloseButton
                      type="button"
                      onClick={tag.onRemove}
                      aria-label={`${tag.label} 해제`}
                    >
                      <X size={12} />
                    </TagCloseButton>
                  </TagChip>
                ))}
                <ResetAllButton type="button" onClick={handleResetAll}>
                  전체 초기화
                </ResetAllButton>
              </ActiveTagsContainer>
            )}

            {/* 목록 테이블 및 로딩/에러/빈 상태 */}
            {isLoading ? (
              <LoadingSpinner message="민원 목록을 불러오는 중..." />
            ) : isError ? (
              <ErrorContainer>
                <ErrorIconWrapper>
                  <AlertCircle size={32} />
                </ErrorIconWrapper>
                <ErrorTitle>민원 목록을 불러오지 못했어요</ErrorTitle>
                <ErrorDescription>
                  일시적인 서버 오류이거나 네트워크 연결 문제일 수 있어요.
                </ErrorDescription>
                <ErrorButtonWrapper>
                  <RetryButton type="button" onClick={() => void refetch()}>
                    <RotateCw size={14} />
                    <span>다시 시도하기</span>
                  </RetryButton>
                  {hasAnyActiveFilters && (
                    <ResetFilterButton type="button" onClick={handleResetAll}>
                      검색 조건 초기화
                    </ResetFilterButton>
                  )}
                </ErrorButtonWrapper>
              </ErrorContainer>
            ) : filteredComplaints.length > 0 ? (
              <ComplainListTable data={filteredComplaints} isAdmin={true} />
            ) : (
              <EmptyMessage>
                조회된 민원이 없습니다.
                {hasAnyActiveFilters && (
                  <EmptySubText>
                    설정된 검색 조건을 변경하거나 초기화해 보세요.
                  </EmptySubText>
                )}
              </EmptyMessage>
            )}
          </ContentWrapper>
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

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const ControlsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
`;

const FilterButton = styled.button<{ $isActive?: boolean }>`
  display: inline-flex;
  padding: 6px 14px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  min-width: fit-content;
  border-radius: 20px;
  border: 1px solid
    ${({ $isActive }) => ($isActive ? "#3182f6" : "#e5e8eb")};
  background: ${({ $isActive }) => ($isActive ? "#e8f3ff" : "#ffffff")};
  color: ${({ $isActive }) => ($isActive ? "#3182f6" : "#4e5968")};
  font-size: 14px;
  font-weight: ${({ $isActive }) => ($isActive ? "600" : "500")};
  line-height: 20px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    border-color: #3182f6;
    color: #3182f6;
  }

  &:active {
    transform: scale(0.97);
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: #3182f6;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
`;

const ActiveTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
`;

const TagChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 14px;
  background-color: #f2f4f6;
  color: #333d4b;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const TagCloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 0;
  color: #8b95a1;
  cursor: pointer;

  &:hover {
    color: #191f28;
  }
`;

const ResetAllButton = styled.button`
  border: none;
  background: none;
  padding: 4px 8px;
  color: #8b95a1;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #4e5968;
  }
`;

const EmptyMessage = styled.div`
  padding: 48px 16px;
  text-align: center;
  color: #8b95a1;
  font-size: 15px;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const EmptySubText = styled.span`
  font-size: 13px;
  color: #b0b8c1;
`;

const ErrorContainer = styled.div`
  padding: 48px 16px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-radius: 16px;
  background-color: #f9fafb;
  border: 1px dashed #e5e8eb;
`;

const ErrorIconWrapper = styled.div`
  color: #f04452;
  margin-bottom: 4px;
`;

const ErrorTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191f28;
`;

const ErrorDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: #8b95a1;
`;

const ErrorButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background-color: #3182f6;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: #1b64da;
  }

  &:active {
    transform: scale(0.97);
  }
`;

const ResetFilterButton = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #e5e8eb;
  background-color: #ffffff;
  color: #4e5968;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: #f2f4f6;
  }

  &:active {
    transform: scale(0.97);
  }
`;

const FilterDropdownWrapper = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  margin-top: 8px;
  transform-origin: top left;
  animation: scale-up 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;

  @keyframes scale-up {
    0% {
      transform: scale(0.95);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
