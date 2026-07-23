import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { RoommatePost } from "@/types/roommates";
import { colors, typography } from "@/styles/tokens";
import { mixpanelTrack } from "@/utils/mixpanel";

interface MatchedRoomMateCardProps {
  post: RoommatePost;
}

export default function MatchedRoomMateCard({
  post,
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
    navigate(`/roommate/list/${post.boardId}`);
  };

  return (
    <Card
      type="button"
      onClick={handleClick}
      disabled={post.matched}
      aria-label={`${post.title} 룸메이트 게시글 보기`}
    >
      <MetaRow>
        <DormType>{post.dormType}</DormType>
        {post.matched && <MatchedBadge>매칭 완료</MatchedBadge>}
      </MetaRow>

      <Title>{post.title}</Title>

      <TagList>
        <Tag>{post.college}</Tag>
        <Tag>{post.mbti}</Tag>
      </TagList>
    </Card>
  );
}

const Card = styled.button`
  flex: 0 0 148px;
  min-height: 158px;
  padding: 14px 12px;
  border: 1px solid ${colors.blue.blue300};
  border-radius: 10px;
  background: ${colors.bg.bg1};
  color: ${colors.gray.gray800};
  text-align: left;
  scroll-snap-align: start;
  cursor: pointer;

  &:active {
    background: ${colors.blue.blue100};
  }

  &:disabled {
    border-color: ${colors.gray.gray200};
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`;

const DormType = styled.span`
  ${typography.caption1}
  color: ${colors.gray.gray500};
`;

const MatchedBadge = styled.span`
  ${typography.caption2}
  padding: 2px 5px;
  border-radius: 999px;
  background: ${colors.gray.gray100};
  color: ${colors.gray.gray600};
  white-space: nowrap;
`;

const Title = styled.strong`
  ${typography.body1Normal}
  display: -webkit-box;
  min-height: 48px;
  margin-top: 4px;
  overflow: hidden;
  color: ${colors.gray.gray900};
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

const TagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 9px;
`;

const Tag = styled.span`
  ${typography.caption1}
  display: block;
  width: 100%;
  padding: 3px 8px;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 999px;
  background: ${colors.blue.blue100};
  color: ${colors.blue.blue700};
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
