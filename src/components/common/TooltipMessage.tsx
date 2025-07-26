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
      {message}
      <TooltipArrow />
    </Tooltip>
  );
}

const Tooltip = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #000;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 2000;
  width: 120px;
  text-align: center;
  cursor: pointer;
`;

const TooltipArrow = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #000;
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
