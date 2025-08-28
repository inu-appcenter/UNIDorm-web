// NoticeCard.tsx
import React from "react";
import styled from "styled-components";

interface NoticeCardProps {
  miniView?: boolean;
  date: string;
  type: string;
  dorm: string;
  studentNumber: string;
  phoneNumber?: string;
  title: string;
  content: string;
}

const ComplainCard: React.FC<NoticeCardProps> = ({
  miniView,
  date,
  type,
  dorm,
  studentNumber,
  phoneNumber,
  title,
  content,
}) => {
  return (
    <Card>
      <Header>
        <Badge>{type}</Badge>
        <DateText>{date}</DateText>
      </Header>
      {miniView && <GotoDetail>민원 상세보기 {">"}</GotoDetail>}
      {!miniView && (
        <Info>
          <div>
            <strong>기숙사</strong> {dorm}
          </div>
          <div>
            <strong>사생번호</strong> {studentNumber}
          </div>
          {phoneNumber && (
            <div>
              <strong>연락처</strong> {phoneNumber}
            </div>
          )}
        </Info>
      )}

      <Title>{title}</Title>
      <Content miniView={miniView}>{content}</Content>
      {!miniView && <ImagePlaceholder />}
    </Card>
  );
};

export default ComplainCard;

const Card = styled.div`
  position: relative;
  width: 100%;
  //max-width: 400px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);

  padding: 16px;
  box-sizing: border-box;
  background-color: #fff;
  //font-family: "Noto Sans KR", sans-serif;

  box-shadow: 2px 4px 8px 0 rgba(0, 0, 0, 0.06);
`;

const Header = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
`;

const Badge = styled.div`
  background-color: #ffd60a33;
  color: #1c1c1e;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
`;

const DateText = styled.div`
  color: #48484a;
  font-size: 16px;
  font-weight: 500;
`;

const Info = styled.div`
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: #1c1c1e;
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1rem;
`;

const Content = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "miniView",
})<{ miniView?: boolean }>`
  font-size: 0.9rem;
  color: #333;
  white-space: ${({ miniView }) => (miniView ? "nowrap" : "pre-line")};
  overflow: hidden;
  text-overflow: ${({ miniView }) => (miniView ? "ellipsis" : "clip")};
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 180px;
  background-color: #ddd;
  border-radius: 8px;
  margin-top: 12px;
`;

const GotoDetail = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;

  color: #0a84ff;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: 0.38px;
`;
