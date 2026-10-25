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
import { useSearchParams } from "react-router-dom";

const PERIOD_MENUS = ["전체", "최근 1개월", "최근 3개월", "올해"];

/** Date 객체를 YYYY-MM-DD 포맷의 문자열로 변환 (로컬 타임존 기준) */
const formatDateToYYYYMMDD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** 기간 프리셋 인덱스에 대응하는 시작일/종료일 계산 */
const getPresetDateRange = (
  idx: number,
): { startDate?: string; endDate?: string } => {
  const now = new Date();
  const todayStr = formatDateToYYYYMMDD(now);

  if (idx === 1) {
    // 최근 1개월
    const past = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return { startDate: formatDateToYYYYMMDD(past), endDate: todayStr };
  }
  if (idx === 2) {
    // 최근 3개월
    const past = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    return { startDate: formatDateToYYYYMMDD(past), endDate: todayStr };
  }
  if (idx === 3) {
    // 올해
    return { startDate: `${now.getFullYear()}-01-01`, endDate: todayStr };
  }
  return {};
};

/** 시작일/종료일이 기간 프리셋 중 어느 것에 해당하는지 역방향 판별 */
const matchPresetIndex = (
  startDate?: string,
  endDate?: string,
): number | null => {
  if (!startDate && !endDate) return 0; // "전체"
  for (let i = 1; i <= 3; i++) {
    const preset = getPresetDateRange(i);
    if (preset.startDate === startDate && preset.endDate === endDate) {
      return i;
    }
  }
  // 사용자가 필터에서 임의로 선택한 커스텀 기간인 경우 칩 선택 해제 (null)
  return null;
};

const ComplainAdminPage = () => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [searchParams, setSearchParams] = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterGroupRef = useRef<HTMLDivElement>(null);

  // URL searchParams로부터 상태 도출 (Single Source of Truth)
  // 상세 페이지를 보고 뒤로 돌아와도 URL 쿼리스트링 덕분에 상태가 100% 복원됩니다.
  const appliedKeyword = searchParams.get("keyword") || "";
  const appliedStartDate = searchParams.get("startDate") || "";
  const appliedEndDate = searchParams.get("endDate") || "";

  // 현재 날짜 범위에 매칭되는 상단 기간 칩 인덱스 도출
  const selectedPeriodIndex = useMemo(() => {
    return matchPresetIndex(appliedStartDate, appliedEndDate);
  }, [appliedStartDate, appliedEndDate]);

  // 상세 필터 파라미터 파싱
  const appliedDetailFilters = useMemo<ComplaintSearchDto | null>(() => {
    const dto: ComplaintSearchDto = {};
    const dormType = searchParams.get("dormType");
    const officer = searchParams.get("officer");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const building = searchParams.get("building");
    const floor = searchParams.get("floor");
    const roomNumber = searchParams.get("roomNumber");
    const bedNumber = searchParams.get("bedNumber");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (dormType) dto.dormType = dormType;
    if (officer) dto.officer = officer;
    if (type) dto.type = type;
    if (status) dto.status = status;
    if (building) dto.building = building;
    if (floor) dto.floor = floor;
    if (roomNumber) dto.roomNumber = roomNumber;
    if (bedNumber) dto.bedNumber = bedNumber;
    if (startDate) dto.startDate = startDate;
    if (endDate) dto.endDate = endDate;

    return Object.keys(dto).length > 0 ? dto : null;
  }, [searchParams]);

  // 검색창 입력 폼 상태 (타이핑용 로컬 state)
  const [searchInput, setSearchInput] = useState<string>(appliedKeyword);

  // URL의 keyword가 바뀌었을 때(뒤로가기 등) 검색창 텍스트 동기화
  useEffect(() => {
    setSearchInput(appliedKeyword);
  }, [appliedKeyword]);

  // URL searchParams 일괄 업데이트 헬퍼
  const updateFilters = useCallback(
    (
      newKeyword: string,
      newDetail: ComplaintSearchDto | null,
      dateRange?: { startDate?: string; endDate?: string },
    ) => {
      const params = new URLSearchParams();
      const trimmed = newKeyword.trim();
      if (trimmed) {
        params.set("keyword", trimmed);
      }

      // 날짜 설정 우선순위: 명시적 dateRange > newDetail 내 날짜
      const sDate = dateRange ? dateRange.startDate : newDetail?.startDate;
      const eDate = dateRange ? dateRange.endDate : newDetail?.endDate;

      if (sDate) params.set("startDate", sDate);
      if (eDate) params.set("endDate", eDate);

      if (newDetail) {
        if (newDetail.dormType) params.set("dormType", newDetail.dormType);
        if (newDetail.officer) params.set("officer", newDetail.officer);
        if (newDetail.type) params.set("type", newDetail.type);
        if (newDetail.status) params.set("status", newDetail.status);
        if (newDetail.building) params.set("building", newDetail.building);
        if (newDetail.floor) params.set("floor", newDetail.floor);
        if (newDetail.roomNumber) params.set("roomNumber", newDetail.roomNumber);
        if (newDetail.bedNumber) params.set("bedNumber", newDetail.bedNumber);
      }

      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  // 검색어와 상세 필터, 기간을 하나의 통합 서버 검색 DTO로 결합
  const serverSearchDto = useMemo<ComplaintSearchDto | null>(() => {
    const dto: ComplaintSearchDto = {
      ...(appliedDetailFilters || {}),
      ...(appliedKeyword.trim() ? { keyword: appliedKeyword.trim() } : {}),
      ...(appliedStartDate ? { startDate: appliedStartDate } : {}),
      ...(appliedEndDate ? { endDate: appliedEndDate } : {}),
    };
    return Object.keys(dto).length > 0 ? dto : null;
  }, [appliedDetailFilters, appliedKeyword, appliedStartDate, appliedEndDate]);

  // 적용된 필터 조건으로 서버에서 민원 목록 조회 (단일화 API 호출 및 이중 폴백)
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
    updateFilters(searchInput, appliedDetailFilters, {
      startDate: appliedStartDate,
      endDate: appliedEndDate,
    });
  };

  // 필터 팝업 적용 핸들러 (팝업 내 기간 선택 포함)
  const handleApplyFilters = (filters: ComplaintSearchDto | null) => {
    updateFilters(appliedKeyword, filters);
    setIsFilterOpen(false);
  };

  // 필터 초기화 핸들러 (상세 필터 및 기간 필터 해제)
  const handleResetFilters = () => {
    updateFilters(appliedKeyword, null, {
      startDate: undefined,
      endDate: undefined,
    });
    setIsFilterOpen(false);
  };

  // 상단 기간 칩 선택 핸들러
  const handleSelectPeriod = (idx: number | null) => {
    const nextIdx = idx === null ? 0 : idx;
    const range = getPresetDateRange(nextIdx);
    updateFilters(appliedKeyword, appliedDetailFilters, range);
  };

  // 전체 검색 조건(검색어, 상세 필터, 기간) 완전 초기화
  const handleResetAll = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
    setIsFilterOpen(false);
  };

  // 개별 상세 필터 조건 제거
  const handleRemoveDetailFilterKey = useCallback(
    (key: keyof ComplaintSearchDto) => {
      if (!appliedDetailFilters) return;
      const nextFilters = { ...appliedDetailFilters };
      delete nextFilters[key];
      const hasRemaining = Object.keys(nextFilters).length > 0;
      updateFilters(
        appliedKeyword,
        hasRemaining ? nextFilters : null,
        {
          startDate: key === "startDate" ? undefined : appliedStartDate,
          endDate: key === "endDate" ? undefined : appliedEndDate,
        },
      );
    },
    [appliedDetailFilters, appliedKeyword, appliedStartDate, appliedEndDate, updateFilters],
  );

  // 기간 필터 전용 해제 핸들러
  const handleRemoveDateRange = useCallback(() => {
    updateFilters(appliedKeyword, appliedDetailFilters, {
      startDate: undefined,
      endDate: undefined,
    });
  }, [appliedKeyword, appliedDetailFilters, updateFilters]);

  /**
   * [클라이언트 2차 방어 필터링 (Safe Guard)]
   * 백엔드가 아직 배포되지 않아 startDate/endDate나 특정 검색 파라미터를 무시하고
   * 전체 목록을 반환하더라도, 클라이언트 측에서 2차 검증하여 완벽히 일치하는 데이터만 표시합니다.
   * 백엔드가 먼저 배포되든 프론트가 먼저 배포되든 100% 무중단 호환성을 보장합니다.
   */
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // 1. 기간(startDate, endDate) 클라이언트 필터링
      if (appliedStartDate || appliedEndDate) {
        // 백엔드 날짜 포맷 (YYYY-MM-DD 또는 YYYY.MM.DD) 정규화
        const itemDateStr = item.date ? item.date.replace(/\./g, "-").slice(0, 10) : "";
        if (itemDateStr) {
          if (appliedStartDate && itemDateStr < appliedStartDate) return false;
          if (appliedEndDate && itemDateStr > appliedEndDate) return false;
        }
      }

      // 2. 검색어 클라이언트 방어 필터링 (구버전 서버 대비)
      if (appliedKeyword) {
        const kw = appliedKeyword.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(kw);
        const roomMatch = item.roomNumber?.toString().includes(kw);
        const studentMatch = item.studentNumber?.toString().includes(kw);
        const buildingMatch = item.building?.toLowerCase().includes(kw);
        if (!titleMatch && !roomMatch && !studentMatch && !buildingMatch) {
          return false;
        }
      }

      // 3. 상세 필터 클라이언트 방어 필터링 (구버전 서버 대비)
      if (appliedDetailFilters) {
        if (appliedDetailFilters.dormType && item.dormType !== appliedDetailFilters.dormType) {
          return false;
        }
        if (appliedDetailFilters.status && item.status !== appliedDetailFilters.status) {
          return false;
        }
        if (appliedDetailFilters.building) {
          const itemBldg = formatBuildingFromServer(item.building);
          const filterBldg = formatBuildingFromServer(appliedDetailFilters.building);
          if (itemBldg !== filterBldg) return false;
        }
        if (appliedDetailFilters.floor && String(item.floor) !== String(appliedDetailFilters.floor)) {
          return false;
        }
        if (appliedDetailFilters.roomNumber && String(item.roomNumber) !== String(appliedDetailFilters.roomNumber)) {
          return false;
        }
        if (appliedDetailFilters.bedNumber && String(item.bedNumber) !== String(appliedDetailFilters.bedNumber)) {
          return false;
        }
        if (appliedDetailFilters.officer && item.officer !== appliedDetailFilters.officer) {
          return false;
        }
        if (appliedDetailFilters.type && item.type !== appliedDetailFilters.type) {
          return false;
        }
      }

      return true;
    });
  }, [complaints, appliedStartDate, appliedEndDate, appliedKeyword, appliedDetailFilters]);

  // CSV 다운로드 핸들러 (현재 화면에 보이는 필터링 목록을 그대로 다운로드 - WYSIWYG)
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

  // 현재 적용된 상세 필터 개수 계산 (기간 제외 조건 수)
  const activeDetailFilterCount = useMemo(() => {
    if (!appliedDetailFilters) return 0;
    const { startDate, endDate, ...others } = appliedDetailFilters;
    return Object.keys(others).length + (startDate || endDate ? 1 : 0);
  }, [appliedDetailFilters]);

  // 적용된 태그 목록 생성 (사용자에게 한눈에 표시하고 개별 삭제 지원)
  const activeFilterTags = useMemo(() => {
    const tags: { id: string; label: string; onRemove: () => void }[] = [];

    if (appliedKeyword) {
      tags.push({
        id: "keyword",
        label: `검색어: "${appliedKeyword}"`,
        onRemove: () => {
          setSearchInput("");
          updateFilters("", appliedDetailFilters, {
            startDate: appliedStartDate,
            endDate: appliedEndDate,
          });
        },
      });
    }

    if (appliedStartDate || appliedEndDate) {
      const label =
        appliedStartDate && appliedEndDate
          ? `기간: ${appliedStartDate} ~ ${appliedEndDate}`
          : appliedStartDate
            ? `기간: ${appliedStartDate}부터`
            : `기간: ~ ${appliedEndDate}까지`;

      tags.push({
        id: "dateRange",
        label,
        onRemove: handleRemoveDateRange,
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
  }, [
    appliedKeyword,
    appliedStartDate,
    appliedEndDate,
    appliedDetailFilters,
    handleRemoveDateRange,
    handleRemoveDetailFilterKey,
    updateFilters,
  ]);

  const hasAnyActiveFilters = activeFilterTags.length > 0;

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
                onSelect={handleSelectPeriod}
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
                <RetryButton type="button" onClick={() => refetch()}>
                  <RotateCw size={14} />
                  <span>다시 시도하기</span>
                </RetryButton>
              </ErrorContainer>
            ) : (
              <ComplainListTable data={filteredComplaints} isAdmin={true} />
            )}
          </ContentWrapper>
        }
      />
    </ComplainListPageWrapper>
  );
};

export default ComplainAdminPage;

const ComplainListPageWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  position: relative;
`;

const FilterButton = styled.button<{ $isActive?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  background-color: ${(props) => (props.$isActive ? "#E8F3FF" : "#ffffff")};
  color: ${(props) => (props.$isActive ? "#3182F6" : "#4E5968")};
  border: 1px solid ${(props) => (props.$isActive ? "#3182F6" : "#E5E8EB")};
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${(props) => (props.$isActive ? "#DCEBFE" : "#F2F4F6")};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background-color: #3182F6;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
`;

const FilterDropdownWrapper = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 50;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #E5E8EB;
`;

const ActiveTagsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background-color: #F9FAFB;
  border-radius: 12px;
  border: 1px solid #E5E8EB;
`;

const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: #ffffff;
  color: #191F28;
  border: 1px solid #E5E8EB;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
`;

const TagCloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  color: #8B95A1;
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: #191F28;
  }
`;

const ResetAllButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  color: #8B95A1;
  font-size: 12px;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: #4E5968;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #E5E8EB;
  text-align: center;
`;

const ErrorIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: #FFF0F2;
  color: #F04452;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  color: #191F28;
`;

const ErrorDescription = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #8B95A1;
`;

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: #3182F6;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #1B64DA;
  }

  &:active {
    transform: scale(0.98);
  }
`;
