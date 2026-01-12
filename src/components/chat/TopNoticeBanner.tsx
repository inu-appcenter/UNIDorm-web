import { useState } from "react";
import styled from "styled-components";

export type TopNoticeBannerProps = {
  message?: string;
  visible?: boolean;
  onClose?: () => void;
  actionLabel?: string;
  actionHref?: string;
};

// 상단 배치 및 중앙 정렬 컨테이너
const BannerWrapper = styled.div`
  position: fixed;
  top: 150px;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding: 0 1rem;
  pointer-events: none; // 배경 클릭 간섭 방지
`;

// 글래스모피즘 스타일 본체
const BannerBox = styled.div`
  pointer-events: auto; // 내부 요소 클릭 허용
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: fit-content;
  min-width: 320px;
  padding: 0.75rem 1.25rem;

  // 스타일링: 반투명 배경 및 블러
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  // 테두리 및 그림자
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px; // 필 형태
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.1);
`;

const MessageWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  white-space: pre-line;

  svg {
    flex-shrink: 0;
    color: #f59e0b; // 알림 강조색
  }
`;

const ActionLink = styled.a`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: background 0.2s;

  &:hover {
    background: rgba(37, 99, 235, 0.1);
    text-decoration: underline;
  }
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0.25rem;
  color: #9ca3af;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #4b5563;
  }

  &:focus {
    outline: 2px solid #e5e7eb;
  }
`;

export default function TopNoticeBanner({
  message = "당분간 채팅 푸시 알림이 제공되지 않습니다.\n채팅 페이지를 자주 확인해 주세요!",
  visible = true,
  onClose,
  actionLabel,
  actionHref,
}: TopNoticeBannerProps) {
  const [isVisible, setIsVisible] = useState(visible);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <BannerWrapper role="region" aria-live="polite">
      <BannerBox>
        <MessageWrap>
          {/* 알림 아이콘 */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V9c0-3.07-1.63-5.64-4.5-6.32V2c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 3.36 6 5.92 6 9v7l-2 2v1h16v-1l-2-2z"
              fill="currentColor"
            />
          </svg>
          <span>{message}</span>
        </MessageWrap>

        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {actionHref && actionLabel && (
            <ActionLink href={actionHref}>{actionLabel}</ActionLink>
          )}
          {/* 닫기 버튼 */}
          <CloseButton onClick={handleClose} aria-label="공지 닫기">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CloseButton>
        </div>
      </BannerBox>
    </BannerWrapper>
  );
}
