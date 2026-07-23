import styled, { css } from "styled-components";
import React from "react";
import { colors, typography } from "@/styles/tokens";

type ButtonProps = React.ComponentProps<"button">;
type SquareButtonVariant =
  | "primary"
  | "primaryDark"
  | "secondary"
  | "destructive";

interface SquareButtonProps extends Omit<ButtonProps, "disabled" | "onClick"> {
  text: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: SquareButtonVariant;
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
  ButtonProps & { disabled?: boolean; $variant: SquareButtonVariant }
>`
  width: 100%;
  height: 48px;
  min-width: 0;
  padding: 12px 16px;
  border: 0;
  border-radius: 8px;
  box-sizing: border-box;
  ${typography.body1Normal}
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  ${({ $variant, disabled }) =>
    disabled || $variant === "secondary"
      ? css`
          background-color: ${colors.gray.gray50};
          color: ${colors.text.text3};

          &:hover:not(:disabled) {
            background-color: ${colors.gray.gray100};
          }
        `
      : $variant === "destructive"
        ? css`
            background-color: ${colors.gray.gray50};
            color: ${colors.status.destructive};

            &:hover:not(:disabled) {
              background-color: ${colors.gray.gray100};
            }
          `
        : $variant === "primaryDark"
          ? css`
              background-color: ${colors.main.main2};
              color: ${colors.gray.gray0};

              &:hover:not(:disabled) {
                background-color: ${colors.blue.blue800};
              }
            `
          : css`
              background-color: ${colors.main.main1};
              color: ${colors.gray.gray0};

              &:hover:not(:disabled) {
                background-color: ${colors.main.main2};
              }
            `}
`;
