import styled from "styled-components";
import { statusText } from "../../utils/formUtils.ts";

type FormContentProps = {
  status: string;
  duration: string;
  title: string;
  description: string;
  miniView?: boolean; // 변경된 부분: miniView prop 타입 추가
};

const FormContent = ({
  status,
  duration,
  title,
  description,
  miniView, // 변경된 부분: miniView prop 받기
}: FormContentProps) => {
  return (
    <FormContentWrapper>
      <FirstLine>
        <Badge status={statusText(status)}>{statusText(status)}</Badge>
        <Duration>{duration}</Duration>
      </FirstLine>
      <Title>{title}</Title>
      {/* 변경된 부분: miniView prop 전달 */}
      <Description miniView={miniView}>{description}</Description>
    </FormContentWrapper>
  );
};

export default FormContent;

const FormContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  gap: 4px;
`;

const FirstLine = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;

const Badge = styled.div<{ status: string }>`
  min-width: fit-content;
  border-radius: 23px;
  padding: 2px 10px;
  box-sizing: border-box;
  color: var(--1, #1c1c1e);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.38px;
  background: ${({ status }) =>
    status === "진행 전"
      ? "#CECECE" // 회색
      : status === "진행 중"
        ? "rgba(255, 212, 0, 0.4)" // 노란색
        : "rgba(235, 0, 0, 0.3)"}; // 빨간색
`;

const Duration = styled.div`
  color: var(--4, #48484a);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.38px;
`;

const Title = styled.div`
  color: #007aff;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.38px;
`;

const Description = styled.div<{ miniView?: boolean }>`
  overflow: hidden;
  color: var(--4, #48484a);
  text-overflow: ellipsis;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.38px;

  /* 줄바꿈(\n) 처리 */
  white-space: pre-line;

  ${({ miniView }) =>
    miniView &&
    `
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  `}
`;
