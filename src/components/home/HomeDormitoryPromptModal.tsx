import styled, { keyframes } from "styled-components";
import * as Dialog from "@radix-ui/react-dialog";
import { GraduationCap, X } from "lucide-react";
import CapsuleButton from "@/components/common/CapsuleButton";

export interface HomeDormitoryPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function HomeDormitoryPromptModal({
  isOpen,
  onClose,
  onConfirm,
}: HomeDormitoryPromptModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Overlay />
        <Container onPointerDownOutside={onClose}>
          <CloseButton onClick={onClose} aria-label="닫기">
            <X size={20} color="#8B95A1" />
          </CloseButton>

          <IconCircle>
            <GraduationCap size={28} color="#3182F6" strokeWidth={2.2} />
          </IconCircle>

          <Dialog.Title asChild>
            <Title>모바일 사생증을 발급할까요?</Title>
          </Dialog.Title>

          <Dialog.Description asChild>
            <Description>
              기숙사에 살고 있다면 모바일 사생증을 바로 이용할 수 있어요.
              간식나눔 등 사생 확인이 필요한 행사 등에서 사용돼요.
            </Description>
          </Dialog.Description>

          <ButtonGroup>
            <CapsuleButton
              variant="secondary"
              fullWidth
              onClick={onClose}
            >
              다음에 하기
            </CapsuleButton>
            <CapsuleButton
              variant="primary"
              fullWidth
              onClick={onConfirm}
            >
              사생증 발급하기
            </CapsuleButton>
          </ButtonGroup>
        </Container>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -46%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const Overlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 11000;
  animation: ${fadeIn} 0.2s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Container = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(calc(100% - 40px), 360px);
  background: #ffffff;
  border-radius: 24px;
  padding: 32px 24px 24px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  z-index: 11001;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
  animation: ${slideUp} 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    outline: none;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f2f4f6;
  }

  &:active {
    background-color: #e5e8eb;
  }
`;

const IconCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background-color: #e8f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  line-height: 1.35;
  color: #191f28;
  margin: 0 0 10px;
  letter-spacing: -0.02em;
`;

const Description = styled.p`
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  color: #4e5968;
  margin: 0 0 28px;
  word-break: keep-all;
`;

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
`;
