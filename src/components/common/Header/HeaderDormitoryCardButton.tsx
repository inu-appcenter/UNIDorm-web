import styled from "styled-components";
import { colors } from "@/styles/tokens";

interface HeaderDormitoryCardButtonProps {
  onClick: () => void;
}

export default function HeaderDormitoryCardButton({
  onClick,
}: HeaderDormitoryCardButtonProps) {
  return (
    <FrameButton
      type="button"
      onClick={onClick}
      aria-label="모바일 사생증 열기"
      role="button"
    >
      {/* 좌측 스캐너 브래킷 [ */}
      <CornerSvg
        width="6"
        height="22"
        viewBox="0 0 6 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M 5 1.5 H 3 C 1.8 1.5 1 2.3 1 3.5 V 18.5 C 1 19.7 1.8 20.5 3 20.5 H 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </CornerSvg>

      <LabelText>사생증</LabelText>

      {/* 우측 스캐너 브래킷 ] */}
      <CornerSvg
        width="6"
        height="22"
        viewBox="0 0 6 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M 1 1.5 H 3 C 4.2 1.5 5 2.3 5 3.5 V 18.5 C 5 19.7 4.2 20.5 3 20.5 H 1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </CornerSvg>
    </FrameButton>
  );
}

const FrameButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 2px;
  background: transparent;
  border: none;
  color: ${colors.text.text1 || "#191f28"};
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.15s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    transform: scale(0.92);
    opacity: 0.65;
  }
`;

const CornerSvg = styled.svg`
  flex-shrink: 0;
  display: block;
`;

const LabelText = styled.span`
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.3px;
  padding: 0 3px;
  color: inherit;
  white-space: nowrap;
`;
