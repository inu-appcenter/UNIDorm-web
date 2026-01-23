import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 경로 변경 시 스크롤 초기화
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
