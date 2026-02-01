import styled, { css } from "styled-components";
import { useCallback } from "react";

// 위치 및 정렬 타입 정의
export type TooltipPosition = "top" | "bottom";
export type TooltipAlign = "left" | "right" | "center";

interface CommonTooltipProps {
  message: string;
  onClose: () => void;
  position?: TooltipPosition;
  align?: TooltipAlign;
  width?: string;
}

export default function TooltipMessage({
  message,
  onClose,
  position = "bottom",
  align = "right",
  width = "fit-content",
}: CommonTooltipProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

  return (
    <TooltipContainer
      $position={position}
      $align={align}
      $width={width}
      onClick={handleClick}
    >
      <CloseButton onClick={handleClick}>×</CloseButton>
      {message.replace(/\\n/g, "\n")}
      <Arrow $position={position} $align={align} />
    </TooltipContainer>
  );
}

// 배경색 및 불투명도 설정
const TOOLTIP_BG = "rgba(40, 40, 40, 0.9)";

const TooltipContainer = styled.div<{
  $position: TooltipPosition;
  $align: TooltipAlign;
  $width: string;
}>`
  position: absolute;
  z-index: 2000;
  width: ${({ $width }) => $width};
  padding: 10px 22px;
  color: #fff;
  font-size: 12px;
  text-align: center;
  cursor: pointer;

  /* 텍스트 줄바꿈 설정 수정 */
  white-space: pre-line; /* \\n은 줄바꿈으로 인정하고, 내용이 넘치면 자동 줄바꿈 */
  word-break: keep-all; /* 단어 중간에서 끊기지 않도록 설정 (한글에 필수) */
  overflow-wrap: break-word; /* 혹시라도 너무 긴 단어가 있으면 그건 쪼개서 줄바꿈 */
  line-height: 1.5; /* 줄간격을 살짝 띄워 가독성 확보 */

  /* 유리 효과 및 불투명도 강화 */
  background-color: ${TOOLTIP_BG};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 10px;

  /* 테두리 광택 및 깊이감 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);

  /* 수직 위치 */
  ${({ $position }) =>
    $position === "top"
      ? css`
          bottom: calc(100% + 14px);
        `
      : css`
          top: calc(100% + 14px);
        `}

  /* 수평 정렬 */
  ${({ $align }) => {
    switch ($align) {
      case "left":
        return css`
          left: 0;
        `;
      case "right":
        return css`
          right: 0;
        `;
      case "center":
        return css`
          left: 50%;
          transform: translateX(-50%);
        `;
    }
  }}
`;

const Arrow = styled.div<{ $position: TooltipPosition; $align: TooltipAlign }>`
  position: absolute;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;

  /* 화살표 색상 동기화 */
  ${({ $position }) =>
    $position === "top"
      ? css`
          top: 100%;
          border-top: 6px solid ${TOOLTIP_BG};
        `
      : css`
          bottom: 100%;
          border-bottom: 6px solid ${TOOLTIP_BG};
        `}

  /* 화살표 수평 위치 */
  ${({ $align }) => {
    switch ($align) {
      case "left":
        return css`
          left: 14px;
        `;
      case "right":
        return css`
          right: 14px;
        `;
      case "center":
        return css`
          left: 50%;
          transform: translateX(-50%);
        `;
    }
  }}
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;

  &:hover {
    color: #fff;
  }
`;
