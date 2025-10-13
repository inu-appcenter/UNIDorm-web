// src/components/tip/MyPostCard.tsx

import styled from "styled-components";
import { MyPost_GroupOrder } from "../../types/members";
import TagIconWhiteBackground from "../common/TagIconWhiteBackground.tsx";
import { FaHeart } from "react-icons/fa";
import { getDeadlineText } from "../../utils/dateUtils.ts";
import 사람 from "../../assets/chat/human.svg";
import {
  Dday,
  DividerBar,
  MetaInfo,
  People,
} from "../../styles/groupPurchase.ts";
import { useNavigate } from "react-router-dom";

interface MyPostLikeCardProps {
  post: MyPost_GroupOrder;
  isLike?: boolean;
}

export default function MyPostLikeCard({ post, isLike }: MyPostLikeCardProps) {
  const navigate = useNavigate();

  /** ✅ 게시글 클릭 시 type에 따라 이동 경로 다르게 처리 */
  const handleClick = () => {
    switch (post.type) {
      case "GROUP_ORDER":
        navigate(`/groupPurchase/${post.boardId}`);
        break;
      case "ROOMMATE":
        navigate(`/roommate/list/${post.boardId}`);
        break;
      case "TIP":
        navigate(`/tips/${post.boardId}`);
        break;
      default:
        console.warn("알 수 없는 게시글 타입:", post.type);
    }
  };

  /** ✅ 타입별 배지 렌더링 */
  const renderBadge = () => {
    switch (post.type) {
      case "GROUP_ORDER":
        return <TagIconWhiteBackground tagTitle="공동구매" />;
      case "ROOMMATE":
        return <TagIconWhiteBackground tagTitle="룸메이트" />;
      case "TIP":
        return <TagIconWhiteBackground tagTitle="꿀팁" />;
      default:
        return null;
    }
  };

  return (
    <CardWrapper onClick={handleClick}>
      <LeftContent>
        <TopRow>
          {renderBadge()}
          <Title>{post.title}</Title>
        </TopRow>

        {post.price && <Price>{post.price}원</Price>}
        {/*{post.comment && <Text>{post.comment}</Text>}*/}

        <BottomRow>
          <MetaInfo>
            <Dday>{getDeadlineText(post.deadline)}</Dday>
            <DividerBar>|</DividerBar>
            <People>
              <img src={사람} alt="인원수" />
              조회수 {post.viewCount}
            </People>
          </MetaInfo>
        </BottomRow>
      </LeftContent>

      {/* ❤️ 좋아요 표시 */}
      {isLike && (
        <RightContent>
          <FaHeart color="#FF453A" size={18} />
        </RightContent>
      )}

      {/* 📷 게시글 이미지 */}
      {post.filePath && (
        <RightContent>
          <Image src={post.filePath} alt="게시글 이미지" />
        </RightContent>
      )}
    </CardWrapper>
  );
}

/* ======================= Styled Components ======================= */

const CardWrapper = styled.div`
  display: flex;
  background: transparent;
  //border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
  gap: 12px;
  align-items: flex-start;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
    transition: opacity 0.2s;
  }
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
  font-weight: 500;
  font-size: 16px;
  color: #1c1c1e;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  gap: 4px;
`;

const Image = styled.img`
  width: 82px;
  height: 82px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  object-fit: cover;
`;

const Price = styled.div`
  color: #000;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.165px;
`;

// const Text = styled.div`
//   color: var(--1, #1c1c1e);
//   font-family: Pretendard;
//   font-size: 12px;
//   font-style: normal;
//   font-weight: 500;
//   line-height: 24px; /* 200% */
//   letter-spacing: 0.38px;
// `;
