import styled from "styled-components";
import { PageBgType } from "@/types/layout";

// 전체 페이지 래퍼
export const PageWrapper = styled.div<{ $bgType?: PageBgType }>`
  width: 100%;
  min-height: 100vh;
  --layout-bg: ${({ $bgType }) =>
    $bgType === "white"
      ? "var(--color-bg-bg1, var(--Bg-Bg1, #ffffff))"
      : "var(--color-bg-bg2, var(--Bg-Bg2, #f9fafb))"};
  background: var(--page-bg, var(--layout-bg));

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

// 콘텐츠 영역
export const ContentContainer = styled.main<{
  $hasHeader?: boolean;
  $hasBottomBar?: boolean;
}>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: ${({ $hasHeader }) =>
    $hasHeader ? "calc(70px + var(--safe-area-top, 0px))" : "0"};
  padding-bottom: ${({ $hasBottomBar }) =>
    $hasBottomBar ? "calc(90px + var(--safe-area-bottom, 0px))" : "0"};
  box-sizing: border-box;

  /* 데스크탑 패딩: 헤더/바텀바 폭과 일치 */
  @media (min-width: 1024px) {
    padding-left: 10vw;
    padding-right: 10vw;
  }
`;
