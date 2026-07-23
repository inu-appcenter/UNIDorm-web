import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  CalendarDays,
  Link2,
  PencilLine,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import {
  createCalendar,
  deleteCalendar,
  getAllCalendars,
  updateCalendar,
} from "@/apis/calendar";
import AdminBottomSheet from "@/components/modal/AdminBottomSheet";
import { useSetHeader } from "@/hooks/useSetHeader";
import {
  AdminActionRow,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardEyebrow,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminEmptyDescription,
  AdminEmptyState,
  AdminEmptyTitle,
  AdminField,
  AdminFieldGrid,
  AdminHero,
  AdminHeroMetricGrid,
  AdminInput,
  AdminLabel,
  AdminMiniStat,
  AdminMiniStatLabel,
  AdminMiniStatValue,
  AdminPage,
  AdminPageGrid,
  AdminScrollableArea,
  AdminShell,
  AdminStack,
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
  const [calendarList, setCalendarList] = useState<CalendarItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [formData, setFormData] = useState<CreateCalendarDto>(EMPTY_FORM);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const today = getLocalDateInputValue();

  useEffect(() => {
    void fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {
      const res = await getAllCalendars();
      setCalendarList(
        [...res.data].sort(
          (a, b) =>
            a.startDate.localeCompare(b.startDate) ||
            a.endDate.localeCompare(b.endDate),
        ),
      );
    } catch (err) {
      console.error("캘린더 일정 조회 실패", err);
    }
  };

  const summary = useMemo(() => {
    let active = 0;
    let upcoming = 0;
    let linked = 0;

    calendarList.forEach((item) => {
      if (item.link.trim()) {
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

  const openCreateEditor = () => {
    setSelectedItem(null);
    setFormData(EMPTY_FORM);
    setIsEditorOpen(true);
  };

  const openEditEditor = (item: CalendarItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      link: item.link,
      startDate: item.startDate,
      endDate: item.endDate,
    });
    setIsEditorOpen(true);
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
      await fetchCalendar();
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
      await fetchCalendar();
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

  return (
    <AdminShell>
      <AdminPage>
        <AdminHero>
          <AdminHeroMetricGrid>
            <AdminMiniStat>
              <AdminMiniStatLabel>등록 일정</AdminMiniStatLabel>
              <AdminMiniStatValue>{summary.total}</AdminMiniStatValue>
            </AdminMiniStat>
            <AdminMiniStat>
              <AdminMiniStatLabel>진행 중</AdminMiniStatLabel>
              <AdminMiniStatValue>{summary.active}</AdminMiniStatValue>
            </AdminMiniStat>
            <AdminMiniStat>
              <AdminMiniStatLabel>예정 일정</AdminMiniStatLabel>
              <AdminMiniStatValue>{summary.upcoming}</AdminMiniStatValue>
            </AdminMiniStat>
            <AdminMiniStat>
              <AdminMiniStatLabel>링크 포함</AdminMiniStatLabel>
              <AdminMiniStatValue>{summary.linked}</AdminMiniStatValue>
            </AdminMiniStat>
          </AdminHeroMetricGrid>
        </AdminHero>

        <AdminPageGrid $desktopColumns="minmax(0, 1fr)">
          <AdminStack>
            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitleGroup>
                  <AdminCardEyebrow>Schedule List</AdminCardEyebrow>
                  <AdminCardTitle>등록된 일정</AdminCardTitle>
                  <AdminCardDescription>
                    일정 추가하기 버튼으로 새 일정을 만들고, 기존 일정 카드를
                    눌러 수정할 수 있습니다.
                  </AdminCardDescription>
                </AdminCardTitleGroup>

                <AdminButton type="button" onClick={openCreateEditor}>
                  <PlusCircle size={16} />
                  일정 추가하기
                </AdminButton>
              </AdminCardHeader>

              {calendarList.length === 0 ? (
                <AdminEmptyState>
                  <AdminEmptyTitle>
                    아직 등록된 일정이 없습니다.
                  </AdminEmptyTitle>
                  <AdminEmptyDescription>
                    첫 일정을 추가하면 캘린더에 바로 반영됩니다.
                  </AdminEmptyDescription>
                  <AdminButton type="button" onClick={openCreateEditor}>
                    <PlusCircle size={16} />첫 일정 추가하기
                  </AdminButton>
                </AdminEmptyState>
              ) : (
                <AdminScrollableArea $maxHeight="720px">
                  <EventList>
                    {calendarList.map((item) => {
                      const status = getCalendarStatus(item, today);

                      return (
                        <EventCard
                          key={item.id}
                          type="button"
                          onClick={() => openEditEditor(item)}
                        >
                          <EventHeader>
                            <EventTitleWrap>
                              <EventTitle>{item.title}</EventTitle>
                              <EventDateText>
                                <CalendarDays size={16} />
                                {formatDateRangeLabel(
                                  item.startDate,
                                  item.endDate,
                                )}
                              </EventDateText>
                            </EventTitleWrap>
                            <EventBadgeGroup>
                              <AdminBadge $tone={status.tone}>
                                {status.label}
                              </AdminBadge>
                            </EventBadgeGroup>
                          </EventHeader>

                          {item.link.trim() && (
                            <EventLink>
                              <Link2 size={16} />
                              {getDomainLabel(item.link)}
                            </EventLink>
                          )}
                        </EventCard>
                      );
                    })}
                  </EventList>
                </AdminScrollableArea>
              )}
            </AdminCard>
          </AdminStack>
        </AdminPageGrid>

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
                {selectedItem ? selectedItem.title : "새 일정 등록"}
              </EditorTitle>
              <AdminSubtleText>
                제목, 기간, 링크를 입력해서 저장해 주세요.
              </AdminSubtleText>
            </EditorTitleGroup>

            <CloseButton type="button" onClick={closeEditor} aria-label="닫기">
              <X size={20} />
            </CloseButton>
          </EditorHeader>

          <EditorScrollArea>
            {selectedItem ? (
              <SelectedSummary>
                <AdminBadge $tone="blue">
                  <PencilLine size={14} />
                  편집 중
                </AdminBadge>
                <SelectedSummaryTitle>
                  {selectedItem.title}
                </SelectedSummaryTitle>
                <AdminSubtleText>
                  {formatDateRangeLabel(
                    selectedItem.startDate,
                    selectedItem.endDate,
                  )}
                </AdminSubtleText>
              </SelectedSummary>
            ) : (
              <SelectedSummary>
                <AdminBadge $tone="green">
                  <PlusCircle size={14} />새 일정
                </AdminBadge>
                <SelectedSummaryTitle>
                  새 일정 내용을 입력해 주세요
                </SelectedSummaryTitle>
                <AdminSubtleText>
                  링크는 선택 사항이며 입력하지 않으면 제목과 기간만 표시됩니다.
                </AdminSubtleText>
              </SelectedSummary>
            )}

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
                <AdminLabel htmlFor="calendar-link">연결 링크</AdminLabel>
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
                  {selectedItem ? "일정 저장" : "일정 등록"}
                </AdminButton>
                <AdminButton
                  type="button"
                  $tone="secondary"
                  onClick={closeEditor}
                >
                  닫기
                </AdminButton>
                {selectedItem && (
                  <AdminButton
                    type="button"
                    $tone="danger"
                    onClick={handleDelete}
                  >
                    <Trash2 size={16} />
                    일정 삭제
                  </AdminButton>
                )}
              </AdminActionRow>
            </Form>
          </EditorScrollArea>
        </AdminBottomSheet>
      </AdminPage>
    </AdminShell>
  );
};

export default CalendarAdminPage;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EventCard = styled.button`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  text-align: left;
  border-radius: 22px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 18px 32px -28px rgba(15, 23, 42, 0.12);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 22px 38px -28px rgba(37, 99, 235, 0.18);
    transform: translateY(-1px);
  }
`;

const EventHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
`;

const EventTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const EventTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
`;

const EventDateText = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
`;

const EventBadgeGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const EventLink = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #2563eb;
  word-break: break-all;
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e2e8f0;

  @media (min-width: 768px) {
    padding: 24px 24px 18px;
  }
`;

const EditorTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const EditorTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.3;
  color: #0f172a;
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  flex-shrink: 0;
`;

const EditorScrollArea = styled.div`
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const SelectedSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  border: 1px solid #dbeafe;
`;

const SelectedSummaryTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
`;
