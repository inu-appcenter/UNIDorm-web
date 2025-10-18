import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { CalendarItem, CreateCalendarDto } from "../../types/calendar.ts";
import {
  createCalendar,
  deleteCalendar,
  getAllCalendars,
  updateCalendar,
} from "../../apis/calendar.ts";
import Header from "../../components/common/Header/Header.tsx";
import { useNavigate } from "react-router-dom";

// --- 페이지 컴포넌트 ---
const CalendarAdminPage: React.FC = () => {
  const [calendarList, setCalendarList] = useState<CalendarItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [formData, setFormData] = useState<CreateCalendarDto>({
    title: "",
    link: "",
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {
      const res = await getAllCalendars();
      setCalendarList(res.data);
    } catch (err) {
      console.error("캘린더 불러오기 실패", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await updateCalendar(selectedItem.id, formData);
        alert("수정 완료");
      } else {
        await createCalendar(formData);
        alert("생성 완료");
      }
      resetForm();
      fetchCalendar();
    } catch (err) {
      console.error("저장 실패", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteCalendar(selectedItem.id);
      alert("삭제 완료");
      resetForm();
      fetchCalendar();
    } catch (err) {
      console.error("삭제 실패", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (item: CalendarItem) => {
    if (selectedItem?.id === item.id) {
      resetForm();
    } else {
      setSelectedItem(item);
      setFormData({
        title: item.title,
        link: item.link,
        startDate: item.startDate,
        endDate: item.endDate,
      });
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({ title: "", link: "", startDate: "", endDate: "" });
  };

  const menuItems = [
    {
      label: "로그아웃",
      onClick: () => {
        navigate("/logout");
      },
    },
  ];

  return (
    <Wrapper>
      <Header title={"캘린더 관리"} hasBack={true} menuItems={menuItems} />
      <MainContent>
        <Section>
          <Title>📅 이벤트 목록</Title>
          <List>
            {calendarList.map((item) => (
              <ListItem
                key={item.id}
                onClick={() => handleSelect(item)}
                data-selected={selectedItem?.id === item.id}
              >
                <ItemInfo>
                  <ItemTitle>{item.title}</ItemTitle>
                  {item.link && <LinkIcon>🔗</LinkIcon>}
                </ItemInfo>
                <ItemDate>
                  {item.startDate} ~ {item.endDate}
                </ItemDate>
              </ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <Title>{selectedItem ? "📝 이벤트 수정" : "➕ 새 이벤트 추가"}</Title>
          <Form onSubmit={handleSubmit}>
            <FormField>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="이벤트 제목을 입력하세요"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField>
              <Label htmlFor="link">관련 링크</Label>
              <Input
                id="link"
                name="link"
                type="text"
                placeholder="https://example.com (선택 사항)"
                value={formData.link}
                onChange={handleChange}
              />
            </FormField>

            <DateFields>
              <FormField>
                <Label htmlFor="startDate">시작일</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </FormField>
              <FormField>
                <Label htmlFor="endDate">종료일</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </FormField>
            </DateFields>

            <SubmitButton type="submit">
              {selectedItem ? "변경사항 저장" : "새 이벤트 생성"}
            </SubmitButton>

            {selectedItem && (
              <ActionGroup>
                <DeleteButton type="button" onClick={handleDelete}>
                  삭제하기
                </DeleteButton>
                <CancelButton type="button" onClick={resetForm}>
                  취소
                </CancelButton>
              </ActionGroup>
            )}
          </Form>
        </Section>
      </MainContent>
    </Wrapper>
  );
};

export default CalendarAdminPage;

// --- Styled Components (파일 내부에서만 사용) ---

const Wrapper = styled.div`
  --color-primary: #6a5af9;
  --color-primary-light: #f0eeff;
  --color-danger: #ef4444;
  --color-danger-light: #fee2e2;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-placeholder: #9ca3af;
  --color-background: #f9fafb;
  --color-surface: #ffffff;
  --color-border: #e5e7eb;

  padding: 90px 16px 40px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fafafa;

  flex: 1;
`;

const MainContent = styled.div`
  display: flex;
  gap: 40px;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 30px;
  }
`;

const Section = styled.section`
  background: var(--color-surface);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  flex: 1;
  width: 100%;
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 25px;
  color: var(--color-text-primary);
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 65vh;
  overflow-y: auto;
`;

const ListItem = styled.li`
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.25s ease-out;
  border-radius: 12px;

  &[data-selected="true"] {
    background-color: var(--color-primary-light);
    transform: scale(1.02);
  }

  &:hover:not([data-selected="true"]) {
    background-color: var(--color-background);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
`;

const ItemTitle = styled.strong`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const LinkIcon = styled.span`
  font-size: 14px;
`;

const ItemDate = styled.span`
  font-size: 14px;
  color: var(--color-text-secondary);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const Input = styled.input`
  padding: 12px;
  box-sizing: border-box;
  font-size: 15px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  color: var(--color-text-primary);

  &::placeholder {
    color: var(--color-text-placeholder);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }
`;

const DateFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Button = styled.button`
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.98);
  }
`;

const SubmitButton = styled(Button)`
  color: white;
  background: linear-gradient(45deg, var(--color-primary), #8b7fff);
  box-shadow: 0 4px 15px rgba(106, 90, 249, 0.2);

  &:hover {
    opacity: 0.9;
    box-shadow: 0 6px 20px rgba(106, 90, 249, 0.3);
  }
`;

const ActionGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: -10px; // SubmitButton과의 간격 조절
`;

const CancelButton = styled(Button)`
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);

  &:hover {
    background-color: var(--color-background);
    color: var(--color-text-primary);
  }
`;

const DeleteButton = styled(Button)`
  background-color: var(--color-danger-light);
  color: var(--color-danger);

  &:hover {
    background-color: var(--color-danger);
    color: white;
  }
`;
