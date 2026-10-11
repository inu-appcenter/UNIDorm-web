import styled from "styled-components";
import { ReplySourceDto } from "@/types/openchat";
import { ArrowRight, CornerDownRight, Image as ImageIcon } from "lucide-react";

interface ChatReplyQuoteBoxProps {
  replySource: ReplySourceDto;
  isMyMessage?: boolean;
  onClick?: () => void;
}

export default function ChatReplyQuoteBox({
  replySource,
  isMyMessage = false,
  onClick,
}: ChatReplyQuoteBoxProps) {
  const isDeleted = replySource.status === "DELETED";
  const isNotFound = replySource.status === "NOT_FOUND";
  const isDerivedRoom =
    Boolean(replySource.replyToDerivedRoomId) ||
    replySource.status === "RECRUITING" ||
    replySource.status === "RECRUITMENT_CLOSED";
  const isClosed = replySource.status === "RECRUITMENT_CLOSED";

  let headerText = replySource.replyToSenderNickname || "익명";
  if (isDerivedRoom) {
    headerText = `[파생 톡방] ${replySource.contentPreview || "파생 톡방"}`;
  }

  let bodyText = replySource.contentPreview || "";
  let isImage = false;
  if (isDeleted) {
    bodyText = "삭제된 메시지입니다.";
  } else if (isNotFound) {
    bodyText = "원본 메시지를 확인할 수 없습니다.";
  } else if (
    bodyText === "사진" ||
    /\.(jpeg|jpg|gif|png|webp)($|\?)/i.test(bodyText)
  ) {
    isImage = true;
    bodyText = "사진";
  }

  return (
    <Container
      $isMyMessage={isMyMessage}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <IndicatorBar $isMyMessage={isMyMessage} />
      <ContentCol>
        <HeaderRow>
          <CornerDownRight
            size={12}
            color={isMyMessage ? "rgba(255,255,255,0.8)" : "#1677ff"}
          />
          <SenderName $isMyMessage={isMyMessage}>{headerText}</SenderName>
          {isDerivedRoom && (
            <StatusBadge $isClosed={isClosed} $isMyMessage={isMyMessage}>
              {isClosed ? "모집 마감" : "참여하기"}
              {!isClosed && <ArrowRight size={10} style={{ marginLeft: 2 }} />}
            </StatusBadge>
          )}
        </HeaderRow>
        <BodyText
          $isMyMessage={isMyMessage}
          $isDimmed={isDeleted || isNotFound}
        >
          {isImage && (
            <ImageIcon
              size={12}
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                marginRight: 4,
              }}
            />
          )}
          {bodyText}
        </BodyText>
      </ContentCol>
    </Container>
  );
}

const Container = styled.div<{ $isMyMessage: boolean }>`
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 6px 10px;
  margin-bottom: 6px;
  border-radius: 8px;
  background-color: ${({ $isMyMessage }) =>
    $isMyMessage ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.05)"};
  cursor: pointer;
  transition: opacity 0.15s ease;
  user-select: none;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 0.75;
  }
`;

const IndicatorBar = styled.div<{ $isMyMessage: boolean }>`
  width: 3px;
  border-radius: 2px;
  background-color: ${({ $isMyMessage }) =>
    $isMyMessage ? "#ffffff" : "#1677ff"};
  flex-shrink: 0;
`;

const ContentCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SenderName = styled.span<{ $isMyMessage: boolean }>`
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: ${({ $isMyMessage }) =>
    $isMyMessage ? "#ffffff" : "#1677ff"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BodyText = styled.span<{
  $isMyMessage: boolean;
  $isDimmed: boolean;
}>`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  color: ${({ $isMyMessage, $isDimmed }) => {
    if ($isMyMessage) {
      return $isDimmed ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.95)";
    }
    return $isDimmed ? "#98a2b3" : "#475467";
  }};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
`;

const StatusBadge = styled.span<{
  $isClosed: boolean;
  $isMyMessage: boolean;
}>`
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  background-color: ${({ $isClosed, $isMyMessage }) => {
    if ($isMyMessage) return "rgba(255,255,255,0.25)";
    return $isClosed ? "#fee4e2" : "#e6f4ff";
  }};
  color: ${({ $isClosed, $isMyMessage }) => {
    if ($isMyMessage) return "#ffffff";
    return $isClosed ? "#f04438" : "#1677ff";
  }};
`;
