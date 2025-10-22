import React from "react";
import styled from "styled-components";

interface ComplainCardProps {
  miniView?: boolean;
  date: string;
  type: string;
  dorm: string;
  location: string;
  title: string;
  content: string;

  incidentDate: string;
  incidentTime: string;
  specificLocation: string;

  images?: string[];
}

const ComplainCard: React.FC<ComplainCardProps> = ({
  miniView,
  date,
  type,
  dorm,
  location,
  title,
  content,
  images,
  incidentDate,
  incidentTime,
  specificLocation,
}) => {
  // 날짜 형식을 'YY.MM.DD HH:MM'으로 변경
  const formattedDate = date.replace(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}).*$/,
    (_match, p1, p2, p3, p4, p5) =>
      `${p1.substring(2)}.${p2}.${p3} ${p4}:${p5}`,
  );

  return (
    <Card>
      <Header>
        <Badge>{type}</Badge>
        <DateText>{formattedDate}</DateText>
      </Header>
      {miniView && <GotoDetail>민원 상세보기 {">"}</GotoDetail>}
      {!miniView && (
        <Info>
          <div>
            <strong>기숙사</strong> {dorm}
          </div>
          <div>
            <strong>동 / 층 / 호수 / 침대번호</strong> {location}
          </div>
          <div>
            <strong>발생 일시</strong> {incidentDate} {incidentTime}
          </div>
          <div>
            <strong>발생 장소</strong> {specificLocation}
          </div>
        </Info>
      )}

      <Title>{title}</Title>
      <Content miniView={miniView}>{content}</Content>
      {!miniView &&
        images &&
        images.length > 0 &&
        images.map((image, index) => (
          <ImagePlaceholder key={index} src={image} />
        ))}
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

  color: var(--4, #48484a);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 150% */
  letter-spacing: 0.38px;
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

const ImagePlaceholder = styled.img`
  width: 100%;
  //height: 180px;
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
