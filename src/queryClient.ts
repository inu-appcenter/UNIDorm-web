import { QueryClient } from "@tanstack/react-query";

/**
 * 앱 전역 QueryClient (웹뷰 하나당 하나).
 * 컴포넌트 밖(페이지 포커스 재조회 등)에서도 접근할 수 있도록 모듈로 분리합니다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
