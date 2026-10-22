import React from "react";
import styled, { css } from "styled-components";

export type DormitoryTypeKind = "1기숙사" | "2기숙사" | "3기숙사" | "other";

export interface DormitoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 기숙사 명칭 (예: "1기숙사", "제2기숙사 A동", "제3기숙사(BTL)" 등) */
  dormType?: string;
  /** 뱃지 스타일 변형: "outline" (테두리형) | "subtle" (소프트 배경형) */
  variant?: "outline" | "subtle";
  /** 크기: "sm" (12px, 룸메이트 카드 등) | "md" (13px, 사생증 등) */
  size?: "sm" | "md";
  children?: React.ReactNode;
}

/**
 * 기숙사 문자열을 1기숙사 / 2기숙사 / 3기숙사 분류로 정규화
 */
export function parseDormitoryKind(rawType?: string): DormitoryTypeKind {
  if (!rawType) return "other";
  const str = rawType.replace(/\s/g, "");
  if (str.includes("1기숙사") || str.includes("제1")) return "1기숙사";
  if (
    str.includes("2기숙사") ||
    str.includes("제2") ||
    str.includes("A동") ||
    str.includes("B동") ||
    str.includes("02") ||
    str.includes("03")
  ) {
    return "2기숙사";
  }
  if (
    str.includes("3기숙사") ||
    str.includes("제3") ||
    str.includes("04") ||
    str.includes("05")
  ) {
    return "3기숙사";
  }
  return "other";
}

export const DormitoryBadge: React.FC<DormitoryBadgeProps> = ({
  dormType = "",
  variant = "outline",
  size = "sm",
  children,
  className,
  ...rest
}) => {
  const kind = parseDormitoryKind(dormType);
  const displayText = children ?? (dormType || "-");

  return (
    <StyledBadge
      $kind={kind}
      $variant={variant}
      $size={size}
      className={className}
      {...rest}
    >
      {displayText}
    </StyledBadge>
  );
};

export default DormitoryBadge;

// ==================== Styled Components ====================

interface BadgeStyleProps {
  $kind: DormitoryTypeKind;
  $variant: "outline" | "subtle";
  $size: "sm" | "md";
}

const getThemeStyles = ($kind: DormitoryTypeKind, $variant: "outline" | "subtle") => {
  if ($variant === "subtle") {
    switch ($kind) {
      case "1기숙사":
        return css`
          background-color: #f2f4f6;
          border: 1px solid #e5e8eb;
          color: #4e5968;
        `;
      case "2기숙사":
        return css`
          background-color: var(--blue-50, #e8f3ff);
          border: 1px solid #bae0ff;
          color: var(--Main-Main2, #0958d9);
        `;
      case "3기숙사":
        return css`
          background-color: #fff1f0;
          border: 1px solid #ffa39e;
          color: #cf1322;
        `;
      default:
        return css`
          background-color: var(--blue-50, #e8f3ff);
          border: 1px solid #bae0ff;
          color: var(--Main-Main2, #0958d9);
        `;
    }
  }

  // default: "outline"
  switch ($kind) {
    case "1기숙사":
      return css`
        background-color: #ffffff;
        border: 1px solid #8e8e93;
        color: #6f6f6f;
      `;
    case "2기숙사":
      return css`
        background-color: #ffffff;
        border: 1px solid var(--Main-Main1, #1677ff);
        color: var(--Main-Main2, #0958d9);
      `;
    case "3기숙사":
      return css`
        background-color: #ffffff;
        border: 1px solid #ff6b6b;
        color: #e03131;
      `;
    default:
      return css`
        background-color: #ffffff;
        border: 1px solid var(--Main-Main1, #1677ff);
        color: var(--Main-Main2, #0958d9);
      `;
  }
};

const StyledBadge = styled.span<BadgeStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  user-select: none;
  box-sizing: border-box;

  ${({ $size }) =>
    $size === "md"
      ? css`
          font-size: 13px;
          line-height: 1.35;
          padding: 4px 10px;
          border-radius: 12px;
        `
      : css`
          font-size: 12px;
          line-height: 1.5;
          padding: 3px 8px;
          border-radius: 12px;
        `}

  ${({ $kind, $variant }) => getThemeStyles($kind, $variant)}
`;
