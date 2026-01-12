import styled from "styled-components";
import { statusText } from "@/utils/formUtils";
import { DividerBar, People } from "@/styles/groupPurchase";
import 사람 from "../../assets/chat/human.svg";

type Props = {
  status: string;
  duration: string;
  title: string;
  viewCount: number;
};

const FormResultHeader = ({ status, duration, title, viewCount }: Props) => {
  return (
    <FormContentWrapper>
      <FirstLine>
        <Badge status={statusText(status)}>{statusText(status)}</Badge>
      </FirstLine>
      <Title>{title}</Title>
      <LastLine>
        <Duration>{duration}</Duration>
        <DividerBar>|</DividerBar>
        <People>
          <img src={사람} alt="인원수" />총 참여 {viewCount}
        </People>
      </LastLine>
    </FormContentWrapper>
  );
};

export default FormResultHeader;

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
  color: var(--6, #8e8e93);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 21px; /* 150% */
  letter-spacing: -0.165px;
`;

const Title = styled.div`
  color: #007aff;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.38px;
`;

const LastLine = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;
