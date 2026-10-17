import styled, { keyframes } from "styled-components";

interface RecruitmentReopenModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RecruitmentReopenModal({
  open,
  onConfirm,
  onCancel,
}: RecruitmentReopenModalProps) {
  if (!open) return null;

  return (
    <Overlay onClick={onCancel}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>모집을 재개할까요?</Title>
        <Description>
          모집을 재개하면 새로운 참여자도 이전 대화 내용을 볼 수 있습니다.
          <br />
          <br />
          민감한 대화나 개인 정보가 있다면 먼저 삭제해 주세요.
        </Description>
        <ButtonGroup>
          <CancelButton type="button" onClick={onCancel}>
            취소
          </CancelButton>
          <ConfirmButton type="button" onClick={onConfirm}>
            모집 재개
          </ConfirmButton>
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
  z-index: 10000;
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
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
`;

const Description = styled.p`
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.5;
  color: #4b5563;
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
  height: 44px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  color: #4b5563;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;

  &:active {
    background-color: #f3f4f6;
  }
`;

const ConfirmButton = styled.button`
  flex: 1;
  height: 44px;
  border-radius: 10px;
  border: none;
  background-color: #2b66f6;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;

  &:active {
    background-color: #1d4ed8;
  }
`;
