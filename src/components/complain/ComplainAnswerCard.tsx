// NoticeCard.tsx
import React from "react";
import styled from "styled-components";

interface File {
  filePath: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
}

interface NoticeCardProps {
  date: string;
  type: string;
  managerName: string;
  title: string;
  content: string;
  images?: File[];
}

const ComplainCard: React.FC<NoticeCardProps> = ({
  date,
  type,
  managerName,
  title,
  content,
  images,
}) => {
  return (
    <Card>
      <Header>
        <Badge>{type}</Badge>
        <DateText>{date}</DateText>
      </Header>
      <Info>
        <div>
          <strong>담당자</strong> {managerName}
        </div>
      </Info>
      <Title>{title}</Title>
      <Content>{content}</Content>
      {images &&
        images.length > 0 &&
        images.map((image, index) => (
          <ImagePlaceholder key={index} src={image.filePath} />
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  box-sizing: border-box;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
`;

const Badge = styled.div`
  background-color: #0a84ff;
  color: #f4f4f4;
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

const Content = styled.div`
  font-size: 0.9rem;
  color: #333;
  overflow: hidden;
`;

const ImagePlaceholder = styled.img`
  width: 100%;
  height: 180px;
  background-color: #ddd;
  border-radius: 8px;
  margin-top: 12px;
`;
