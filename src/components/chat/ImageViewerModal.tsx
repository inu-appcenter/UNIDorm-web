import styled from "styled-components";
import { X } from "lucide-react";

interface Props {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageViewerModal({ imageUrl, onClose }: Props) {
  if (!imageUrl) return null;

  return (
    <Overlay onClick={onClose}>
      <CloseButton
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="닫기"
      >
        <X size={22} color="#ffffff" />
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
  background-color: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: pan-y;
`;

const CloseButton = styled.button`
  position: absolute;
  top: max(16px, calc(env(safe-area-inset-top, 0px) + 12px));
  right: max(16px, calc(env(safe-area-inset-right, 0px) + 12px));
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 30002;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  transition:
    background-color 0.2s,
    transform 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.85);
  }

  &:active {
    transform: scale(0.92);
  }
`;

const ImageContainer = styled.div`
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(env(safe-area-inset-top, 0px) + 56px) 16px
    calc(env(safe-area-inset-bottom, 0px) + 24px);
  box-sizing: border-box;
`;

const FullImage = styled.img`
  max-width: 100%;
  max-height: calc(88vh - env(safe-area-inset-top, 0px));
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;
