import styled from "styled-components";
import { useCallback } from "react";

interface TooltipMessageProps {
  message: string;
  onClose: () => void;
}

export default function TooltipMessage({
  message,
  onClose,
}: TooltipMessageProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // 부모의 클릭 이벤트 전파 방지
      onClose();
    },
    [onClose],
  );

  return (
    <Tooltip onClick={handleClick}>
      <CloseButton onClick={handleClick}>×</CloseButton>
      {message.replace(/\\n/g, "\n")}
      <TooltipArrow />
    </Tooltip>
  );
}

const Tooltip = styled.div`
  position: absolute;

  top: calc(100% + 8px); /* 부모(아이콘)의 100% 아래 + 8px 갭 */
  right: -4px; /* 부모의 좌측에 정렬 */

  background-color: #333;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 2000;
  width: 110px;
  text-align: center;
  cursor: pointer;

  /* \\n을 인식해 줄바꿈을 해주는 CSS 속성 */
  white-space: pre-line;
`;

const TooltipArrow = styled.div`
  position: absolute;

  bottom: 100%; /* 툴팁 본체(Tooltip)의 위에 위치 */
  right: 12px; /* 부모(아이콘)의 중앙(24px의 절반)으로 이동 */
  margin-left: -6px; /* 화살표 너비(12px)의 절반만큼 왼쪽으로 당겨 중앙 정렬 */
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #333; /* 아래를 향하는 화살표 (툴팁이 아래 있으므로) */
`;

const CloseButton = styled.button`
  position: absolute;
  top: 4px;
  right: 6px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: #ccc;
  }
`;
