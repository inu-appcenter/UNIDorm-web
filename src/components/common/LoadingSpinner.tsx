import styled, { keyframes } from "styled-components";

// 스피너 회전 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px;
  gap: 16px;
  text-align: center;
  color: #888;
  font-size: 14px;
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
}

/**
 * 데이터 로딩 시 표시할 스피너 컴포넌트
 */
export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <SpinnerWrapper>
      <Spinner />
      {message && <p>{message}</p>}
    </SpinnerWrapper>
  );
}
