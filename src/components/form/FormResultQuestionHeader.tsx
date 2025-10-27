import styled from "styled-components";
import { DividerBar, People } from "../../styles/groupPurchase.ts";
import 사람 from "../../assets/chat/human.svg";

type Props = {
  type: string;
  question: string;
  answerCount: number;
  unanswerCount: number;
};

const FormResultQuestionHeader = ({
  type,
  question,
  answerCount,
  unanswerCount,
}: Props) => {
  const typeText = () => {
    switch (type) {
      case "SHORT_ANSWER":
        return "주관식";
      case "MULTIPLE_CHOICE":
        return "객관식";
      default:
        return "알 수 없음";
    }
  };

  return (
    <FormContentWrapper>
      <FirstLine>
        <Badge status={typeText()}>{typeText()}</Badge>
      </FirstLine>
      <Title>{question}</Title>
      <LastLine>
        <People>
          <img src={사람} alt="답변" />
          답변 {answerCount}
        </People>
        <DividerBar>|</DividerBar>
        <People>
          <img src={사람} alt="미답변" />
          미답변 {unanswerCount}
        </People>
      </LastLine>
    </FormContentWrapper>
  );
};

export default FormResultQuestionHeader;

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
    status === "주관식"
      ? "rgba(52, 199, 89, 0.3)" // 녹색
      : status === "객관식"
        ? "rgba(0, 122, 255, 0.3)" // 파란색
        : "#cecece"}; // 회색
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
