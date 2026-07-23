import styled, { css } from "styled-components";
import React from "react";

type ButtonProps = React.ComponentProps<"button">;

interface SquareButtonProps extends Omit<ButtonProps, "disabled" | "onClick"> {
  text: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // 버튼 스타일을 결정하는 variant (기본값: primary)
  variant?: "primary" | "secondary";
}

const SquareButton = ({
  text,
  disabled = false,
  onClick,
  type = "button",
  variant = "primary",
  ...rest
}: SquareButtonProps) => {
  return (
    <SquareButtonWrapper
      disabled={disabled}
      onClick={onClick}
      type={type}
      $variant={variant}
      {...rest}
    >
      {text}
    </SquareButtonWrapper>
  );
};

export default SquareButton;

const SquareButtonWrapper = styled.button<
  ButtonProps & { disabled?: boolean; $variant: "primary" | "secondary" }
>`
  width: 100%;
  min-height: 56px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;

  /* Variant에 따른 스타일 분기 */
  ${({ $variant, disabled }) =>
    $variant === "primary"
      ? css`
          /* 메인: 파란색 (#0A84FF) */
          background-color: ${disabled ? "#8E8E93" : "#0A84FF"};
          color: white;
          &:hover {
            background-color: ${disabled ? "#8E8E93" : "#006fe0"};
          }
        `
      : css`
          /* 보조: 연회색 */
          background-color: ${disabled ? "#f0f0f0" : "#f5f5f5"};
          color: #666666;
          &:hover {
            background-color: ${disabled ? "#f0f0f0" : "#e0e0e0"};
          }
        `}
`;
