// src/components/tip/MyPostCard.tsx

import styled from "styled-components";
import { MyPost } from "../../types/members";
import TagIconWhiteBackground from "../common/TagIconWhiteBackground.tsx";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";

interface MyPostLikeCardProps {
  post: MyPost;
  isLike?: boolean;
  onClick?: () => void;
}

export default function MyPostLikeCard({
  post,
  isLike,
  onClick,
}: MyPostLikeCardProps) {
  const { title, content, tipLikeCount, tipCommentCount, type } = post;

  const renderBadge = () => {
    switch (type) {
      case "GROUP":
        return <TagIconWhiteBackground tagTitle={"공동구매"} />;
      case "ROOMMATE":
        return <TagIconWhiteBackground tagTitle={"룸메이트"} />;
      case "TIP":
        return <TagIconWhiteBackground tagTitle={"꿀팁"} />;
      default:
        return null;
    }
  };

  return (
    <CardWrapper onClick={onClick}>
      <LeftContent>
        <TopRow>
          {renderBadge()}
          <Title>{title}</Title>
        </TopRow>
        <ContentText>{content}</ContentText>
        <BottomRow>
          <FaRegHeart size={12} />
          <IconText>{tipLikeCount}</IconText>
          <FaRegComment size={12} style={{ marginLeft: 12 }} />
          <IconText>{tipCommentCount}</IconText>
        </BottomRow>
      </LeftContent>

      {isLike && (
        <RightContent>
          <FaHeart color="red" size={20} />
        </RightContent>
      )}
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  display: flex;
  background: transparent;
  border-radius: 12px;
  //padding: 12px;
  width: 100%;
  box-sizing: border-box;
  gap: 12px;
  align-items: flex-start;
`;

const LeftContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RightContent = styled.div`
  display: flex;
  align-items: center;
  padding-left: 8px;
  box-sizing: border-box;
  min-width: 24px;
  height: 100%;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #1c1c1e;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ContentText = styled.div`
  font-size: 14px;
  color: #555;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  gap: 4px;
`;

const IconText = styled.span`
  margin-left: 4px;
`;
