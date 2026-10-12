import styled from "styled-components";
import { ReplySourceDto } from "@/types/openchat";
import { MessageSquare, Image as ImageIcon } from "lucide-react";

interface ChatReplyQuoteBoxProps {
  replySource: ReplySourceDto;
  isMyMessage?: boolean;
  thumbnailUrl?: string | null;
  onClick?: () => void;
}

export default function ChatReplyQuoteBox({
  replySource,
  isMyMessage = false,
  thumbnailUrl,
  onClick,
}: ChatReplyQuoteBoxProps) {
  const isDeleted = replySource.status === "DELETED";
  const isNotFound = replySource.status === "NOT_FOUND";
  const isDerivedRoom =
    Boolean(replySource.replyToDerivedRoomId) ||
    replySource.status === "RECRUITING" ||
    replySource.status === "RECRUITMENT_CLOSED";

  const senderName = replySource.replyToSenderNickname || "익명";

  let headerTitle = `${senderName}에게 답장`;
  if (isDerivedRoom) {
    headerTitle = replySource.contentPreview || "파생 톡방";
  }

  let bodyText = replySource.contentPreview || "";
  let isImage = Boolean(thumbnailUrl);

  if (isDeleted) {
    bodyText = "삭제된 메시지입니다.";
  } else if (isNotFound) {
    bodyText = "원본 메시지를 확인할 수 없습니다.";
  } else if (
    bodyText === "사진" ||
    /\.(jpeg|jpg|gif|png|webp)($|\?)/i.test(bodyText) ||
    Boolean(thumbnailUrl)
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
      <HeaderRow $isMyMessage={isMyMessage}>
        {isDerivedRoom && (
          <MessageSquare
            size={12}
            style={{
              marginRight: 4,
              flexShrink: 0,
              display: "inline-block",
              verticalAlign: "middle",
            }}
          />
        )}
        <SenderTitle $isMyMessage={isMyMessage}>{headerTitle}</SenderTitle>
      </HeaderRow>

      <PreviewRow>
        {thumbnailUrl ? (
          <ThumbnailImg src={thumbnailUrl} alt="사진" />
        ) : isImage ? (
          <ImageIcon
            size={13}
            style={{
              marginRight: 4,
              flexShrink: 0,
              opacity: isMyMessage ? 0.9 : 0.7,
            }}
          />
        ) : null}
        <PreviewText
          $isMyMessage={isMyMessage}
          $isDimmed={isDeleted || isNotFound}
        >
          {bodyText}
        </PreviewText>
      </PreviewRow>

      <DividerLine $isMyMessage={isMyMessage} />
    </Container>
  );
}

const Container = styled.div<{ $isMyMessage: boolean }>`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  user-select: none;
  margin-bottom: 6px;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.88;
  }

  &:active {
    opacity: 0.72;
  }
`;

const HeaderRow = styled.div<{ $isMyMessage: boolean }>`
  display: flex;
  align-items: center;
  min-width: 0;
  margin-bottom: 2px;
  color: ${({ $isMyMessage }) =>
    $isMyMessage ? "rgba(255, 255, 255, 0.75)" : "#8c8c8c"};
`;

const SenderTitle = styled.span<{ $isMyMessage: boolean }>`
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: ${({ $isMyMessage }) =>
    $isMyMessage ? "rgba(255, 255, 255, 0.75)" : "#8c8c8c"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PreviewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const ThumbnailImg = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: rgba(0, 0, 0, 0.05);
`;

const PreviewText = styled.span<{
  $isMyMessage: boolean;
  $isDimmed: boolean;
}>`
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.35;
  color: ${({ $isMyMessage, $isDimmed }) => {
    if ($isMyMessage) {
      return $isDimmed ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.9)";
    }
    return $isDimmed ? "#98a2b3" : "#667085";
  }};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: ${({ $isDimmed }) => ($isDimmed ? "italic" : "normal")};
`;

const DividerLine = styled.div<{ $isMyMessage: boolean }>`
  width: 100%;
  height: 1px;
  margin-top: 6px;
  background-color: ${({ $isMyMessage }) =>
    $isMyMessage ? "rgba(255, 255, 255, 0.22)" : "rgba(0, 0, 0, 0.08)"};
`;
