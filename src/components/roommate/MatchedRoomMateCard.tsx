import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { RoommatePost } from "@/types/roommates";
import { colors, typography } from "@/styles/tokens";
import { mixpanelTrack } from "@/utils/mixpanel";
import 매칭완료 from "@/assets/roommate/매칭완료2.svg";

interface MatchedRoomMateCardProps {
  post: RoommatePost;
  matchedFilterFields?: string[];
}

export default function MatchedRoomMateCard({
  post,
  matchedFilterFields = [],
}: MatchedRoomMateCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (post.matched) return;

    mixpanelTrack.itemClicked(
      "룸메이트",
      post.boardId,
      post.title,
      "룸메이트_맞춤_카드",
    );
    navigate(`/roommate/list/${post.boardId}`, {
      state: { matchedFilterFields },
    });
  };

  const isRead = Boolean(post.read);

  // 단과대학 및 MBTI 두 필드만 고정 추출
  const fixedTags = [
    { key: "college", label: post.college },
    { key: "mbti", label: post.mbti },
  ].filter((t) => Boolean(t.label));

  return (
    <Card
      type="button"
      onClick={handleClick}
      disabled={post.matched}
      $isRead={isRead}
      $matched={post.matched}
      aria-label={`${post.title} 룸메이트 게시글 보기`}
    >
      {post.matched && <RightBottomBadge src={매칭완료} alt="매칭 완료" />}

      <HeaderArea>
        <Title>{post.title}</Title>
      </HeaderArea>

      <TagList>
        {fixedTags.map((tag, idx) => (
          <Tag key={`${tag.key}-${idx}`}>{tag.label}</Tag>
        ))}
      </TagList>
    </Card>
  );
}

const Card = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "$isRead" && prop !== "$matched",
})<{ $isRead?: boolean; $matched?: boolean }>`
  position: relative;
  flex: 0 0 116px;
  width: 116px;
  min-height: 130px;
  padding: 12px 10px;
  border-radius: 8px;
  border: ${({ $isRead }) =>
    $isRead
      ? `1px solid ${colors.gray.gray200}`
      : `1px solid ${colors.blue.blue200}`};
  background: ${colors.bg.bg1};
  opacity: ${({ $isRead }) => ($isRead ? 0.7 : 1)};
  box-shadow: ${({ $isRead }) =>
    $isRead ? "none" : "0px 0px 4px 0px rgba(105, 177, 255, 0.2)"};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  scroll-snap-align: start;
  cursor: ${({ $matched }) => ($matched ? "not-allowed" : "pointer")};
  box-sizing: border-box;
  overflow: hidden;

  &:active {
    background: ${colors.blue.blue100};
  }

  &:disabled {
    border-color: ${colors.gray.gray200};
    box-shadow: none;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const RightBottomBadge = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  z-index: 2;
  pointer-events: none;
`;

const HeaderArea = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Title = styled.p`
  ${typography.label1Normal}
  color: ${colors.gray.gray800};
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
`;

const TagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  margin-top: 8px;
`;

const Tag = styled.span`
  ${typography.caption1}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 4px 8px;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 24px;
  background: ${colors.blue.blue100};
  color: ${colors.blue.blue300};
  font-weight: 600;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
