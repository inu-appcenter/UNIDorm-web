import styled, { keyframes } from "styled-components";

interface MessageDeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function MessageDeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  isDeleting = false,
}: MessageDeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>메시지를 모두에게 삭제할까요?</Title>
        <Description>
          메시지 내용이 모든 참여자의 채팅방에서 삭제됩니다.
          <br />
          이미 전송된 알림 내용은 삭제되지 않을 수 있습니다.
        </Description>
        <ButtonGroup>
          <CancelButton type="button" onClick={onClose} disabled={isDeleting}>
            취소
          </CancelButton>
          <DeleteButton
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </DeleteButton>
        </ButtonGroup>
      </ModalContainer>
    </Overlay>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.15s ease-out;
`;

const ModalContainer = styled.div`
  width: 100%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 20px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: ${scaleUp} 0.15s ease-out;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 10px;
`;

const Description = styled.p`
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #6b7280;
  margin: 0 0 20px;
  word-break: keep-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
`;

const CancelButton = styled.button`
  flex: 1;
  height: 42px;
  border-radius: 10px;
  border: none;
  background-color: #f3f4f6;
  color: #4b5563;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;

  &:active {
    background-color: #e5e7eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  height: 42px;
  border-radius: 10px;
  border: none;
  background-color: #eb4d3d;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;

  &:active {
    background-color: #d73a2b;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
