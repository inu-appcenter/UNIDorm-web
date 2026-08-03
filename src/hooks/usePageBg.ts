import { useEffect } from "react";

/**
 * 페이지별로 루트 레이아웃의 배경색을 지정하는 훅입니다.
 * 페이지가 마운트될 때 지정한 배경색을 적용하고, 이탈 시 기본값(var(--Bg-Bg2, #F7F7F7))으로 복원합니다.
 * @param bgColor 적용할 배경색 (예: "var(--Bg-Bg1, #FFF)", colors.bg.bg1)
 */
export const usePageBg = (bgColor?: string) => {
  useEffect(() => {
    if (!bgColor) return;
    document.documentElement.style.setProperty("--page-bg", bgColor);

    return () => {
      document.documentElement.style.removeProperty("--page-bg");
    };
  }, [bgColor]);
};

export default usePageBg;
