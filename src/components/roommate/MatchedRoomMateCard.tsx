import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { RoommatePost } from "@/types/roommates";
import { colors, typography } from "@/styles/tokens";
import { mixpanelTrack } from "@/utils/mixpanel";

interface MatchedRoomMateCardProps {
  post: RoommatePost;
  matchedFilterFields?: string[];
}

const getFieldValue = (fieldKey: string, post: RoommatePost): string => {
  switch (fieldKey) {
    case "dormType":
      return post.dormType;
    case "college":
      return post.college;
    case "mbti":
      return post.mbti;
    case "smoking":
      return post.smoking;
    case "snoring":
      return post.snoring;
    case "toothGrind":
      return post.toothGrind;
    case "sleeper":
      return post.sleeper;
    case "showerHour":
      return post.showerHour;
    case "showerTime":
      return post.showerTime;
    case "bedTime":
      return post.bedTime;
    case "arrangement":
      return post.arrangement;
    case "religion":
      return post.religion;
    default:
      return fieldKey;
  }
};

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

  const displayTags =
    matchedFilterFields.length > 0
      ? matchedFilterFields.map((field) => ({
          key: field,
          label: getFieldValue(field, post) || field,
          isMatched: true,
        }))
      : [
          { key: "college", label: post.college, isMatched: false },
          { key: "mbti", label: post.mbti, isMatched: false },
        ].filter((t) => Boolean(t.label));

  return (
    <Card
      type="button"
      onClick={handleClick}
      disabled={post.matched}
      $isRead={isRead}
      aria-label={`${post.title} 룸메이트 게시글 보기`}
    >
      <HeaderArea>
        <Title>{post.title}</Title>
      </HeaderArea>

      <TagList>
        {displayTags.map((tag, idx) => (
          <Tag key={`${tag.key}-${idx}`} $isMatched={tag.isMatched}>
            {tag.label}
          </Tag>
        ))}
      </TagList>
    </Card>
  );
}

const Card = styled.button<{ $isRead?: boolean }>`
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
  opacity: ${({ $isRead }) => ($isRead ? 0.4 : 1)};
  box-shadow: ${({ $isRead }) =>
    $isRead ? "none" : "0px 0px 4px 0px rgba(105, 177, 255, 0.2)"};
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

const Tag = styled.span<{ $isMatched?: boolean }>`
  ${typography.caption1}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 4px 8px;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 24px;
  background: ${({ $isMatched }) =>
    $isMatched ? colors.blue.blue100 : colors.gray.gray100};
  color: ${({ $isMatched }) =>
    $isMatched ? colors.blue.blue300 : colors.gray.gray600};
  font-weight: ${({ $isMatched }) => ($isMatched ? "600" : "400")};
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;


