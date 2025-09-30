// src/components/tip/TipCard.tsx

import styled from "styled-components";
import { FaRegComment, FaRegHeart } from "react-icons/fa";

interface TipCardProps {
  tip: {
    boardId: number;
    title: string;
    content: string;
    time: string;
    like: number;
    comment: number;
  };
  onClick: () => void;
}

export default function TipCard({ tip, onClick }: TipCardProps) {
  return (
    <CardWrapper onClick={onClick}>
      <TopRow>
        <Title>{tip.title}</Title>
        <Time>{tip.time}</Time>
      </TopRow>
      <Content>{tip.content}</Content>
      <BottomRow>
        <FaRegHeart size={14} />
        <IconText>{tip.like}</IconText>
        <FaRegComment size={14} style={{ marginLeft: "12px" }} />
        <IconText>{tip.comment}</IconText>
      </BottomRow>
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #1c1c1e;
`;

const Time = styled.div`
  font-size: 12px;
  color: #888;
  min-width: fit-content;
`;

const Content = styled.div`
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
`;

const IconText = styled.span`
  margin-left: 4px;
`;
