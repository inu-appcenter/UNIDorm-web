import styled from "styled-components";

type FormContentProps = {
  badgeStatus: "진행전" | "진행중" | "마감";
  duration: string;
  title: string;
  description: string;
  miniView?: boolean; // 변경된 부분: miniView prop 타입 추가
};

const FormContent = ({
  badgeStatus,
  duration,
  title,
  description,
  miniView, // 변경된 부분: miniView prop 받기
}: FormContentProps) => {
  return (
    <FormContentWrapper>
      <FirstLine>
        <Badge status={badgeStatus}>{badgeStatus}</Badge>
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

const Badge = styled.div<{ status: "진행전" | "진행중" | "마감" }>`
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
    status === "진행전"
      ? "rgba(142, 142, 147, 0.3)" // 회색
      : status === "진행중"
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

// 변경된 부분: miniView prop 타입 및 조건부 스타일 추가
const Description = styled.div<{ miniView?: boolean }>`
  overflow: hidden;
  color: var(--4, #48484a);
  text-overflow: ellipsis;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.38px;

  /* miniView가 true일 때 2줄 말줄임표 스타일 적용 */
  ${({ miniView }) =>
    miniView &&
    `
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  `}
`;
