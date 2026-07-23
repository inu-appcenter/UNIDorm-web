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

    // 모달 오픈 시 히스토리에 가짜 스택 push
    window.history.pushState({ imageViewer: true }, "");

    const handlePopState = (e: PopStateEvent) => {
      // 뒤로가기 누르면 닫기
      onClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [imageUrl, onClose]);

  const handleClose = () => {
    // 수동 닫기 시 push했던 history 되돌리기 (뒤로가기를 한 번 실행하면 popstate가 발생하여 handlePopState -> onClose 호출됨)
    if (window.history.state?.imageViewer) {
      window.history.back();
    } else {
      onClose();
    }
  };

  if (!imageUrl) return null;

  return (
    <Overlay onClick={handleClose}>
      <CloseButton onClick={handleClose} aria-label="닫기">
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
