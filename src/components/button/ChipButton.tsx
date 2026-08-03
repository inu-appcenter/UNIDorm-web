import React from "react";
import styled from "styled-components";
import { colors, typography } from "@/styles/tokens";

interface ChipButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

const StyledChipButton = styled.button<{ $active: boolean }>`
  ${typography.label1Normal}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 4px 14px;
  border-radius: 23px;
  border: ${({ $active }) =>
    $active ? "none" : `1px solid ${colors.gray.gray200}`};
  background: ${({ $active }) => ($active ? colors.main.main1 : colors.bg.bg1)};
  color: ${({ $active }) => ($active ? colors.bg.bg1 : colors.gray.gray500)};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:hover {
    opacity: 0.9;
  }
`;

export default function ChipButton({
  active = false,
  children,
  ...props
}: ChipButtonProps) {
  return (
    <StyledChipButton type="button" $active={active} {...props}>
      {children}
    </StyledChipButton>
  );
}
