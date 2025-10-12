import styled from "styled-components";
import React from "react"; // React.ComponentProps를 사용하기 위해 필요합니다.

// 1. HTML button 요소의 모든 기본 속성(Props) 타입을 가져옵니다.
type ButtonProps = React.ComponentProps<"button">;

// 2. 기존의 SquareButtonProps를 ButtonProps의 모든 속성을 포함하도록 확장합니다.
interface SquareButtonProps extends Omit<ButtonProps, "disabled" | "onClick"> {
  text: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void; // 타입 명시
}

const SquareButton = ({
  text,
  disabled = false,
  onClick,
  type = "button", // type prop을 기본값 'button'으로 추가
  ...rest // 나머지 모든 props (type, name 등)를 rest로 받습니다.
}: SquareButtonProps) => {
  return (
    // 3. rest prop을 그대로 SquareButtonWrapper에 전달합니다.
    <SquareButtonWrapper
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {text}
    </SquareButtonWrapper>
  );
};

export default SquareButton;

const SquareButtonWrapper = styled.button<ButtonProps & { disabled?: boolean }>`
  width: 100%;
  min-height: 60px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  background-color: ${({ disabled }) => (disabled ? "#8E8E93" : "#0A84FF")};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#99999f" : "#006fe0")};
  }
`;
