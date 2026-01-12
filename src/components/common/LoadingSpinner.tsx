import styled, { css, keyframes } from "styled-components";

// 스피너 회전 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div<{ overlay?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px;
  gap: 16px;
  text-align: center;
  color: #888;
  font-size: 14px;

  ${({ overlay }) =>
    overlay &&
    css`
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(255, 255, 255, 0.7);
      z-index: 9999;
      padding: 0;
    `}
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007bff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

interface LoadingSpinnerProps {
  /** 스피너 아래에 표시될 메시지 (선택 사항) */
  message?: string;
  /** 화면 중앙 오버레이 모드 여부 */
  overlay?: boolean;
}

/**
 * 데이터 로딩 시 표시할 스피너 컴포넌트
 */
export default function LoadingSpinner({
  message,
  overlay = false,
}: LoadingSpinnerProps) {
  return (
    <SpinnerWrapper overlay={overlay}>
      <Spinner />
      {message && <p>{message}</p>}
    </SpinnerWrapper>
  );
}
