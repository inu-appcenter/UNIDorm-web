import styled from "styled-components";
import profile from "../../assets/profileimg.png";
import { useLongPress } from "@/hooks/useLongPress";
import ChatMessageContent from "./ChatMessageContent";

type Props = {
  content: string;
  time: string;
  showTime?: boolean;
  showSenderInfo?: boolean;
  userImageUrl?: string | null;
  senderName?: string;
  imageUrls?: string[];
  unreadCount?: number;
  onMessageClick?: () => void;
  onImageClick?: (url: string) => void;
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
  onMessageClick,
  onImageClick,
}: Props) => {
  const unreadLabel =
    typeof unreadCount === "number"
      ? unreadCount > 0
        ? unreadCount > 99
          ? "99+"
          : String(unreadCount)
        : null
      : null;

  const longPressHandlers = useLongPress({
    onLongPress: () => {
      if (onMessageClick) onMessageClick();
    },
    delay: 500,
  });

  return (
    <ChatItemOtherPersonWrapper>
      <ProfileImg
        $hidden={!showSenderInfo}
        src={userImageUrl && userImageUrl !== "string" ? userImageUrl : profile}
        alt="상대방"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = profile;
        }}
      />
      <ContentArea>
        {showSenderInfo && senderName && (
          <div className="sender-name">{senderName}</div>
        )}
        {imageUrls?.length ? (
          <ImageGrid
            {...(onMessageClick ? longPressHandlers : {})}
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
        ) : (
          <MessageBubble
            {...(onMessageClick ? longPressHandlers : {})}
            $clickable={Boolean(onMessageClick)}
          >
            <ChatMessageContent content={content} />
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

const ProfileImg = styled.img<{ $hidden: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  visibility: ${({ $hidden }) => ($hidden ? "hidden" : "visible")};
`;

const ContentArea = styled.div`
  width: fit-content;
  max-width: 60%;
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

const TimeArea = styled.div`
  display: flex;
  align-items: flex-end;
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
  .isRead {
    color: #0958d9;
    font-size: 11px;
    font-weight: 600;
  }
`;
