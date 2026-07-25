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
      <HeaderArea>
        <Title>{post.title}</Title>
      </HeaderArea>


      <TagList>
        {post.college && <Tag>{post.college}</Tag>}
        {post.mbti && <Tag>{post.mbti}</Tag>}
      </TagList>
    </Card>
  );
}

const Card = styled.button`
  flex: 0 0 116px;
  width: 116px;
  min-height: 130px;
  padding: 12px 10px;
  border: 1px solid ${colors.blue.blue200};
  border-radius: 8px;
  background: ${colors.bg.bg1};
  box-shadow: 0px 0px 4px 0px rgba(105, 177, 255, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  scroll-snap-align: start;
  cursor: pointer;
  box-sizing: border-box;
  overflow: hidden;

  &:active {
    background: ${colors.blue.blue100};
  }

  &:disabled {
    border-color: ${colors.gray.gray200};
    box-shadow: none;
    opacity: 0.4;
    cursor: not-allowed;
  }
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
  color: ${colors.main.main2};
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

