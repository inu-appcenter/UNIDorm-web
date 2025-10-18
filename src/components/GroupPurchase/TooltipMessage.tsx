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

  bottom: calc(100% + 8px);
  right: 0;
  //margin: 0 auto;

  background-color: #333;
  color: #fff;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 2000;
  width: fit-content;
  text-align: center;
  cursor: pointer;

  /* \\n을 인식해 줄바꿈을 해주는 CSS 속성 */
  white-space: pre-line;
`;

const TooltipArrow = styled.div`
  position: absolute;
  top: 100%;
  right: 10px;
  margin-left: -6px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #333;
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
