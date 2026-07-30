import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { RoommatePost } from "@/types/roommates";
import { colors, typography } from "@/styles/tokens";
import { mixpanelTrack } from "@/utils/mixpanel";

interface MatchedRoomMateCardProps {
  post: RoommatePost;
  matchedFilterFields?: string[];
}

const FILTER_FIELD_NAMES: Record<string, string> = {
  dormType: "기숙사",
  college: "단과대",
  dormPeriod: "상주기간",
  mbti: "MBTI",
  smoking: "흡연",
  snoring: "코골이",
  toothGrind: "이갈이",
  sleeper: "잠귀",
  showerHour: "샤워시간",
  showerTime: "샤워소요",
  bedTime: "취침시간",
  arrangement: "정리정돈",
  religion: "종교",
};

export default function MatchedRoomMateCard({
  post,
  matchedFilterFields,
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

  const isRead = Boolean(post.read);

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
        {matchedFilterFields && matchedFilterFields.length > 0 ? (
          matchedFilterFields.map((field) => (
            <Tag key={field}>{FILTER_FIELD_NAMES[field] || field}</Tag>
          ))
        ) : (
          <>
            {post.college && <Tag>{post.college}</Tag>}
            {post.mbti && <Tag>{post.mbti}</Tag>}
          </>
        )}
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

