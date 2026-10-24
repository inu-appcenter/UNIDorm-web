import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes/Router";
import { queryClient } from "./queryClient";
import { installPageFocusRefresh } from "./utils/pageFocus";
import "./index.css";
import "./init";

// 서브 웹뷰가 닫혀 이 웹뷰로 돌아오면 화면 데이터를 다시 조회
installPageFocusRefresh(queryClient);

function App() {
  return (
    // RouterProvider 전체를 QueryClientProvider로 래핑
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
