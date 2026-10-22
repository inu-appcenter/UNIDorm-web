import { useRef } from "react";
import styled from "styled-components";
import ChatMessageContent from "./ChatMessageContent";
import ChatReplyQuoteBox from "./ChatReplyQuoteBox";
import type { ReplySourceDto } from "@/types/openchat";
import ChatBuliLogo from "@/assets/ai-chat/챗불이로고.svg";
import { useLongPress } from "@/hooks/useLongPress";
import { useSwipeToReply } from "@/hooks/useSwipeToReply";

type Props = {
  content: string;
  time: string;
  showTime?: boolean;
  imageUrls?: string[];
  unreadCount?: number;
  isBotQuestion?: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  replySource?: ReplySourceDto | null;
  replyThumbnailUrl?: string | null;
  onQuoteClick?: (targetMessageId: number) => void;
  onMessageClick?: (rect?: DOMRect) => void;
  onImageClick?: (url: string) => void;
  onSwipeReply?: () => void;
};

const ChatItemMy = ({
  content,
  time,
  showTime = true,
  imageUrls,
  unreadCount,
  isBotQuestion,
  isDeleted = false,
  isEdited = false,
  replySource,
  replyThumbnailUrl,
  onQuoteClick,
  onMessageClick,
  onImageClick,
  onSwipeReply,
}: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const unreadLabel =
    typeof unreadCount === "number"
      ? unreadCount > 0
        ? unreadCount > 99
          ? "99+"
          : String(unreadCount)
        : null
      : null;

  const [questionText, noticeText] =
    isBotQuestion && content.includes("\n\n")
      ? content.split("\n\n")
      : [content, null];

  const isMessageDeleted =
    Boolean(isDeleted) || content === "삭제된 메시지입니다.";

  const handleTriggerAction = () => {
    if (isMessageDeleted) return;
    const rect = contentRef.current?.getBoundingClientRect();
    if (onMessageClick) onMessageClick(rect);
  };

  const longPressHandlers = useLongPress({
    onLongPress: handleTriggerAction,
    delay: 400,
  });

  const { swipeHandlers, offsetX, isSwiping } = useSwipeToReply({
    onReply: onSwipeReply,
    direction: "left",
    disabled: isMessageDeleted,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMessageDeleted && onMessageClick) {
      longPressHandlers.onTouchStart();
    }
    swipeHandlers.onTouchStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMessageDeleted && onMessageClick) {
      longPressHandlers.onTouchMove();
    }
    swipeHandlers.onTouchMove(e);
  };

  const handleTouchEnd = () => {
    if (!isMessageDeleted && onMessageClick) {
      longPressHandlers.onTouchEnd();
    }
    swipeHandlers.onTouchEnd();
  };

  return (
    <ChatItemMyWrapper>
      <ContentArea
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseDown : undefined}
        onMouseUp={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseUp : undefined}
        onMouseLeave={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseLeave : undefined}
        $clickable={!isMessageDeleted && Boolean(onMessageClick)}
        style={{
          transform: offsetX ? `translateX(${offsetX}px)` : undefined,
          transition: isSwiping ? "none" : "transform 0.2s ease-out",
        }}
      >
        {isMessageDeleted ? (
          <DeletedMessageBubble>
            삭제된 메시지입니다.
          </DeletedMessageBubble>
        ) : imageUrls?.length ? (
          <div>
            {replySource && (
              <ChatReplyQuoteBox
                replySource={replySource}
                isMyMessage={true}
                thumbnailUrl={replyThumbnailUrl}
                onClick={() => onQuoteClick?.(replySource.replyToMessageId)}
              />
            )}
            <ImageGrid>
              {imageUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="첨부 사진"
                  onClick={(e) => {
                    if (onImageClick) {
                      e.stopPropagation();
                      onImageClick(url);
                    }
                  }}
                />
              ))}
            </ImageGrid>
          </div>
        ) : isBotQuestion ? (
          <BotQuestionMessage>
            <BotQuestionHeader>
              <img src={ChatBuliLogo} alt="" />
              <span>챗불이에게 질문</span>
            </BotQuestionHeader>
            <BotQuestionBody>
              <ChatMessageContent content={questionText} />
            </BotQuestionBody>
            {noticeText && (
              <BotQuestionNotice>
                <div className="dot" />
                <span>{noticeText}</span>
              </BotQuestionNotice>
            )}
          </BotQuestionMessage>
        ) : (
          <div className="message">
            {replySource && (
              <ChatReplyQuoteBox
                replySource={replySource}
                isMyMessage={true}
                thumbnailUrl={replyThumbnailUrl}
                onClick={() => onQuoteClick?.(replySource.replyToMessageId)}
              />
            )}
            <ChatMessageContent content={content} />
            {isEdited && !isDeleted && <EditedTag $isMy={true}>수정됨</EditedTag>}
          </div>
        )}
      </ContentArea>
      {(showTime || unreadLabel) && (
        <TimeArea>
          {showTime && <div className="time">{time}</div>}
          {unreadLabel && <div className="isRead">{unreadLabel}</div>}
        </TimeArea>
      )}
    </ChatItemMyWrapper>
  );
};

export default ChatItemMy;

const ChatItemMyWrapper = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row-reverse;

  padding: 8px 20px;
  box-sizing: border-box;

  gap: 4px;
`;

const DeletedMessageBubble = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #98a2b3;
  background-color: #f2f4f7;
  padding: 8px 12px;
  border-radius: 16px;
  user-select: none;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 140px));
  gap: 4px;
  overflow: hidden;
  border-radius: 16px;
  img {
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    display: block;
    cursor: pointer;
  }
  img:only-child {
    grid-column: 1 / -1;
    min-width: 140px;
  }
`;

const ContentArea = styled.div<{ $clickable?: boolean }>`
  width: fit-content;
  max-width: 80%;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  @media (min-width: 1024px) {
    max-width: 520px;
  }

  .title {
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0.38px;

    color: #1c1c1e;
  }

  .message {
    font-family: "Pretendard", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.5;
    text-align: start;

    color: #ffffff;
    background: #1677ff;
    padding: 8px 12px;
    border-radius: 16px;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const BotQuestionMessage = styled.div`
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  padding: 10px 12px;
  border-radius: 16px;
  border-bottom-right-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0px 2px 8px rgba(9, 88, 217, 0.2);
  word-break: break-word;
`;

const BotQuestionHeader = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px 2px 6px;
  border-radius: 12px;
  width: fit-content;

  img {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  span {
    font-family: "Pretendard", sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.2px;
  }
`;

const BotQuestionBody = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: #ffffff;
  white-space: pre-wrap;
`;

const BotQuestionNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 4px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #ffd666;
    margin-top: 4px;
    flex-shrink: 0;
  }
`;

const TimeArea = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column-reverse;
  font-family: "Pretendard", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 1.5;

  letter-spacing: 0.38px;
  .time {
    color: #8b8b8b;
  }
  .edited-tag {
    color: #98a2b3;
    font-size: 10px;
  }
  .isRead {
    color: #0958d9;
    font-size: 11px;
    font-weight: 600;
  }
`;

const EditedTag = styled.span<{ $isMy?: boolean }>`
  font-family: "Pretendard", sans-serif;
  font-size: 10px;
  color: ${({ $isMy }) => ($isMy ? "rgba(255, 255, 255, 0.75)" : "#98a2b3")};
  margin-left: 6px;
  display: inline-block;
  vertical-align: bottom;
  user-select: none;
`;

