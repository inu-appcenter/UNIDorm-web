import React, { useState } from "react";
import styled from "styled-components";
import { AxiosError } from "axios";
import { NotificationPayload } from "@/types/notifications";
import {
  createNotification,
  createNotificationByStudentNumber,
} from "@/apis/notification";
import { useSetHeader } from "@/hooks/useSetHeader";

// 알림 타겟 타입 정의
const TARGET_TYPES = {
  UNIDORM: "UNIDORM", // 전체
  DORMITORY: "DORMITORY", // 생활원
  INDIVIDUAL: "INDIVIDUAL", // 개인
} as const;

const CreateNotificationPage = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<string>(TARGET_TYPES.UNIDORM);
  const [studentNumber, setStudentNumber] = useState("");
  const [boardId, setBoardId] = useState("");

  // 헤더 설정
  useSetHeader({ title: "푸시 알림 보내기" });

  // 전송 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 필수값 검증
    if (!title.trim() || !body.trim()) {
      alert("제목과 내용은 필수 입력 항목입니다.");
      return;
    }

    if (targetType === TARGET_TYPES.INDIVIDUAL && !studentNumber.trim()) {
      alert("개별 전송 시 학번은 필수입니다.");
      return;
    }

    // 페이로드 구성
    const payload: NotificationPayload = {
      title,
      body,
      notificationType: targetType,
      boardId: boardId ? parseInt(boardId, 10) : 0,
    };

    try {
      if (targetType === TARGET_TYPES.INDIVIDUAL) {
        // 개별 알림 API 호출
        await createNotificationByStudentNumber(studentNumber, payload);
      } else {
        // 단체 알림 API 호출
        await createNotification(payload);
      }

      alert("알림이 성공적으로 전송되었습니다.");
      resetForm();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("알림 전송 실패:", axiosError);
      alert("알림 전송 중 오류가 발생했습니다.");
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setTitle("");
    setBody("");
    setTargetType(TARGET_TYPES.UNIDORM);
    setStudentNumber("");
    setBoardId("");
  };

  return (
    <PageWrapper>
      <FormContainer onSubmit={handleSubmit}>
        <InputGroup>
          <Label>전송 대상</Label>
          <Select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
          >
            <option value={TARGET_TYPES.UNIDORM}>유니돔 (전체 사용자)</option>
            <option value={TARGET_TYPES.DORMITORY}>생활원 (기숙사생)</option>
            <option value={TARGET_TYPES.INDIVIDUAL}>개인 (학번 지정)</option>
          </Select>
        </InputGroup>

        {/* 개별 전송 선택 시 학번 입력 필드 노출 */}
        {targetType === TARGET_TYPES.INDIVIDUAL && (
          <InputGroup>
            <Label>학번</Label>
            <Input
              type="text"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="전송할 대상의 학번을 입력하세요"
              required
            />
          </InputGroup>
        )}

        <InputGroup>
          <Label>제목</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="알림 제목"
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>내용</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="알림 상세 내용"
            rows={8}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>관련 게시글 ID (선택)</Label>
          <Input
            type="number"
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            placeholder="이동할 게시글 ID"
          />
        </InputGroup>

        <SubmitButton type="submit">알림 보내기</SubmitButton>
      </FormContainer>
    </PageWrapper>
  );
};

export default CreateNotificationPage;

// --- Styled Components ---

const PageWrapper = styled.div`
  width: 100%;
  height: 100%;
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
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;
