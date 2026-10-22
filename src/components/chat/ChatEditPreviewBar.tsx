import styled from "styled-components";
import { X, Pencil } from "lucide-react";

export interface EditTargetInfo {
  id: number;
  content: string;
}

interface ChatEditPreviewBarProps {
  message: EditTargetInfo | null;
  onCancel: () => void;
}

export default function ChatEditPreviewBar({
  message,
  onCancel,
}: ChatEditPreviewBarProps) {
  if (!message) return null;

  return (
    <Container>
      <ContentArea>
        <TitleRow>
          <Pencil size={13} color="#1677ff" />
          <TitleText>메시지 수정</TitleText>
        </TitleRow>
        <PreviewRow>
          <PreviewText>{message.content}</PreviewText>
        </PreviewRow>
      </ContentArea>
      <CloseButton
        type="button"
        aria-label="수정 취소"
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

const TitleText = styled.span`
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

const PreviewText = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: #667085;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f2f4f7;
  }
`;
