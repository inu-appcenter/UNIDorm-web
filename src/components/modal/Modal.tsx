import RoundSquareWhiteButton from "../button/RoundSquareWhiteButton.tsx";
import RoundSquareButton from "../button/RoundSquareButton.tsx";
import styled, { keyframes, css } from "styled-components";
import Friends from "../../assets/roommate/Friends.svg";
import 눈물닦아주는횃불이 from "../../assets/눈물 닦아주는 횃불이.webp";
import React, { useEffect, useState } from "react";

const headerImages: Record<number, string> = {
  1: Friends,
  2: 눈물닦아주는횃불이,
};

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  showHideOption?: boolean;
  headerImageId?: number | null;
  closeButtonText?: string;
  onCloseClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
}

const Modal = ({
  show,
  onClose,
  title,
  subtitle,
  content,
  showHideOption = false,
  headerImageId = null,
  closeButtonText = "닫기",
  onCloseClick,
  secondaryButtonText,
  onSecondaryButtonClick,
}: ModalProps) => {
  // 모달이 실제로 DOM에 존재하는지 여부 (애니메이션 시간 동안 유지)
  const [visible, setVisible] = useState(show);
  // 닫히는 애니메이션 실행 중인지 여부
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (show) {
      setVisible(true);
      setIsClosing(false);
    } else {
      // 닫힐 때 바로 없애지 않고 애니메이션 재생 후 언마운트
      if (visible) {
        setIsClosing(true);
        timer = setTimeout(() => {
          setVisible(false);
          setIsClosing(false);
        }, 300); // 애니메이션 지속 시간 (0.3s)과 일치해야 함
      }
    }

    return () => clearTimeout(timer);
  }, [show, visible]);

  if (!visible) return null;

  const headerImage = headerImageId ? headerImages[headerImageId] : null;

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isTwoButtonMode = showHideOption || !!secondaryButtonText;

  return (
    <ModalBackGround onClick={handleBackgroundClick} isClosing={isClosing}>
      <ModalWrapper isClosing={isClosing}>
        <CloseButton onClick={onClose} aria-label="닫기">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="#B3B3B3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="#B3B3B3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CloseButton>

        <ModalContentWrapper>
          <ModalHeader>
            {headerImage && <img src={headerImage} alt="modal header" />}
            <h2>{title}</h2>
            {subtitle && <span>{subtitle}</span>}
          </ModalHeader>
          <ModalScrollArea>{content}</ModalScrollArea>
        </ModalContentWrapper>

        <ButtonGroupWrapper isRow={isTwoButtonMode}>
          {showHideOption && (
            <RoundSquareWhiteButton
              btnName={"다시 보지 않기"}
              onClick={() => {
                localStorage.setItem("hideInfoModal", "true");
                onClose();
              }}
            />
          )}

          {!showHideOption && secondaryButtonText && (
            <RoundSquareWhiteButton
              btnName={secondaryButtonText}
              onClick={() => {
                if (onSecondaryButtonClick) onSecondaryButtonClick();
              }}
            />
          )}

          <RoundSquareButton
            btnName={closeButtonText}
            onClick={() => {
              if (onCloseClick) {
                onCloseClick();
              }
              onClose();
            }}
          />
        </ButtonGroupWrapper>
      </ModalWrapper>
    </ModalBackGround>
  );
};

export default Modal;

// Keyframes 정의
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
`;

const ModalBackGround = styled.div<{ isClosing: boolean }>`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;

  /* 배경 페이드 인/아웃 */
  animation: ${({ isClosing }) =>
    isClosing
      ? css`
          ${fadeOut} 0.3s ease-in forwards
        `
      : css`
          ${fadeIn} 0.3s ease-out forwards
        `};
`;

const ModalWrapper = styled.div<{ isClosing: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  padding: 32px 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  max-height: 80%;
  background: white;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;

  /* 모달 컨텐츠 슬라이드 인/아웃 */
  animation: ${({ isClosing }) =>
    isClosing
      ? css`
          ${slideDown} 0.3s ease-in forwards
        `
      : css`
          ${slideUp} 0.3s ease-out forwards
        `};
`;

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  flex-shrink: 0;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  word-break: keep-all;
  white-space: pre-wrap;
  color: #1c408c;
  width: 100%;

  img {
    width: 50%;
    margin-bottom: 12px;
  }

  h2 {
    margin: 0;
    font-size: 24px;
  }

  span {
    font-size: 14px;
  }
`;

const ModalScrollArea = styled.div`
  flex: 1;
  overflow-y: scroll;
  padding-right: 8px;
  color: #6c6c74;
  font-size: 14px;
  word-break: break-word;
  white-space: pre-wrap;
  text-align: center;

  &::-webkit-scrollbar {
    display: block;
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
`;

const ButtonGroupWrapper = styled.div<{ isRow: boolean }>`
  display: flex;
  gap: 10px;
  flex-direction: ${({ isRow }) => (isRow ? "row" : "column")};

  button {
    flex: ${({ isRow }) => (isRow ? "1" : "none")};
    width: ${({ isRow }) => (isRow ? "auto" : "100%")};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  &:hover path {
    stroke: #1c1c1e;
  }
`;
