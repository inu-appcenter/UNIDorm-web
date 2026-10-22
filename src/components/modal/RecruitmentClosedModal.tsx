import styled, { keyframes } from "styled-components";

interface RecruitmentClosedModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RecruitmentClosedModal({
  open,
  onClose,
}: RecruitmentClosedModalProps) {
  if (!open) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>모집이 마감된 채팅방입니다.</Title>
        <Description>
          이 채팅방은 모집이 마감되었어요.
          <br />
          새로운 채팅방을 원하신다면 직접 만들어보세요!
        </Description>
        <BackButton type="button" onClick={onClose}>
          이전으로
        </BackButton>
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
    transform: scale(0.96);
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
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
  color: #6b7280;
  margin: 0 0 20px;
  word-break: keep-all;
`;

const BackButton = styled.button`
  width: 100%;
  height: 44px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;

  &:active {
    background-color: #f3f4f6;
  }
`;
