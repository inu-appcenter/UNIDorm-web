import { useEffect } from "react";
import styled from "styled-components";
import { X } from "lucide-react";

interface Props {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageViewerModal({ imageUrl, onClose }: Props) {
  useEffect(() => {
    if (!imageUrl) return;

    // 히스토리에 현재 모달 상태 push (뒤로가기 키 대응)
    window.history.pushState({ imageViewerOpen: true }, "");

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // 모달이 수동 닫힘(X 버튼이나 배경 클릭)으로 해제될 때 추가했던 히스토리 back 처리
      if (window.history.state?.imageViewerOpen) {
        window.history.back();
      }
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <Overlay onClick={onClose}>
      <CloseButton onClick={onClose} aria-label="닫기">
        <X size={24} color="#ffffff" />
      </CloseButton>
      <ImageContainer onClick={(e) => e.stopPropagation()}>
        <FullImage src={imageUrl} alt="확대 이미지" />
      </ImageContainer>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30000;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 30001;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ImageContainer = styled.div`
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
`;

const FullImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
`;
