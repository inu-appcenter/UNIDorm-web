import styled from "styled-components";
import { X, Image as ImageIcon } from "lucide-react";

export interface ReplyTargetInfo {
  messageId: number;
  senderName: string;
  type?: string;
  content: string;
  thumbnailUrl?: string;
  roomName?: string;
  roomDescription?: string;
}

interface ChatReplyPreviewBarProps {
  replyTarget: ReplyTargetInfo | null;
  onCancel: () => void;
}

export default function ChatReplyPreviewBar({
  replyTarget,
  onCancel,
}: ChatReplyPreviewBarProps) {
  if (!replyTarget) return null;

  const isRoomLink =
    replyTarget.type === "ROOM_LINK" || replyTarget.type === "REOPEN_CARD";
  const isImage =
    replyTarget.type === "IMAGE" || Boolean(replyTarget.thumbnailUrl);

  const titleText = isRoomLink
    ? `[파생 톡방] ${replyTarget.roomName || replyTarget.content || "단체 톡방"}`
    : `${replyTarget.senderName}에게 답장`;

  const previewText = isRoomLink
    ? replyTarget.roomDescription || "새로운 단체 톡방입니다."
    : isImage
      ? "사진"
      : replyTarget.content;

  return (
    <Container>
      <ContentArea>
        <TitleRow>
          <TargetName>{titleText}</TargetName>
        </TitleRow>
        <PreviewRow>
          {isImage && (
            <ThumbnailWrapper>
              {replyTarget.thumbnailUrl ? (
                <ThumbnailImg
                  src={replyTarget.thumbnailUrl}
                  alt="답장 이미지 미리보기"
                />
              ) : (
                <ImageIcon size={14} color="#667085" />
              )}
            </ThumbnailWrapper>
          )}
          <PreviewText>{previewText}</PreviewText>
        </PreviewRow>
      </ContentArea>
      <CloseButton
        type="button"
        aria-label="답장 취소"
        onClick={onCancel}
      >
        <X size={18} color="#98a2b3" />
      </CloseButton>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 8px 14px;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #eaecf0;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  animation: slideUp 0.15s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TargetName = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #1677ff;
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

const ThumbnailWrapper = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: #f2f4f7;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThumbnailImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PreviewText = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #667085;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 50%;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f2f4f7;
  }
`;
