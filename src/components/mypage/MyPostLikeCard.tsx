import styled from "styled-components";
import {
  MyPost_GroupOrder,
  MyPost_RoommateBoard,
  MyPost_TipBoard,
} from "@/types/members";
import TagIconWhiteBackground from "../common/TagIconWhiteBackground.tsx";
import { FaHeart } from "react-icons/fa";
import { getDeadlineText } from "@/utils/dateUtils";
import 사람 from "../../assets/chat/human.svg";
import { Dday, DividerBar, MetaInfo, People } from "@/styles/groupPurchase";
import { useNavigate } from "react-router-dom";

interface MyPostLikeCardProps {
  post: MyPost_GroupOrder | MyPost_RoommateBoard | MyPost_TipBoard;
  isLike?: boolean;
}

export default function MyPostLikeCard({ post, isLike }: MyPostLikeCardProps) {
  const navigate = useNavigate();

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
    }
  };

  return (
    <CardWrapper onClick={handleClick}>
      <LeftContent>
        <TopRow>
          {post.type === "GROUP_ORDER" && (
            <TagIconWhiteBackground tagTitle="공동구매" />
          )}
          {post.type === "ROOMMATE" && (
            <TagIconWhiteBackground tagTitle="룸메이트" />
          )}
          {post.type === "TIP" && <TagIconWhiteBackground tagTitle="꿀팁" />}
          <Title>{post.title}</Title>
        </TopRow>

        {post.type === "GROUP_ORDER" && <Price>{post.price}원</Price>}
        {post.type === "TIP" && <Text>{post.content}</Text>}
        {post.type === "ROOMMATE" && (
          <Text>
            <TagRow>
              <Tag category="mbti">{post.mbti}</Tag>
              <Tag category="college">{post.college}</Tag>
              <Tag category="smoker">{post.smoking ? "흡연⭕" : "흡연❌"}</Tag>
              <Tag category="clean">
                {post.arrangement ? "🧼깔끔" : "정돈보통"}
              </Tag>
            </TagRow>
            <StayInfo>상주 요일: {post.dormPeriod.join(", ")}</StayInfo>
            {/*기숙사 상주기간 : {post.dormPeriod} / 단과대 : {post.college} / MBTI*/}
            {/*: {post.mbti} / 취침 시간 : {post.bedTime} / 잠귀 : {post.sleeper}*/}
          </Text>
        )}

        {post.type === "GROUP_ORDER" && (
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
        )}
      </LeftContent>

      {isLike && (
        <RightContent>
          <FaHeart color="#FF453A" size={18} />
        </RightContent>
      )}

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
  min-height: 74px;
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
  min-width: 0; /* <<< 이 부분을 추가해주세요 */
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
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.165px;
`;

const Text = styled.div`
  color: var(--1, #1c1c1e);
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px; /* 200% */
  letter-spacing: 0.38px;

  display: -webkit-box;
  -webkit-line-clamp: 2; /* 최대 2줄까지만 표시 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  //margin-right: 60px;
`;
const Tag = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "category",
})<{ category: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #1c1c1e;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  background: ${({ category }) => {
    switch (category) {
      case "mbti":
        return "#E4F6ED";
      case "college":
        return "#FCEEF3";
      case "smoker":
        return "#E8F0FE";
      case "clean":
        return "#F3F4F6";
      default:
        return "#f1f1f1";
    }
  }};
`;

const StayInfo = styled.div`
  font-size: 12px;
  color: #3a3a3c;
`;
