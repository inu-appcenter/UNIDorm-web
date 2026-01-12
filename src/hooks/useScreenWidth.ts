// hooks/useScreenWidth.ts (새 파일)
import { useEffect, useState } from "react";

const useScreenWidth = () => {
  // 초기값은 마운트 시에만 설정되도록 함수형으로 전달
  const [width, setWidth] = useState(() => {
    // SSR 환경을 고려하여 window 객체는 마운트 이후에만 접근
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return 0; // 초기값
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
};

export default useScreenWidth;
