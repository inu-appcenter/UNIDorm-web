// src/components/tip/TipCard.tsx

import styled from "styled-components";
import { FaRegBookmark, FaRegComment } from "react-icons/fa";
import { MyPost } from "../../types/members.ts";

interface TipCardProps {
  tip: MyPost;
  onClick?: () => void;
}

export default function MyPostCard({ tip, onClick }: TipCardProps) {
  return (
    <CardWrapper onClick={onClick}>
      <Left>
        <ItemImage />
      </Left>
      <Right>
        <TopRow>
          <Title>{tip.title}</Title>
          <Time>{tip.createDate}</Time>
        </TopRow>
        <BottomRow>
          <FaRegBookmark size={14} />
          <IconText>{0}</IconText>
          <FaRegComment size={14} style={{ marginLeft: "12px" }} />
          <IconText>{0}</IconText>
        </BottomRow>
      </Right>
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.05);

  cursor: pointer;
  width: 100%;
  height: fit-content;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
  box-sizing: border-box;
`;

const Left = styled.div`
  width: fit-content;
  height: 100%;
  justify-content: center;
`;
const Right = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

const ItemImage = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
`;
