import styled from "styled-components";
import CommentIcon from "../../assets/comment.svg";
import HeartIcon from "../../assets/heart.svg";
import { useNavigate } from "react-router-dom";

interface HomeCardProps {
  title: string;
  content: string;
  percentage?: number;
  commentCount: number;
  likeCount: number;
}

const RoomMateCard = ({
  title,
  content,
  percentage,
  commentCount,
  likeCount,
}: HomeCardProps) => {
  const navigate = useNavigate();
  return (
    <RoomMateCardWrapper
      onClick={() => {
        navigate("/roommatelist/1");
      }}
    >
      {percentage && (
        <LeftCircle>
          <span>{percentage}%</span>
        </LeftCircle>
      )}

      <ContentSection>
        <Title>{title}</Title>
        <SubText>{content}</SubText>
        <BottomLine>
          <img src={CommentIcon} />
          <span>{commentCount}</span>
          <img src={HeartIcon} />
          <span>{likeCount}</span>
        </BottomLine>
      </ContentSection>
    </RoomMateCardWrapper>
  );
};

export default RoomMateCard;

const RoomMateCardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
`;

const LeftCircle = styled.div`
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  border-radius: 50%;
  border: 4px solid #0a84ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #0a84ff;
  font-size: 14px;
  margin-right: 12px;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #1c1c1e;
  margin-bottom: 4px;
`;

const SubText = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: #1c1c1e;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BottomLine = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #1c1c1e;

  svg {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }

  span {
    margin-right: 8px;
  }
`;
