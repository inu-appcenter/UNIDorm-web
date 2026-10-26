import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  createCalendar,
  deleteCalendar,
  updateCalendar,
} from "@/apis/calendar";
import { useAllCalendars } from "@/queries/calendar";
import { useSetHeader } from "@/hooks/useSetHeader";
import { CalendarItem, CreateCalendarDto } from "@/types/calendar";

type FilterStatus = "ALL" | "ACTIVE" | "UPCOMING" | "PAST";

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
    return url.replace(/^https?:\/\//, "").slice(0, 30);
  }
};

const CalendarAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: rawCalendarList = [], isLoading } = useAllCalendars();

  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [formData, setFormData] = useState<CreateCalendarDto>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = getTodayString();

  useSetHeader({ title: "캘린더 관리" });

  // 날짜순 정렬
  const sortedList = useMemo(() => {
    return [...rawCalendarList].sort((a, b) => {
      return (
        a.startDate.localeCompare(b.startDate) ||
        a.endDate.localeCompare(b.endDate)
      );
    });
  }, [rawCalendarList]);

  // 상태 계산 헬퍼
  const getItemStatus = (item: CalendarItem): "ACTIVE" | "UPCOMING" | "PAST" => {
    if (item.endDate < today) return "PAST";
    if (item.startDate > today) return "UPCOMING";
    return "ACTIVE";
  };

  // 필터링된 일정 목록
  const filteredList = useMemo(() => {
    if (filter === "ALL") return sortedList;
    return sortedList.filter((item) => getItemStatus(item) === filter);
  }, [sortedList, filter, today]);

  // 카운트 집계
  const counts = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let past = 0;

    sortedList.forEach((item) => {
      const s = getItemStatus(item);
      if (s === "ACTIVE") active += 1;
      else if (s === "UPCOMING") upcoming += 1;
      else past += 1;
    });

    return { all: sortedList.length, active, upcoming, past };
  }, [sortedList, today]);

  // 모달 열기: 등록 모드
  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  // 모달 열기: 수정 모드
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      alert("시작일과 종료일을 모두 선택해주세요.");
      return;
    }
    if (formData.startDate > formData.endDate) {
      alert("종료일은 시작일보다 이후여야 합니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedItem) {
        await updateCalendar(selectedItem.id, formData);
        alert("일정이 수정되었습니다.");
      } else {
        await createCalendar(formData);
        alert("새 일정이 등록되었습니다.");
      }
      handleCloseModal();
    } catch (err) {
      console.error("일정 저장 실패", err);
      alert("일정을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || isSubmitting) return;

    if (!window.confirm(`"${selectedItem.title}" 일정을 정말 삭제할까요?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteCalendar(selectedItem.id);
      alert("일정이 삭제되었습니다.");
      handleCloseModal();
    } catch (err) {
      console.error("일정 삭제 실패", err);
      alert("일정을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      {/* 1. 상단 내비게이션 바 */}
      <TopBar>
        <BackButton type="button" onClick={() => navigate(-1)} aria-label="뒤로가기">
          ‹
        </BackButton>
        <TopBarTitle>캘린더 관리</TopBarTitle>
        <ItemCountBadge>{sortedList.length}개</ItemCountBadge>
      </TopBar>

      {/* 2. 메인 스크롤 콘텐츠 */}
      <MainContent>
        {/* 타이틀 & 설명 섹션 */}
        <HeroSection>
          <HeroTitle>생활원 일정 관리</HeroTitle>
          <HeroSubtitle>
            사생들에게 보여줄 학사 및 기숙사 주요 일정을 등록하고 관리해요.
          </HeroSubtitle>
        </HeroSection>

        {/* 필터 세그먼트 */}
        <FilterBar>
          <FilterChip
            type="button"
            $active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          >
            전체 {counts.all}
          </FilterChip>
          <FilterChip
            type="button"
            $active={filter === "ACTIVE"}
            onClick={() => setFilter("ACTIVE")}
          >
            진행 중 {counts.active}
          </FilterChip>
          <FilterChip
            type="button"
            $active={filter === "UPCOMING"}
            onClick={() => setFilter("UPCOMING")}
          >
            예정 {counts.upcoming}
          </FilterChip>
          <FilterChip
            type="button"
            $active={filter === "PAST"}
            onClick={() => setFilter("PAST")}
          >
            종료됨 {counts.past}
          </FilterChip>
        </FilterBar>

        {/* 일정 리스트 섹션 */}
        {isLoading ? (
          <EmptyContainer>
            <p>일정 목록을 불러오고 있어요...</p>
          </EmptyContainer>
        ) : filteredList.length === 0 ? (
          <EmptyContainer>
            <EmptyTitle>등록된 일정이 없어요</EmptyTitle>
            <EmptyDesc>
              {filter === "ALL"
                ? "하단 버튼을 눌러 첫 번째 일정을 등록해보세요."
                : "선택한 상태에 해당하는 일정이 없습니다."}
            </EmptyDesc>
          </EmptyContainer>
        ) : (
          <ListCard>
            {filteredList.map((item, index) => {
              const status = getItemStatus(item);
              const isLast = index === filteredList.length - 1;

              return (
                <RowItem
                  key={item.id}
                  type="button"
                  $isLast={isLast}
                  onClick={() => handleOpenEdit(item)}
                >
                  <RowLeft>
                    <RowTitle>{item.title}</RowTitle>
                    <RowDate>
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </RowDate>
                    {item.link?.trim() && (
                      <RowLink>{getDomain(item.link)}</RowLink>
                    )}
                  </RowLeft>

                  <RowRight>
                    {status === "ACTIVE" && (
                      <StatusBadge $tone="green">진행 중</StatusBadge>
                    )}
                    {status === "UPCOMING" && (
                      <StatusBadge $tone="blue">예정</StatusBadge>
                    )}
                    {status === "PAST" && (
                      <StatusBadge $tone="gray">종료됨</StatusBadge>
                    )}
                  </RowRight>
                </RowItem>
              );
            })}
          </ListCard>
        )}
      </MainContent>

      {/* 3. 하단 고정 CTA */}
      <BottomActionContainer>
        <CTAButton type="button" onClick={handleOpenCreate}>
          + 새 일정 등록하기
        </CTAButton>
      </BottomActionContainer>

      {/* 4. 자체 완결적 일정 등록/수정 모달 */}
      {isModalOpen && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {selectedItem ? "일정 수정하기" : "새 일정 등록하기"}
              </ModalTitle>
              <CloseIconButton
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                aria-label="닫기"
              >
                ✕
              </CloseIconButton>
            </ModalHeader>

            <ModalForm onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel htmlFor="modal-title">일정 제목</FormLabel>
                <FormInput
                  id="modal-title"
                  name="title"
                  type="text"
                  placeholder="예: 2026학년도 1학기 입사 신청"
                  value={formData.title}
                  onChange={handleChange}
                  autoFocus
                  required
                />
              </FormGroup>

              <FormDateGrid>
                <FormGroup>
                  <FormLabel htmlFor="modal-start-date">시작일</FormLabel>
                  <FormInput
                    id="modal-start-date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="modal-end-date">종료일</FormLabel>
                  <FormInput
                    id="modal-end-date"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </FormDateGrid>

              <FormGroup>
                <FormLabel htmlFor="modal-link">연결 링크 (선택)</FormLabel>
                <FormInput
                  id="modal-link"
                  name="link"
                  type="url"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={handleChange}
                />
              </FormGroup>

              <ModalActionGroup>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "저장 중..."
                    : selectedItem
                      ? "수정 완료"
                      : "일정 등록하기"}
                </SubmitButton>

                {selectedItem && (
                  <DeleteButton
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    일정 삭제하기
                  </DeleteButton>
                )}
              </ModalActionGroup>
            </ModalForm>
          </ModalCard>
        </ModalOverlay>
      )}
    </ScreenContainer>
  );
};

export default CalendarAdminPage;

/* --- Styled Components (/frontend-ui-ux-guide 표준) --- */

const ScreenContainer = styled.div`
  width: 100%;
  min-height: 100dvh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #f2f4f6;
  padding-top: env(safe-area-inset-top, 0px);
  height: calc(56px + env(safe-area-inset-top, 0px));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 16px;
  box-sizing: border-box;
`;

const BackButton = styled.button`
  border: none;
  background: transparent;
  color: #191f28;
  font-size: 26px;
  line-height: 1;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 12px;
  transition: background-color 0.15s ease;

  &:hover {
    background: #f2f4f6;
  }
`;

const TopBarTitle = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191f28;
  letter-spacing: -0.2px;
`;

const ItemCountBadge = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #3182f6;
  background: #e8f3ff;
  padding: 4px 10px;
  border-radius: 8px;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 24px 20px calc(100px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
`;

const HeroTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #191f28;
  letter-spacing: -0.5px;
  line-height: 1.3;
`;

const HeroSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #4e5968;
  line-height: 1.5;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active }) => ($active ? "#191f28" : "#f2f4f6")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#4e5968")};
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#191f28" : "#e5e8eb")};
  }

  &:active {
    transform: scale(0.97);
  }
`;

const ListCard = styled.div`
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e5e8eb;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
`;

const RowItem = styled.button<{ $isLast: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  text-align: left;
  background: #ffffff;
  border: none;
  border-bottom: ${({ $isLast }) => ($isLast ? "none" : "1px solid #f2f4f6")};
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: #f9fafb;
  }

  &:active {
    background: #f2f4f6;
  }
`;

const RowLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const RowTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
  letter-spacing: -0.2px;
  line-height: 1.4;
`;

const RowDate = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #8b95a1;
  font-variant-numeric: tabular-nums;
`;

const RowLink = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #3182f6;
`;

const RowRight = styled.div`
  flex-shrink: 0;
`;

const StatusBadge = styled.span<{ $tone: "green" | "blue" | "gray" }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.2px;

  ${({ $tone }) => {
    switch ($tone) {
      case "green":
        return `
          background: #e6f8ef;
          color: #04b05c;
        `;
      case "blue":
        return `
          background: #e8f3ff;
          color: #3182f6;
        `;
      case "gray":
      default:
        return `
          background: #f2f4f6;
          color: #8b95a1;
        `;
    }
  }}
`;

const EmptyContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
  background: #ffffff;
  border-radius: 24px;
  border: 1px dashed #e5e8eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const EmptyTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191f28;
`;

const EmptyDesc = styled.p`
  margin: 0;
  font-size: 13px;
  color: #8b95a1;
`;

const BottomActionContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 25;
  background: linear-gradient(
    to top,
    #ffffff 70%,
    rgba(255, 255, 255, 0.8) 90%,
    transparent 100%
  );
  padding: 12px 20px calc(14px + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: center;
`;

const CTAButton = styled.button`
  width: 100%;
  max-width: 680px;
  height: 54px;
  border-radius: 18px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.25);
  transition: all 0.15s ease;

  &:hover {
    background: #1b64da;
  }

  &:active {
    transform: scale(0.98);
  }
`;

/* --- 모달 (독립적이고 안정적인 바텀/센터 모달) --- */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
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

const ModalCard = styled.div`
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
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 640px) {
    border-radius: 28px;
    padding: 28px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
    animation: fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
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

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: #191f28;
  letter-spacing: -0.3px;
`;

const CloseIconButton = styled.button`
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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #4e5968;
`;

const FormInput = styled.input`
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

const FormDateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const ModalActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
`;

const SubmitButton = styled.button`
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

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const DeleteButton = styled.button`
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
