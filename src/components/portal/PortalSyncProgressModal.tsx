import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Loader2, AlertTriangle, ShieldCheck } from "lucide-react";

export interface PortalSyncProgressModalProps {
  isOpen: boolean;
  title?: string;
  currentMessage?: string;
}

const DEFAULT_STEPS = [
  "학교 포털 시스템에 안전하게 연결하고 있어요...",
  "기숙사 사생 배정 및 호실 정보를 확인하고 있어요...",
  "학적 정보와 학생증 사진을 동기화하고 있어요...",
  "사생증 정보를 안전하게 기기에 저장하고 있어요...",
];

export default function PortalSyncProgressModal({
  isOpen,
  title = "사생 정보를 불러오고 있어요",
  currentMessage,
}: PortalSyncProgressModalProps) {
  const [stepIndex, setStepIndex] = useState(0);

  // 메시지 자동 순환 (약 2.5초 간격으로 진행 상황을 사용자에게 단계별로 안내)
  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % DEFAULT_STEPS.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const displayMessage = currentMessage || DEFAULT_STEPS[stepIndex];

  return (
    <Overlay role="dialog" aria-modal="true" aria-labelledby="sync-modal-title">
      <ModalCard>
        <SpinnerWrapper>
          <Loader2 size={38} color="var(--interactive-primary, #3182F6)" />
        </SpinnerWrapper>

        <Title id="sync-modal-title">{title}</Title>
        <StepMessage>{displayMessage}</StepMessage>

        <WarningBanner>
          <AlertTriangle size={16} color="#D97706" strokeWidth={2.2} />
          <span>완료될 때까지 <strong>화면을 벗어나거나 앱을 닫지 마세요</strong></span>
        </WarningBanner>

        <SecurityFooter>
          <ShieldCheck size={14} color="#8B95A1" />
          <span>인천대학교 포털과 안전한 종단간 통신 중</span>
        </SecurityFooter>
      </ModalCard>
    </Overlay>
  );
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleUp = keyframes`
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  animation: ${fadeIn} 0.2s ease-out forwards;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 340px;
  background: var(--surface-primary, #ffffff);
  border-radius: 24px;
  padding: 32px 24px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
  animation: ${scaleUp} 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const SpinnerWrapper = styled.div`
  margin-bottom: 18px;

  svg {
    animation: ${spin} 1s linear infinite;
  }
`;

const Title = styled.h3`
  font-size: 19px;
  font-weight: 700;
  color: var(--content-primary, #191f28);
  margin: 0 0 8px;
  line-height: 1.35;
  letter-spacing: -0.3px;
`;

const StepMessage = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: var(--content-secondary, #4e5968);
  margin: 0 0 20px;
  line-height: 1.5;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: keep-all;
`;

const WarningBanner = styled.div`
  width: 100%;
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 14px;
  padding: 10px 14px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  margin-bottom: 16px;

  svg {
    flex-shrink: 0;
  }

  span {
    font-size: 12px;
    line-height: 1.4;
    color: #b45309;
    letter-spacing: -0.2px;

    strong {
      color: #92400e;
      font-weight: 700;
    }
  }
`;

const SecurityFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  color: var(--content-tertiary, #8b95a1);
  letter-spacing: -0.2px;
`;
