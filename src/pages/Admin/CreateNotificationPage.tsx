import React, { useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import { NotificationPayload } from "../../types/notifications.ts";
import { createNotification } from "../../apis/notification.ts";

const CreateNotificationPage = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // API 명세에 따라 '유니돔', '생활원', '기타' 타입을 선택할 수 있도록 합니다.
  const [notificationType, setNotificationType] = useState("유니돔");
  const [boardId, setBoardId] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 기본 유효성 검사
    if (!title.trim() || !body.trim()) {
      alert("제목과 내용은 필수 입력 항목입니다.");
      return;
    }

    const payload: NotificationPayload = {
      title,
      body,
      notificationType,
      // boardId가 비어있으면 0으로, 값이 있으면 숫자로 변환하여 전송
      boardId: boardId ? parseInt(boardId, 10) : 0,
    };

    try {
      await createNotification(payload);
      alert("알림이 성공적으로 생성되었습니다.");
      // 성공 후 폼 초기화
      setTitle("");
      setBody("");
      setNotificationType("유니돔");
      setBoardId("");
    } catch (error) {
      console.error("알림 생성 실패:", error);
      alert("알림 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <PageWrapper>
      <Header hasBack={true} title="알림 생성" />
      <FormContainer onSubmit={handleSubmit}>
        <InputGroup>
          <Label>알림 타입</Label>
          <Select
            value={notificationType}
            onChange={(e) => setNotificationType(e.target.value)}
          >
            <option value="유니돔">유니돔 (전체 사용자)</option>
            <option value="생활원">생활원 (기숙사생)</option>
            <option value="기타">기타 (개별)</option>
          </Select>
        </InputGroup>

        <InputGroup>
          <Label>제목</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="알림의 제목을 입력하세요"
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>내용</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="알림의 상세 내용을 입력하세요"
            rows={8}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>게시글 ID (선택 사항)</Label>
          <Input
            type="number"
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            placeholder="알림과 연결할 게시글의 ID"
          />
        </InputGroup>

        <SubmitButton type="submit">알림 생성하기</SubmitButton>
      </FormContainer>
    </PageWrapper>
  );
};

export default CreateNotificationPage;

// --- Styled Components ---

const PageWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 60px; /* 헤더 높이만큼 패딩 */
  box-sizing: border-box;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  box-sizing: border-box;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Textarea = styled.textarea`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SubmitButton = styled.button`
  padding: 16px;
  margin-top: 16px;
  border: none;
  border-radius: 8px;
  background-color: #007bff;
  color: white;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;
