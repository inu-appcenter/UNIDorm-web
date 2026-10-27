import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/constants/paths";
import { deletePopupNotification } from "@/apis/popup-notification";
import { useAdminPopupNotifications } from "@/queries/popupNotifications";
import { useSetHeader } from "@/hooks/useSetHeader";
import { PopupNotification } from "@/types/popup-notifications";

type StatusFilter = "ALL" | "ACTIVE" | "UPCOMING" | "PAST";
type SortOption = "STATUS_ORDER" | "START_ASC" | "CREATED_DESC";

const ITEMS_PER_PAGE = 10;

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

const PopupNotiListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useAdminPopupNotifications();

  useSetHeader({ title: "홈 화면 팝업 공지" });

  const today = getTodayString();

  // 검색, 필터, 정렬 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("STATUS_ORDER");
  const [currentPage, setCurrentPage] = useState(1);

  // 상세 모달 상태
  const [selectedNoti, setSelectedNoti] = useState<PopupNotification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 팝업 상태 계산 헬퍼
  const getPopupStatus = (noti: PopupNotification): "ACTIVE" | "UPCOMING" | "PAST" => {
    if (noti.deadline < today) return "PAST";
    if (noti.startDate > today) return "UPCOMING";
    return "ACTIVE";
  };

  // 등록된 공지 타입 고유 목록 추출
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    notifications.forEach((item) => {
      if (item.notificationType?.trim()) {
        set.add(item.notificationType.trim());
      }
    });
    return Array.from(set);
  }, [notifications]);

  // 필터링 및 정렬 처리
  const filteredAndSortedList = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    const filtered = notifications.filter((item) => {
      // 1. 키워드 검색 (제목 또는 내용)
      if (keyword) {
        const titleMatch = item.title.toLowerCase().includes(keyword);
        const contentMatch = item.content?.toLowerCase().includes(keyword);
        if (!titleMatch && !contentMatch) return false;
      }

      // 2. 상태 필터
      if (statusFilter !== "ALL") {
        if (getPopupStatus(item) !== statusFilter) return false;
      }

      // 3. 공지 구분 필터
      if (typeFilter !== "ALL") {
        if (item.notificationType !== typeFilter) return false;
      }

      return true;
    });

    // 정렬
    filtered.sort((a, b) => {
      if (sortOption === "STATUS_ORDER") {
        const getOrder = (status: "ACTIVE" | "UPCOMING" | "PAST") => {
          if (status === "ACTIVE") return 0;
          if (status === "UPCOMING") return 1;
          return 2;
        };
        const orderDiff = getOrder(getPopupStatus(a)) - getOrder(getPopupStatus(b));
        if (orderDiff !== 0) return orderDiff;
        return a.startDate.localeCompare(b.startDate);
      }
      if (sortOption === "START_ASC") {
        return a.startDate.localeCompare(b.startDate);
      }
      if (sortOption === "CREATED_DESC") {
        return (b.createdDate || "").localeCompare(a.createdDate || "");
      }
      return 0;
    });

    return filtered;
  }, [notifications, searchKeyword, statusFilter, typeFilter, sortOption, today]);

  // 상태별 개수 집계
  const counts = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let past = 0;

    notifications.forEach((item) => {
      const s = getPopupStatus(item);
      if (s === "ACTIVE") active += 1;
      else if (s === "UPCOMING") upcoming += 1;
      else past += 1;
    });

    return { all: notifications.length, active, upcoming, past };
  }, [notifications, today]);

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedList.length / ITEMS_PER_PAGE));
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedList, currentPage]);

  // 모바일 가로 스크롤 방지를 위한 슬라이딩 윈도우 (최대 5개 노출)
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

  const handleFilterChange = (newStatus: StatusFilter) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
    setCurrentPage(1);
  };

  const handleOpenDetail = (noti: PopupNotification) => {
    setSelectedNoti(noti);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    if (isDeleting) return;
    setIsDetailModalOpen(false);
    setSelectedNoti(null);
  };

  const handleNavigateCreate = () => {
    navigate(PATHS.ADMIN.POPUP_CREATE);
  };

  const handleNavigateEdit = (id: number) => {
    navigate(PATHS.ADMIN.POPUP_EDIT(id));
  };

  const handleDelete = async (id: number) => {
    if (isDeleting) return;
    if (!window.confirm("이 팝업 공지를 정말 삭제할까요?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deletePopupNotification(id);
      alert("팝업 공지를 삭제했어요.");
      handleCloseDetail();
    } catch (error) {
      console.error("팝업 공지 삭제 실패:", error);
      alert("팝업 공지 삭제에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageRoot>
      {/* 1. 검색 & 다각도 필터 & 데스크톱 새 등록 액션 */}
      <ControlBarCard>
        <SearchFilterRow>
          <SearchInputWrapper>
            <SearchInput
              type="text"
              placeholder="팝업 제목 또는 본문 내용 검색..."
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
            <StyledSelect value={typeFilter} onChange={handleTypeChange}>
              <option value="ALL">전체 구분</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </StyledSelect>

            <StyledSelect value={sortOption} onChange={handleSortChange}>
              <option value="STATUS_ORDER">상태 우선 순</option>
              <option value="START_ASC">시작일 빠른 순</option>
              <option value="CREATED_DESC">등록 최신 순</option>
            </StyledSelect>
          </SelectGroup>

          <DesktopCTAButton type="button" onClick={handleNavigateCreate}>
            + 새 팝업 등록
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
            노출 중 ({counts.active})
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

      {/* 2. 본문: 데이터 테이블(PC) & 리스트 카드(모바일) */}
      <ContentCard>
        <TableHeaderRow>
          <TableResultCount>
            총 <strong>{filteredAndSortedList.length}</strong>개의 팝업 공지
            {searchKeyword && ` ('${searchKeyword}' 검색 결과)`}
          </TableResultCount>
        </TableHeaderRow>

        {isLoading ? (
          <EmptyBox>팝업 공지 목록을 불러오는 중입니다...</EmptyBox>
        ) : filteredAndSortedList.length === 0 ? (
          <EmptyBox>
            <EmptyMainText>조건에 맞는 팝업 공지가 없어요.</EmptyMainText>
            <EmptySubText>
              검색어나 필터 조건을 변경하거나 새 팝업을 등록해 보세요.
            </EmptySubText>
          </EmptyBox>
        ) : (
          <>
            {/* 데스크톱 전용 테이블 (>= 768px) */}
            <DesktopTableView>
              <TableHead>
                <tr>
                  <th style={{ width: "90px" }}>상태</th>
                  <th style={{ width: "90px" }}>구분</th>
                  <th>공지 제목 / 요약</th>
                  <th style={{ width: "220px" }}>노출 기간</th>
                  <th style={{ width: "90px", textAlign: "center" }}>이미지</th>
                  <th style={{ width: "130px", textAlign: "right" }}>관리</th>
                </tr>
              </TableHead>
              <tbody>
                {paginatedList.map((item) => {
                  const status = getPopupStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <td>
                        <StatusBadge $tone={status}>
                          {status === "ACTIVE"
                            ? "노출 중"
                            : status === "UPCOMING"
                              ? "예정"
                              : "종료됨"}
                        </StatusBadge>
                      </td>
                      <td>
                        <TypeBadge>{item.notificationType}</TypeBadge>
                      </td>
                      <td>
                        <TitleSummaryWrapper>
                          <ItemTitleClickable
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                          >
                            {item.title}
                          </ItemTitleClickable>
                          <SummaryText>
                            {item.content?.replace(/\s+/g, " ").trim().slice(0, 60)}
                            {(item.content?.length ?? 0) > 60 && "..."}
                          </SummaryText>
                        </TitleSummaryWrapper>
                      </td>
                      <td>
                        <DateRangeText>
                          {formatDate(item.startDate)} - {formatDate(item.deadline)}
                        </DateRangeText>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.imagePath.length > 0 ? (
                          <ImageCountText>{item.imagePath.length}장</ImageCountText>
                        ) : (
                          <MutedText>-</MutedText>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <RowActionGroup>
                          <RowActionBtn
                            type="button"
                            onClick={() => handleNavigateEdit(item.id)}
                          >
                            수정
                          </RowActionBtn>
                          <RowDeleteBtn
                            type="button"
                            onClick={() => handleDelete(item.id)}
                          >
                            삭제
                          </RowDeleteBtn>
                        </RowActionGroup>
                      </td>
                    </TableRow>
                  );
                })}
              </tbody>
            </DesktopTableView>

            {/* 모바일 전용 카드 리스트 (< 768px) */}
            <MobileListView>
              {paginatedList.map((item, idx) => {
                const status = getPopupStatus(item);
                const isLast = idx === paginatedList.length - 1;

                return (
                  <MobileRowItem
                    key={item.id}
                    type="button"
                    $isLast={isLast}
                    onClick={() => handleOpenDetail(item)}
                  >
                    <MobileRowTop>
                      <BadgeGroup>
                        <StatusBadge $tone={status}>
                          {status === "ACTIVE"
                            ? "노출 중"
                            : status === "UPCOMING"
                              ? "예정"
                              : "종료됨"}
                        </StatusBadge>
                        <TypeBadge>{item.notificationType}</TypeBadge>
                      </BadgeGroup>
                      <MobileDateText>
                        {formatDate(item.startDate)} - {formatDate(item.deadline)}
                      </MobileDateText>
                    </MobileRowTop>

                    <MobileItemTitle>{item.title}</MobileItemTitle>
                    <MobileSummaryText>
                      {item.content?.replace(/\s+/g, " ").trim().slice(0, 80)}
                    </MobileSummaryText>

                    {item.imagePath.length > 0 && (
                      <MobileThumbnailsRow>
                        {item.imagePath.slice(0, 3).map((img, i) => (
                          <MobileThumb key={i} src={img} alt="thumbnail" />
                        ))}
                      </MobileThumbnailsRow>
                    )}
                  </MobileRowItem>
                );
              })}
            </MobileListView>
          </>
        )}

        {/* 3. 페이지네이션 바 */}
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

      {/* 4. 모바일 전용 하단 고정 CTA */}
      <MobileFixedCTA>
        <CTAButtonMobile type="button" onClick={handleNavigateCreate}>
          + 새 팝업 공지 등록하기
        </CTAButtonMobile>
      </MobileFixedCTA>

      {/* 5. 팝업 공지 상세/미리보기 모달 */}
      {isDetailModalOpen && selectedNoti && (
        <ModalOverlay onClick={handleCloseDetail}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalHeadingGroup>
                <BadgeGroup>
                  <StatusBadge $tone={getPopupStatus(selectedNoti)}>
                    {getPopupStatus(selectedNoti) === "ACTIVE"
                      ? "노출 중"
                      : getPopupStatus(selectedNoti) === "UPCOMING"
                        ? "예정"
                        : "종료됨"}
                  </StatusBadge>
                  <TypeBadge>{selectedNoti.notificationType}</TypeBadge>
                </BadgeGroup>
                <ModalPeriodText>
                  기간: {formatDate(selectedNoti.startDate)} ~ {formatDate(selectedNoti.deadline)}
                </ModalPeriodText>
              </ModalHeadingGroup>

              <ModalCloseButton
                type="button"
                onClick={handleCloseDetail}
                disabled={isDeleting}
              >
                ✕
              </ModalCloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailTitle>{selectedNoti.title}</DetailTitle>
              <DetailContentText>{selectedNoti.content}</DetailContentText>

              {selectedNoti.imagePath.length > 0 && (
                <DetailImagesWrapper>
                  {selectedNoti.imagePath.map((img, idx) => (
                    <DetailFullImage key={idx} src={img} alt={`popup-img-${idx}`} />
                  ))}
                </DetailImagesWrapper>
              )}
            </ModalBody>

            <ModalFooterActionRow>
              <SecondaryEditButton
                type="button"
                onClick={() => handleNavigateEdit(selectedNoti.id)}
                disabled={isDeleting}
              >
                공지 수정하기
              </SecondaryEditButton>
              <DangerDeleteButton
                type="button"
                onClick={() => handleDelete(selectedNoti.id)}
                disabled={isDeleting}
              >
                삭제하기
              </DangerDeleteButton>
            </ModalFooterActionRow>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageRoot>
  );
};

export default PopupNotiListPage;

/* --- Styled Components (가로스크롤 원천 차단 & Zero-Icon 미학) --- */

const PageRoot = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  padding: 10px 14px calc(90px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 1024px) {
    padding: 16px 0 60px;
    gap: 24px;
    overflow-x: visible;
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);

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

const TitleSummaryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
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

const SummaryText = styled.span`
  font-size: 12px;
  color: #8b95a1;
  line-height: 1.4;
`;

const DateRangeText = styled.span`
  font-size: 13px;
  color: #4e5968;
  font-variant-numeric: tabular-nums;
`;

const ImageCountText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #3182f6;
`;

const MutedText = styled.span`
  color: #b0b8c1;
`;

const RowActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const RowActionBtn = styled.button`
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #3182f6;
    color: #3182f6;
    background: #f4f8fe;
  }
`;

const RowDeleteBtn = styled.button`
  border: none;
  background: transparent;
  color: #8b95a1;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 8px;
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: #f04452;
  }
`;

/* 모바일 전용 카드 리스트 */
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
  gap: 8px;
`;

const BadgeGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
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

const MobileSummaryText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7684;
  line-height: 1.5;
`;

const MobileThumbnailsRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`;

const MobileThumb = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #f2f4f6;
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

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #f2f4f6;
  color: #4e5968;
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
  max-width: 540px;
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const ModalHeadingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ModalPeriodText = styled.span`
  font-size: 13px;
  color: #8b95a1;
  font-variant-numeric: tabular-nums;
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

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const DetailTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #191f28;
  line-height: 1.4;
`;

const DetailContentText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #333d4b;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

const DetailImagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
`;

const DetailFullImage = styled.img`
  width: 100%;
  border-radius: 14px;
  border: 1px solid #e5e8eb;
  object-fit: contain;
  max-height: 280px;
  background: #f9fafb;
`;

const ModalFooterActionRow = styled.div`
  display: flex;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #f2f4f6;
`;

const SecondaryEditButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 14px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #191f28;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #3182f6;
    color: #3182f6;
    background: #f4f8fe;
  }
`;

const DangerDeleteButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 14px;
  border: 1px solid #fde8e8;
  background: #fdf2f2;
  color: #f04452;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #fce8e8;
  }
`;
