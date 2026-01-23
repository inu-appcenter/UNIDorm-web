import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // 추가
import { router } from "./routes/Router";
import "./index.css";
import "./init";

// 1. QueryClient 인스턴스 생성 (컴포넌트 외부)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 필요에 따라 기본 옵션 설정 (예: 재시도 횟수, staleTime 등)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    // 2. RouterProvider 전체를 QueryClientProvider로 래핑
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
