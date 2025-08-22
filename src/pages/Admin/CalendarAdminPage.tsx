import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { CalendarItem, CreateCalendarDto } from "../../types/calendar.ts";
import {
  createCalendar,
  deleteCalendar,
  getAllCalendars,
  updateCalendar,
} from "../../apis/calendar.ts";
import Header from "../../components/common/Header.tsx";
import { useNavigate } from "react-router-dom";

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

  // const currentYear = new Date().getFullYear();
  // const currentMonth = new Date().getMonth() + 1;

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
      console.log("formData", formData);
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

    const confirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmed) return;

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
    setSelectedItem(item);
    setFormData({
      title: item.title,
      link: item.link,
      startDate: item.startDate,
      endDate: item.endDate,
    });
  };

  const handleCancel = () => {
    resetForm();
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
      <Header
        title={"캘린더 관리자 페이지"}
        hasBack={true}
        menuItems={menuItems}
      />
      <Section>
        <Title>📅 캘린더 이벤트 목록</Title>
        <List>
          {calendarList.map((item) => (
            <ListItem key={item.id} onClick={() => handleSelect(item)}>
              <strong>{item.title}</strong> ({item.startDate} ~ {item.endDate})
            </ListItem>
          ))}
        </List>
      </Section>

      <Section>
        <Title>
          {selectedItem ? "📝 캘린더 수정" : "➕ 새 캘린더 이벤트 생성"}
        </Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="title"
            placeholder="제목"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <Input
            type="text"
            name="link"
            placeholder="링크"
            value={formData.link}
            onChange={handleChange}
          />
          <Input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
          <Input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
          <Button type="submit">
            {selectedItem ? "수정하기" : "생성하기"}
          </Button>
          {selectedItem && (
            <>
              <DeleteButton type="button" onClick={handleDelete}>
                삭제
              </DeleteButton>
              <CancelButton type="button" onClick={handleCancel}>
                취소
              </CancelButton>
            </>
          )}
        </Form>
      </Section>
    </Wrapper>
  );
};

export default CalendarAdminPage;

export const Wrapper = styled.div`
  padding: 30px;
  padding-top: 80px;
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;
`;

export const Section = styled.section`
  margin-bottom: 40px;
`;

export const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

export const List = styled.ul`
  list-style: none;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
`;

export const ListItem = styled.li`
  padding: 14px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f7f7f7;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
`;

export const Input = styled.input`
  padding: 10px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const Button = styled.button`
  padding: 12px;
  background-color: #4caf50;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #43a047;
  }
`;

export const CancelButton = styled(Button)`
  background-color: #9e9e9e;

  &:hover {
    background-color: #757575;
  }
`;
export const DeleteButton = styled(Button)`
  background-color: #f44336;

  &:hover {
    background-color: #e53935;
  }
`;
