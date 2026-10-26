import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  createCalendar,
  deleteCalendar,
  updateCalendar,
} from "@/apis/calendar";
import { useAllCalendars } from "@/queries/calendar";
import AdminBottomSheet from "@/components/modal/AdminBottomSheet";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useCountUp } from "@/hooks/useCountUp";
import {
  AdminActionRow,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminEmptyDescription,
  AdminEmptyState,
  AdminEmptyTitle,
  AdminField,
  AdminFieldGrid,
  AdminInput,
  AdminLabel,
  AdminMiniStat,
  AdminMiniStatLabel,
  AdminMiniStatValue,
  AdminPage,
  AdminScrollableArea,
  AdminShell,
  AdminSubtleText,
  formatDateRangeLabel,
  getDomainLabel,
  getLocalDateInputValue,
} from "@/pages/Admin/adminPageStyles";
import { CalendarItem, CreateCalendarDto } from "@/types/calendar";

const EMPTY_FORM: CreateCalendarDto = {
  title: "",
  link: "",
  startDate: "",
  endDate: "",
};

const getCalendarStatus = (item: CalendarItem, today: string) => {
  if (item.endDate < today) {
    return { label: "종료됨", tone: "slate" as const };
  }

  if (item.startDate > today) {
    return { label: "예정", tone: "blue" as const };
  }

  return { label: "진행 중", tone: "green" as const };
};

const CalendarAdminPage: React.FC = () => {
  const { data: rawCalendarList = [] } = useAllCalendars();
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [formData, setFormData] = useState<CreateCalendarDto>(EMPTY_FORM);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1080 : true,
  );
  const today = getLocalDateInputValue();

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1080;
      setIsDesktop(desktop);
      if (desktop) {
        setIsEditorOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const calendarList = useMemo(() => {
    return [...rawCalendarList].sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        a.endDate.localeCompare(b.endDate),
    );
  }, [rawCalendarList]);

  const summary = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let linked = 0;

    calendarList.forEach((item) => {
      if (item.link?.trim()) {
        linked += 1;
      }

      if (item.endDate < today) {
        return;
      }

      if (item.startDate > today) {
        upcoming += 1;
      } else {
        active += 1;
      }
    });

    return {
      total: calendarList.length,
      active,
      upcoming,
      linked,
    };
  }, [calendarList, today]);

  const animatedTotal = useCountUp(summary.total);
  const animatedActive = useCountUp(summary.active);
  const animatedUpcoming = useCountUp(summary.upcoming);
  const animatedLinked = useCountUp(summary.linked);

  const openCreateEditor = () => {
    setSelectedItem(null);
    setFormData(EMPTY_FORM);
    if (!isDesktop) {
      setIsEditorOpen(true);
    }
  };

  const openEditEditor = (item: CalendarItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      link: item.link ?? "",
      startDate: item.startDate,
      endDate: item.endDate,
    });
    if (!isDesktop) {
      setIsEditorOpen(true);
    }
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setSelectedItem(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startDate > formData.endDate) {
      alert("종료일이 시작일보다 빠를 수는 없습니다.");
      return;
    }

    try {
      if (selectedItem) {
        await updateCalendar(selectedItem.id, formData);
        alert("일정을 수정했습니다.");
      } else {
        await createCalendar(formData);
        alert("일정을 등록했습니다.");
      }

      closeEditor();
    } catch (err) {
      console.error("캘린더 일정 저장 실패", err);
      alert("일정을 저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) {
      return;
    }

    if (!window.confirm(`"${selectedItem.title}" 일정을 삭제할까요?`)) {
      return;
    }

    try {
      await deleteCalendar(selectedItem.id);
      alert("일정을 삭제했습니다.");
      closeEditor();
    } catch (err) {
      console.error("캘린더 일정 삭제 실패", err);
      alert("일정을 삭제하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useSetHeader({ title: "캘린더 관리" });

  const renderFormFields = () => (
    <Form onSubmit={handleSubmit}>
      <AdminField>
        <AdminLabel htmlFor="calendar-title">일정 제목</AdminLabel>
        <AdminInput
          id="calendar-title"
          name="title"
          type="text"
          placeholder="예: 기숙사 입사 신청"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </AdminField>

      <AdminField>
        <AdminLabel htmlFor="calendar-link">연결 링크 (선택)</AdminLabel>
        <AdminInput
          id="calendar-link"
          name="link"
          type="url"
          placeholder="https://example.com"
          value={formData.link}
          onChange={handleChange}
        />
      </AdminField>

      <AdminFieldGrid>
        <AdminField>
          <AdminLabel htmlFor="calendar-start-date">시작일</AdminLabel>
          <AdminInput
            id="calendar-start-date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </AdminField>

        <AdminField>
          <AdminLabel htmlFor="calendar-end-date">종료일</AdminLabel>
          <AdminInput
            id="calendar-end-date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </AdminField>
      </AdminFieldGrid>

      <AdminActionRow>
        <AdminButton type="submit">
          {selectedItem ? "일정 저장하기" : "일정 등록하기"}
        </AdminButton>
        <AdminButton
          type="button"
          $tone="secondary"
          onClick={closeEditor}
        >
          취소
        </AdminButton>
        {selectedItem && (
          <AdminButton
            type="button"
            $tone="danger"
            onClick={handleDelete}
          >
            일정 삭제
          </AdminButton>
        )}
      </AdminActionRow>
    </Form>
  );

  return (
    <AdminShell>
      <AdminPage>
        {/* 상단 4대 핵심 지표 (Zero-Icon & 카운트업) */}
        <MetricsGrid>
          <AdminMiniStat>
            <AdminMiniStatLabel>전체 일정</AdminMiniStatLabel>
            <AdminMiniStatValue>{animatedTotal}건</AdminMiniStatValue>
          </AdminMiniStat>
          <AdminMiniStat>
            <AdminMiniStatLabel>진행 중</AdminMiniStatLabel>
            <AdminMiniStatValue style={{ color: "#04b05c" }}>
              {animatedActive}건
            </AdminMiniStatValue>
          </AdminMiniStat>
          <AdminMiniStat>
            <AdminMiniStatLabel>예정 일정</AdminMiniStatLabel>
            <AdminMiniStatValue style={{ color: "#3182f6" }}>
              {animatedUpcoming}건
            </AdminMiniStatValue>
          </AdminMiniStat>
          <AdminMiniStat>
            <AdminMiniStatLabel>링크 포함</AdminMiniStatLabel>
            <AdminMiniStatValue>{animatedLinked}건</AdminMiniStatValue>
          </AdminMiniStat>
        </MetricsGrid>

        {/* 메인 작업 영역: PC 2열 스플릿 뷰 / 모바일 1열 */}
        <PageLayoutGrid>
          {/* 좌측: 등록된 일정 목록 */}
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitleGroup>
                <AdminCardTitle>등록된 일정 목록</AdminCardTitle>
                <AdminCardDescription>
                  일정 카드를 선택하여 세부 내용을 수정하거나 삭제할 수 있습니다.
                </AdminCardDescription>
              </AdminCardTitleGroup>

              <DesktopCreateButton
                type="button"
                onClick={openCreateEditor}
              >
                새 일정 추가하기
              </DesktopCreateButton>
            </AdminCardHeader>

            {calendarList.length === 0 ? (
              <AdminEmptyState>
                <AdminEmptyTitle>아직 등록된 일정이 없습니다.</AdminEmptyTitle>
                <AdminEmptyDescription>
                  새 일정을 추가하면 생활원 캘린더에 실시간으로 반영됩니다.
                </AdminEmptyDescription>
                <AdminButton type="button" onClick={openCreateEditor}>
                  첫 일정 추가하기
                </AdminButton>
              </AdminEmptyState>
            ) : (
              <AdminScrollableArea $maxHeight="700px">
                <EventList>
                  {calendarList.map((item) => {
                    const status = getCalendarStatus(item, today);
                    const isSelected = selectedItem?.id === item.id;

                    return (
                      <EventCard
                        key={item.id}
                        type="button"
                        $isSelected={isSelected}
                        onClick={() => openEditEditor(item)}
                      >
                        <EventHeader>
                          <EventTitleWrap>
                            <EventTitle>{item.title}</EventTitle>
                            <EventDateText>
                              {formatDateRangeLabel(
                                item.startDate,
                                item.endDate,
                              )}
                            </EventDateText>
                          </EventTitleWrap>
                          <AdminBadge $tone={status.tone}>
                            {status.label}
                          </AdminBadge>
                        </EventHeader>

                        {item.link?.trim() && (
                          <EventLinkText>
                            {getDomainLabel(item.link)}
                          </EventLinkText>
                        )}
                      </EventCard>
                    );
                  })}
                </EventList>
              </AdminScrollableArea>
            )}
          </AdminCard>

          {/* PC 전용 우측 고정 에디터 패널 (Sticky) */}
          <DesktopEditorCard $sticky>
            <AdminCardHeader>
              <AdminCardTitleGroup>
                <AdminBadge $tone={selectedItem ? "blue" : "green"}>
                  {selectedItem ? "일정 편집 중" : "새 일정 작성"}
                </AdminBadge>
                <AdminCardTitle>
                  {selectedItem ? selectedItem.title : "새 일정 등록하기"}
                </AdminCardTitle>
                <AdminCardDescription>
                  일정 제목과 노출 기간, 연결 링크를 입력해 주세요.
                </AdminCardDescription>
              </AdminCardTitleGroup>
            </AdminCardHeader>

            {renderFormFields()}
          </DesktopEditorCard>
        </PageLayoutGrid>

        {/* 모바일/태블릿 전용 슬라이드 인 바텀시트 에디터 */}
        {!isDesktop && (
          <AdminBottomSheet
            isOpen={isEditorOpen}
            setIsOpen={(nextOpen) => {
              if (!nextOpen) {
                closeEditor();
              }
            }}
            title={selectedItem ? "일정 수정" : "새 일정 등록"}
            description="캘린더 일정 편집 패널"
          >
            <EditorHeader>
              <EditorTitleGroup>
                <AdminBadge $tone={selectedItem ? "blue" : "green"}>
                  {selectedItem ? "일정 수정" : "새 일정"}
                </AdminBadge>
                <EditorTitle>
                  {selectedItem ? selectedItem.title : "새 일정 등록하기"}
                </EditorTitle>
                <AdminSubtleText>
                  제목, 기간, 링크를 입력하고 저장해 주세요.
                </AdminSubtleText>
              </EditorTitleGroup>

              <CloseButton type="button" onClick={closeEditor} aria-label="닫기">
                ✕
              </CloseButton>
            </EditorHeader>

            <EditorScrollArea>
              {renderFormFields()}
            </EditorScrollArea>
          </AdminBottomSheet>
        )}

        {/* 모바일 전용 하단 고정 CTA */}
        <MobileCTAContainer>
          <MobileCTAButton type="button" onClick={openCreateEditor}>
            새 일정 추가하기
          </MobileCTAButton>
        </MobileCTAContainer>
      </AdminPage>
    </AdminShell>
  );
};

export default CalendarAdminPage;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }
`;

const PageLayoutGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;

  @media (min-width: 1080px) {
    grid-template-columns: minmax(0, 1.18fr) minmax(360px, 0.82fr);
    align-items: start;
    gap: 28px;
  }
`;

const DesktopCreateButton = styled(AdminButton)`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
  }
`;

const DesktopEditorCard = styled(AdminCard)`
  display: none;

  @media (min-width: 1080px) {
    display: flex;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EventCard = styled.button<{ $isSelected?: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  text-align: left;
  border-radius: 18px;
  border: 1.5px solid ${({ $isSelected }) => ($isSelected ? "#3182f6" : "#e5e8eb")};
  background: ${({ $isSelected }) => ($isSelected ? "#f8fbff" : "#ffffff")};
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: #3182f6;
    background-color: #fcfdfe;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.99);
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const EventTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const EventTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #191f28;
  letter-spacing: -0.01em;
`;

const EventDateText = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7684;
`;

const EventLinkText = styled.span`
  font-size: 0.82rem;
  color: #3182f6;
  font-weight: 600;
  word-break: break-all;
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px 14px;
  border-bottom: 1px solid #f2f4f6;
`;

const EditorTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const EditorTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #191f28;
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  color: #6b7684;
  background: #f2f4f6;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: #e5e8eb;
    color: #191f28;
  }
`;

const EditorScrollArea = styled.div`
  overflow-y: auto;
  padding: 20px 20px calc(24px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 18px;
  -webkit-overflow-scrolling: touch;
`;

const MobileCTAContainer = styled.div`
  display: block;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  max-width: 600px;
  margin: 0 auto;
  pointer-events: none;
  background: linear-gradient(to top, #ffffff 60%, rgba(255, 255, 255, 0));
  padding: 16px 20px calc(14px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 1080px) {
    display: none;
  }
`;

const MobileCTAButton = styled.button`
  pointer-events: auto;
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background: #3182f6;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  border: none;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.28);
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;
