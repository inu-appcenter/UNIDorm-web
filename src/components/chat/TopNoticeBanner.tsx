import { useState } from "react";
import styled from "styled-components";

export type TopNoticeBannerProps = {
  message?: string;
  visible?: boolean;
  onClose?: () => void;
  actionLabel?: string;
  actionHref?: string;
};

const BannerWrapper = styled.div`
  //position: fixed;
  //inset: 0 auto auto 0;
  //top: 0;
  //z-index: 50;
  display: flex;
  justify-content: center;
`;

const BannerContainer = styled.div`
  max-width: 1280px;
  width: 100%;
  padding: 0 1rem;
`;

const BannerBox = styled.div`
  border-radius: 0 0 1rem 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: linear-gradient(to right, #fef08a, #fef9c3, #ffffff);
  border: 1px solid #fde68a;
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
`;

const MessageWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #713f12;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-line;
`;

const ActionLink = styled.a`
  font-size: 0.875rem;
  text-decoration: underline;
  text-underline-offset: 2px;
  color: #854d0e;
  &:hover {
    color: #713f12;
  }
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  padding: 0.25rem;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #facc15;
  }
`;

export default function TopNoticeBanner({
  message = "당분간 채팅 푸시 알림이 제공되지 않습니다. 채팅 페이지를 자주 확인해 주세요!\n불편을 드려 죄송합니다.",
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
    <BannerWrapper role="region" aria-live="polite" aria-atomic="true">
      <BannerContainer>
        <BannerBox>
          <BannerContent>
            <MessageWrap>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 2a7 7 0 017 7v3.586l1.707 1.707A1 1 0 0119.293 16H4.707a1 1 0 01-.707-1.707L5.707 12.586V9a7 7 0 017-7z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 01-3.46 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{message}</span>
            </MessageWrap>

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {actionHref && actionLabel && (
                <ActionLink href={actionHref}>{actionLabel}</ActionLink>
              )}
              <CloseButton onClick={handleClose} aria-label="공지 닫기">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </CloseButton>
            </div>
          </BannerContent>
        </BannerBox>
      </BannerContainer>
    </BannerWrapper>
  );
}
