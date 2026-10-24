import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes/Router";
import { queryClient } from "./queryClient";
import { installServerDataSync } from "./utils/serverDataSync";
import "./index.css";
import "./init";

// 쓰기 성공·화면 복귀 시 화면 데이터 자동 재조회 (src/utils/serverDataSync.ts)
installServerDataSync(queryClient);

function App() {
  return (
    // RouterProvider 전체를 QueryClientProvider로 래핑
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
