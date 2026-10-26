import React, { useMemo, useState } from "react";
import styled from "styled-components";
import {
  createCalendar,
  deleteCalendar,
  updateCalendar,
} from "@/apis/calendar";
import { useAllCalendars } from "@/queries/calendar";
import { useSetHeader } from "@/hooks/useSetHeader";
import { CalendarItem, CreateCalendarDto } from "@/types/calendar";

type FilterStatus = "ALL" | "ACTIVE" | "UPCOMING" | "PAST";
type SortOption = "START_ASC" | "START_DESC" | "TITLE_ASC";

const ITEMS_PER_PAGE = 10;

const EMPTY_FORM: CreateCalendarDto = {
  title: "",
  link: "",
  startDate: "",
  endDate: "",
};

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return dateStr.replace(/-/g, ".");
};

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").slice(0, 32);
  }
};

const CalendarAdminPage: React.FC = () => {
  const { data: rawCalendarList = [], isLoading } = useAllCalendars();

  // 글로벌 헤더 제목 등록 (페이지 내 중복 헤더 제거)
  useSetHeader({ title: "캘린더 관리" });

  const today = getTodayString();

  // 검색 & 필터 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [yearMonthFilter, setYearMonthFilter] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("START_ASC");
  const [currentPage, setCurrentPage] = useState(1);

  // 모달(등록/수정) 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [formData, setFormData] = useState<CreateCalendarDto>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 상태 판별 헬퍼
  const getItemStatus = (item: CalendarItem): "ACTIVE" | "UPCOMING" | "PAST" => {
    if (item.endDate < today) return "PAST";
    if (item.startDate > today) return "UPCOMING";
    return "ACTIVE";
  };

  // 등록된 일정들의 고유 연-월 목록 추출 (예: 2026-03, 2026-04 등)
  const availableYearMonths = useMemo(() => {
    const set = new Set<string>();
    rawCalendarList.forEach((item) => {
      if (item.startDate && item.startDate.length >= 7) {
        set.add(item.startDate.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [rawCalendarList]);

  // 필터링 및 정렬 처리
  const filteredAndSortedList = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    const filtered = rawCalendarList.filter((item) => {
      // 1. 키워드 검색
      if (keyword) {
        const titleMatch = item.title.toLowerCase().includes(keyword);
        const linkMatch = item.link?.toLowerCase().includes(keyword);
        if (!titleMatch && !linkMatch) return false;
      }

      // 2. 상태 필터
      if (statusFilter !== "ALL") {
        if (getItemStatus(item) !== statusFilter) return false;
      }

      // 3. 연-월 필터
      if (yearMonthFilter !== "ALL") {
        if (!item.startDate.startsWith(yearMonthFilter)) return false;
      }

      return true;
    });

    // 정렬
    filtered.sort((a, b) => {
      if (sortOption === "START_ASC") {
        return (
          a.startDate.localeCompare(b.startDate) ||
          a.endDate.localeCompare(b.endDate)
        );
      }
      if (sortOption === "START_DESC") {
        return (
          b.startDate.localeCompare(a.startDate) ||
          b.endDate.localeCompare(a.endDate)
        );
      }
      if (sortOption === "TITLE_ASC") {
        return a.title.localeCompare(b.title, "ko");
      }
      return 0;
    });

    return filtered;
  }, [rawCalendarList, searchKeyword, statusFilter, yearMonthFilter, sortOption, today]);

  // 상태별 개수 통계
  const counts = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let past = 0;

    rawCalendarList.forEach((item) => {
      const s = getItemStatus(item);
      if (s === "ACTIVE") active += 1;
      else if (s === "UPCOMING") upcoming += 1;
      else past += 1;
    });

    return { all: rawCalendarList.length, active, upcoming, past };
  }, [rawCalendarList, today]);

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedList.length / ITEMS_PER_PAGE));
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedList, currentPage]);

  // 모바일 가로 스크롤 방지를 위한 슬라이딩 페이지 번호 (최대 5개 노출)
  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [totalPages, currentPage]);

  // 필터 변경 시 첫 페이지로 리셋
  const handleFilterChange = (newStatus: FilterStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handleYearMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYearMonthFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
    setCurrentPage(1);
  };

  // 모달 열기/닫기
  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CalendarItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      link: item.link ?? "",
      startDate: item.startDate,
      endDate: item.endDate,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData(EMPTY_FORM);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("일정 제목을 입력해주세요.");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      alert("시작일과 종료일을 모두 선택해 주세요.");
      return;
    }
    if (formData.startDate > formData.endDate) {
      alert("종료일은 시작일보다 이후여야 해요.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedItem) {
        await updateCalendar(selectedItem.id, formData);
        alert("일정을 수정했어요.");
      } else {
        await createCalendar(formData);
        alert("새 일정을 등록했어요.");
      }
      handleCloseModal();
    } catch (err) {
      console.error("일정 저장 실패", err);
      alert("일정 저장에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || isSubmitting) return;
    if (!window.confirm(`"${selectedItem.title}" 일정을 삭제할까요?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteCalendar(selectedItem.id);
      alert("일정을 삭제했어요.");
      handleCloseModal();
    } catch (err) {
      console.error("일정 삭제 실패", err);
      alert("일정 삭제에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageRoot>
      {/* 1. 검색 & 다각도 필터 & 데스크톱 등록 액션 */}
      <ControlBarCard>
        <SearchFilterRow>
          <SearchInputWrapper>
            <SearchInput
              type="text"
              placeholder="일정 제목 또는 링크 검색..."
              value={searchKeyword}
              onChange={handleKeywordChange}
            />
            {searchKeyword && (
              <ClearButton type="button" onClick={() => setSearchKeyword("")}>
                ✕
              </ClearButton>
            )}
          </SearchInputWrapper>

          <SelectGroup>
            <StyledSelect value={yearMonthFilter} onChange={handleYearMonthChange}>
              <option value="ALL">전체 기간</option>
              {availableYearMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {ym.replace("-", "년 ")}월
                </option>
              ))}
            </StyledSelect>

            <StyledSelect value={sortOption} onChange={handleSortChange}>
              <option value="START_ASC">시작일 빠른 순</option>
              <option value="START_DESC">시작일 늦은 순</option>
              <option value="TITLE_ASC">제목 가나다 순</option>
            </StyledSelect>
          </SelectGroup>

          <DesktopCTAButton type="button" onClick={handleOpenCreate}>
            + 새 일정 등록
          </DesktopCTAButton>
        </SearchFilterRow>

        {/* 상태 필터 세그먼트 칩 */}
        <StatusChipRow>
          <StatusChip
            type="button"
            $active={statusFilter === "ALL"}
            onClick={() => handleFilterChange("ALL")}
          >
            전체 ({counts.all})
          </StatusChip>
          <StatusChip
            type="button"
            $active={statusFilter === "ACTIVE"}
            onClick={() => handleFilterChange("ACTIVE")}
          >
            진행 중 ({counts.active})
          </StatusChip>
          <StatusChip
            type="button"
            $active={statusFilter === "UPCOMING"}
            onClick={() => handleFilterChange("UPCOMING")}
          >
            예정 ({counts.upcoming})
          </StatusChip>
          <StatusChip
            type="button"
            $active={statusFilter === "PAST"}
            onClick={() => handleFilterChange("PAST")}
          >
            종료됨 ({counts.past})
          </StatusChip>
        </StatusChipRow>
      </ControlBarCard>

      {/* 3. 본문: 데이터 테이블(PC) & 리스트 카드(모바일) */}
      <ContentCard>
        <TableHeaderRow>
          <TableResultCount>
            총 <strong>{filteredAndSortedList.length}</strong>개의 일정
            {searchKeyword && ` ('${searchKeyword}' 검색 결과)`}
          </TableResultCount>
        </TableHeaderRow>

        {isLoading ? (
          <EmptyBox>일정 목록을 불러오는 중입니다...</EmptyBox>
        ) : filteredAndSortedList.length === 0 ? (
          <EmptyBox>
            <EmptyMainText>조건에 맞는 일정이 없어요.</EmptyMainText>
            <EmptySubText>
              검색어나 필터 조건을 변경하거나 새 일정을 등록해 보세요.
            </EmptySubText>
          </EmptyBox>
        ) : (
          <>
            {/* 데스크톱 전용 테이블 뷰 (>= 768px) */}
            <DesktopTableView>
              <TableHead>
                <tr>
                  <th style={{ width: "90px" }}>상태</th>
                  <th>일정 제목</th>
                  <th style={{ width: "230px" }}>노출 기간</th>
                  <th style={{ width: "200px" }}>연결 링크</th>
                  <th style={{ width: "120px", textAlign: "right" }}>관리</th>
                </tr>
              </TableHead>
              <tbody>
                {paginatedList.map((item) => {
                  const status = getItemStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <td>
                        <StatusBadge $tone={status}>
                          {status === "ACTIVE"
                            ? "진행 중"
                            : status === "UPCOMING"
                              ? "예정"
                              : "종료됨"}
                        </StatusBadge>
                      </td>
                      <td>
                        <ItemTitleClickable
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                        >
                          {item.title}
                        </ItemTitleClickable>
                      </td>
                      <td>
                        <DateRangeText>
                          {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </DateRangeText>
                      </td>
                      <td>
                        {item.link?.trim() ? (
                          <LinkAnchor
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {getDomain(item.link)} ↗
                          </LinkAnchor>
                        ) : (
                          <MutedText>-</MutedText>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <RowActionBtn
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                        >
                          수정
                        </RowActionBtn>
                      </td>
                    </TableRow>
                  );
                })}
              </tbody>
            </DesktopTableView>

            {/* 모바일 전용 카드 리스트 뷰 (< 768px) */}
            <MobileListView>
              {paginatedList.map((item, idx) => {
                const status = getItemStatus(item);
                const isLast = idx === paginatedList.length - 1;

                return (
                  <MobileRowItem
                    key={item.id}
                    type="button"
                    $isLast={isLast}
                    onClick={() => handleOpenEdit(item)}
                  >
                    <MobileRowTop>
                      <StatusBadge $tone={status}>
                        {status === "ACTIVE"
                          ? "진행 중"
                          : status === "UPCOMING"
                            ? "예정"
                            : "종료됨"}
                      </StatusBadge>
                      <MobileDateText>
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </MobileDateText>
                    </MobileRowTop>

                    <MobileItemTitle>{item.title}</MobileItemTitle>

                    {item.link?.trim() && (
                      <MobileLinkText>{getDomain(item.link)} ↗</MobileLinkText>
                    )}
                  </MobileRowItem>
                );
              })}
            </MobileListView>
          </>
        )}

        {/* 4. 페이지네이션 바 (슬라이딩 윈도우로 가로 스크롤 완전 차단) */}
        {totalPages > 1 && (
          <PaginationWrapper>
            <PageNavButton
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="이전 페이지"
            >
              ‹
            </PageNavButton>

            <PageNumberList>
              {visiblePages.map((pageNum) => (
                <PageNumberButton
                  key={pageNum}
                  type="button"
                  $active={pageNum === currentPage}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </PageNumberButton>
              ))}
            </PageNumberList>

            <PageNavButton
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="다음 페이지"
            >
              ›
            </PageNavButton>
          </PaginationWrapper>
        )}
      </ContentCard>

      {/* 5. 모바일 전용 하단 고정 CTA */}
      <MobileFixedCTA>
        <CTAButtonMobile type="button" onClick={handleOpenCreate}>
          + 새 일정 등록하기
        </CTAButtonMobile>
      </MobileFixedCTA>

      {/* 6. 일정 등록 / 수정 모달 (반응형 센터/바텀 모달) */}
      {isModalOpen && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalHeading>
                {selectedItem ? "일정 수정하기" : "새 일정 등록하기"}
              </ModalHeading>
              <ModalCloseButton
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                ✕
              </ModalCloseButton>
            </ModalHeader>

            <ModalForm onSubmit={handleSubmit}>
              <FormField>
                <FieldLabel htmlFor="cal-title">일정 제목</FieldLabel>
                <FieldInput
                  id="cal-title"
                  name="title"
                  type="text"
                  placeholder="예: 2026학년도 1학기 기숙사 입사 신청"
                  value={formData.title}
                  onChange={handleFormChange}
                  autoFocus
                  required
                />
              </FormField>

              <DateInputGrid>
                <FormField>
                  <FieldLabel htmlFor="cal-start">시작일</FieldLabel>
                  <FieldInput
                    id="cal-start"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    required
                  />
                </FormField>

                <FormField>
                  <FieldLabel htmlFor="cal-end">종료일</FieldLabel>
                  <FieldInput
                    id="cal-end"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleFormChange}
                    required
                  />
                </FormField>
              </DateInputGrid>

              <FormField>
                <FieldLabel htmlFor="cal-link">연결 링크 (선택)</FieldLabel>
                <FieldInput
                  id="cal-link"
                  name="link"
                  type="url"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={handleFormChange}
                />
              </FormField>

              <ModalActionContainer>
                <PrimarySubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "저장 중..."
                    : selectedItem
                      ? "수정 내용 저장"
                      : "일정 등록하기"}
                </PrimarySubmitButton>

                {selectedItem && (
                  <DangerDeleteButton
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    일정 삭제하기
                  </DangerDeleteButton>
                )}
              </ModalActionContainer>
            </ModalForm>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageRoot>
  );
};

export default CalendarAdminPage;

/* --- Styled Components (배경은 상위 레이아웃에 완전 위임, Zero-Slop 표준) --- */

const PageRoot = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  padding: 10px 14px calc(90px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 1024px) {
    padding: 16px 0 60px;
    gap: 24px;
    overflow-x: visible;
  }
`;

const DesktopCTAButton = styled.button`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 20px;
    border-radius: 12px;
    border: none;
    background: #3182f6;
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(49, 130, 246, 0.22);
    white-space: nowrap;
    transition: all 0.15s ease;

    &:hover {
      background: #1b64da;
    }

    &:active {
      transform: scale(0.98);
    }
  }
`;

const ControlBarCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);

  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 18px 20px;
    gap: 14px;
  }
`;

const SearchFilterRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 38px 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  font-size: 14px;
  color: #191f28;
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &::placeholder {
    color: #8b95a1;
  }

  &:focus {
    background: #ffffff;
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  border: none;
  background: transparent;
  color: #8b95a1;
  font-size: 13px;
  cursor: pointer;
  padding: 4px;
`;

const SelectGroup = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;

  > * {
    flex: 1;
    min-width: 0;
  }

  @media (min-width: 768px) {
    width: auto;
    > * {
      flex: initial;
    }
  }
`;

const StyledSelect = styled.select`
  padding: 11px 14px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  font-size: 13px;
  font-weight: 600;
  color: #333d4b;
  outline: none;
  cursor: pointer;
  transition: all 0.15s ease;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
  }
`;

const StatusChipRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StatusChip = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active }) => ($active ? "#191f28" : "#f2f4f6")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#4e5968")};
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#191f28" : "#e5e8eb")};
  }
`;

const ContentCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  @media (min-width: 768px) {
    border-radius: 20px;
    padding: 24px;
  }
`;

const TableHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const TableResultCount = styled.div`
  font-size: 14px;
  color: #6b7684;

  strong {
    color: #191f28;
    font-weight: 700;
  }
`;

/* 데스크톱 전용 테이블 */
const DesktopTableView = styled.table`
  display: none;

  @media (min-width: 768px) {
    display: table;
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
`;

const TableHead = styled.thead`
  border-bottom: 1.5px solid #e5e8eb;

  th {
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 700;
    color: #6b7684;
    white-space: nowrap;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f2f4f6;
  transition: background-color 0.15s ease;

  &:hover {
    background: #f9fafb;
  }

  td {
    padding: 16px 14px;
    font-size: 14px;
    color: #191f28;
    vertical-align: middle;
  }
`;

const ItemTitleClickable = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  font-size: 14px;
  font-weight: 700;
  color: #191f28;
  text-align: left;
  cursor: pointer;
  line-height: 1.4;

  &:hover {
    color: #3182f6;
    text-decoration: underline;
  }
`;

const DateRangeText = styled.span`
  font-size: 13px;
  color: #4e5968;
  font-variant-numeric: tabular-nums;
`;

const LinkAnchor = styled.a`
  font-size: 13px;
  color: #3182f6;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const MutedText = styled.span`
  color: #b0b8c1;
`;

const RowActionBtn = styled.button`
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #3182f6;
    color: #3182f6;
    background: #f4f8fe;
  }
`;

/* 모바일 전용 카드 뷰 */
const MobileListView = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileRowItem = styled.button<{ $isLast: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 13px 2px;
  border: none;
  background: transparent;
  border-bottom: ${({ $isLast }) => ($isLast ? "none" : "1px solid #f2f4f6")};
  text-align: left;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
`;

const MobileRowTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MobileDateText = styled.span`
  font-size: 12px;
  color: #8b95a1;
  font-variant-numeric: tabular-nums;
`;

const MobileItemTitle = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
  line-height: 1.4;
`;

const MobileLinkText = styled.span`
  font-size: 12px;
  color: #3182f6;
  font-weight: 600;
`;

const StatusBadge = styled.span<{ $tone: "ACTIVE" | "UPCOMING" | "PAST" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.2px;

  ${({ $tone }) => {
    switch ($tone) {
      case "ACTIVE":
        return `
          background: #e6f8ef;
          color: #04b05c;
        `;
      case "UPCOMING":
        return `
          background: #e8f3ff;
          color: #3182f6;
        `;
      case "PAST":
      default:
        return `
          background: #f2f4f6;
          color: #8b95a1;
        `;
    }
  }}
`;

const EmptyBox = styled.div`
  padding: 56px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const EmptyMainText = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
`;

const EmptySubText = styled.div`
  font-size: 13px;
  color: #8b95a1;
`;

/* 페이지네이션 */
const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f2f4f6;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const PageNavButton = styled.button`
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const PageNumberList = styled.div`
  display: flex;
  gap: 4px;
`;

const PageNumberButton = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active }) => ($active ? "#3182f6" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#4e5968")};
  width: 34px;
  height: 34px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#3182f6" : "#f2f4f6")};
  }
`;

/* 모바일 전용 하단 고정 CTA */
const MobileFixedCTA = styled.div`
  display: block;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 25;
  background: linear-gradient(to top, #ffffff 70%, rgba(255, 255, 255, 0.8) 90%, transparent);
  padding: 12px 20px calc(14px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 768px) {
    display: none;
  }
`;

const CTAButtonMobile = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 16px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.25);
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
`;

/* 모달 컴포넌트 */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
    padding: 20px;
  }
`;

const ModalContainer = styled.div`
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  padding: 24px 24px calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 640px) {
    border-radius: 28px;
    padding: 28px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
    animation: fadeInScale 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalHeading = styled.h3`
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: #191f28;
`;

const ModalCloseButton = styled.button`
  border: none;
  background: #f2f4f6;
  color: #6b7684;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #e5e8eb;
    color: #191f28;
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #4e5968;
`;

const FieldInput = styled.input`
  width: 100%;
  padding: 13px 16px;
  border-radius: 14px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  font-size: 15px;
  color: #191f28;
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &::placeholder {
    color: #8b95a1;
  }

  &:focus {
    background: #ffffff;
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const DateInputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const ModalActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
`;

const PrimarySubmitButton = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 16px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #1b64da;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DangerDeleteButton = styled.button`
  border: none;
  background: transparent;
  color: #f04452;
  font-size: 14px;
  font-weight: 600;
  padding: 8px;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.8;
  }
`;
