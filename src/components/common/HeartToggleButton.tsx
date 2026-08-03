import type { ButtonHTMLAttributes } from "react";
import styled from "styled-components";
import heartDefault from "@/assets/roommate/heart-default.svg";
import heartLiked from "@/assets/roommate/heart-liked.svg";
import { colors } from "@/styles/tokens";

interface HeartToggleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  liked: boolean;
}

export default function HeartToggleButton({
  liked,
  type = "button",
  ...props
}: HeartToggleButtonProps) {
  return (
    <HeartButton
      {...props}
      type={type}
      aria-pressed={liked}
      $liked={liked}
    >
      <img src={liked ? heartLiked : heartDefault} alt="" aria-hidden />
    </HeartButton>
  );
}

const HeartButton = styled.button<{ $liked: boolean }>`
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1.143px solid ${colors.gray.gray200};
  border-radius: 32px;
  box-sizing: border-box;
  background: ${colors.gray.gray0};
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  cursor: pointer;

  img {
    width: ${({ $liked }) => ($liked ? "13.333px" : "14.476px")};
    height: ${({ $liked }) => ($liked ? "11.867px" : "13.01px")};
    display: block;
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;
