import { useRef } from "react";
import styled from "styled-components";
import profile from "../../assets/profileimg.png";
import { useLongPress } from "@/hooks/useLongPress";
import { useSwipeToReply } from "@/hooks/useSwipeToReply";
import ChatMessageContent from "./ChatMessageContent";
import ChatReplyQuoteBox from "./ChatReplyQuoteBox";
import type { ReplySourceDto } from "@/types/openchat";
import ChatBuliLogo from "@/assets/ai-chat/챗불이로고.svg";

type Props = {
  content: string;
  time: string;
  showTime?: boolean;
  showSenderInfo?: boolean;
  userImageUrl?: string | null;
  senderName?: string;
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
  onAvatarClick?: () => void;
  onSwipeReply?: () => void;
};

const ChatItemOtherPerson = ({
  content,
  time,
  showTime = true,
  showSenderInfo = true,
  userImageUrl,
  senderName,
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
  onAvatarClick,
  onSwipeReply,
}: Props) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const unreadLabel =
    typeof unreadCount === "number"
      ? unreadCount > 0
        ? unreadCount > 99
          ? "99+"
          : String(unreadCount)
        : null
      : null;

  const isMessageDeleted =
    Boolean(isDeleted) || content === "삭제된 메시지입니다.";

  const handleTriggerAction = () => {
    if (isMessageDeleted) return;
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (onMessageClick) onMessageClick(rect);
  };

  const longPressHandlers = useLongPress({
    onLongPress: handleTriggerAction,
    delay: 400,
  });

  const { swipeHandlers, offsetX, isSwiping } = useSwipeToReply({
    onReply: onSwipeReply,
    direction: "right",
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
    <ChatItemOtherPersonWrapper>
      <ProfileImg
        $hidden={!showSenderInfo}
        $clickable={Boolean(onAvatarClick)}
        src={userImageUrl && userImageUrl !== "string" ? userImageUrl : profile}
        alt="상대방"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = profile;
        }}
        onClick={(e) => {
          if (onAvatarClick) {
            e.stopPropagation();
            onAvatarClick();
          }
        }}
      />
      <ContentArea
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: offsetX ? `translateX(${offsetX}px)` : undefined,
          transition: isSwiping ? "none" : "transform 0.2s ease-out",
        }}
      >
        {showSenderInfo && senderName && (
          <div
            className="sender-name"
            style={{ cursor: onAvatarClick ? "pointer" : "default" }}
            onClick={(e) => {
              if (onAvatarClick) {
                e.stopPropagation();
                onAvatarClick();
              }
            }}
          >
            {senderName}
          </div>
        )}
        {isMessageDeleted ? (
          <DeletedMessageBubble ref={bubbleRef}>
            삭제된 메시지입니다.
          </DeletedMessageBubble>
        ) : imageUrls?.length ? (
          <div>
            {replySource && (
              <ChatReplyQuoteBox
                replySource={replySource}
                isMyMessage={false}
                thumbnailUrl={replyThumbnailUrl}
                onClick={() => onQuoteClick?.(replySource.replyToMessageId)}
              />
            )}
            <ImageGrid
              ref={bubbleRef}
              onMouseDown={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseDown : undefined}
              onMouseUp={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseUp : undefined}
              onMouseLeave={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseLeave : undefined}
              $clickable={Boolean(onMessageClick)}
            >
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
          <BotQuestionBubble
            ref={bubbleRef}
            onMouseDown={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseDown : undefined}
            onMouseUp={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseUp : undefined}
            onMouseLeave={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseLeave : undefined}
            $clickable={Boolean(onMessageClick)}
          >
            <BotQuestionHeader>
              <img src={ChatBuliLogo} alt="" />
              <span>챗불이에게 질문</span>
            </BotQuestionHeader>
            <ChatMessageContent content={content} />
          </BotQuestionBubble>
        ) : (
          <MessageBubble
            ref={bubbleRef}
            onMouseDown={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseDown : undefined}
            onMouseUp={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseUp : undefined}
            onMouseLeave={!isMessageDeleted && onMessageClick ? longPressHandlers.onMouseLeave : undefined}
            $clickable={Boolean(onMessageClick)}
          >
            {replySource && (
              <ChatReplyQuoteBox
                replySource={replySource}
                isMyMessage={false}
                thumbnailUrl={replyThumbnailUrl}
                onClick={() => onQuoteClick?.(replySource.replyToMessageId)}
              />
            )}
            <ChatMessageContent content={content} />
            {isEdited && !isDeleted && <EditedTag $isMy={false}>수정됨</EditedTag>}
          </MessageBubble>
        )}
      </ContentArea>
      {(showTime || unreadLabel) && (
        <TimeArea>
          {showTime && <div className="time">{time}</div>}
          {unreadLabel && <div className="isRead">{unreadLabel}</div>}
        </TimeArea>
      )}
    </ChatItemOtherPersonWrapper>
  );
};

export default ChatItemOtherPerson;

const ChatItemOtherPersonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: row;

  padding: 8px 20px;
  box-sizing: border-box;

  gap: 8px;
`;

const ImageGrid = styled.div<{ $clickable?: boolean }>`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 140px));
  gap: 4px;
  overflow: hidden;
  border-radius: 16px;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: transform 0.15s ease, filter 0.15s ease;

  img {
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    display: block;
  }
  img:only-child {
    grid-column: 1 / -1;
    min-width: 140px;
  }

  &:active {
    ${({ $clickable }) =>
      $clickable &&
      `
      transform: scale(0.97);
      filter: brightness(0.92);
    `}
  }
`;

const ProfileImg = styled.img<{ $hidden: boolean; $clickable?: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  visibility: ${({ $hidden }) => ($hidden ? "hidden" : "visible")};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: transform 0.15s ease, filter 0.15s ease;

  &:active {
    ${({ $clickable }) =>
      $clickable &&
      `
      transform: scale(0.92);
      filter: brightness(0.9);
    `}
  }
`;

const ContentArea = styled.div`
  width: fit-content;
  max-width: 80%;

  @media (min-width: 1024px) {
    max-width: 520px;
  }
  display: flex;
  flex-direction: column;

  .sender-name {
    font-family: "Pretendard", sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: #3d3d3d;
    margin-bottom: 4px;
    padding-left: 4px;
  }
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

const MessageBubble = styled.div<{ $clickable?: boolean }>`
  font-family: "Pretendard", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  text-align: start;

  color: #3d3d3d;
  background: #f7f7f7;
  padding: 8px 12px;
  border-radius: 16px;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: transform 0.15s ease, background-color 0.15s ease;

  &:active {
    ${({ $clickable }) =>
      $clickable &&
      `
      transform: scale(0.97);
      background-color: #e5e5e5;
    `}
  }
`;

const BotQuestionBubble = styled.div<{ $clickable?: boolean }>`
  background: #e6f4ff;
  border: 1px solid #bae0ff;
  padding: 8px 12px;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  word-break: break-word;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #1c1c1e;
`;

const BotQuestionHeader = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  padding: 2px 6px;
  border-radius: 8px;
  width: fit-content;
  border: 1px solid #bae0ff;

  img {
    width: 13px;
    height: 13px;
    object-fit: contain;
  }

  span {
    font-family: "Pretendard", sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #0958d9;
  }
`;

const TimeArea = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column-reverse;
  font-family: "Pretendard", sans-serif;
  .time {
    font-style: normal;
    font-weight: 400;
    font-size: 11px;
    line-height: 1.5;

    letter-spacing: 0.38px;

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

