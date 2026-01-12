import { Outlet } from "react-router-dom";
import { useAppInit } from "@/hooks/useAppInit";
import { ErrorBoundary } from "@/ErrorBoundary";

const AppInitializer = () => {
  useAppInit(); // 초기화 로직 실행

  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
};

export default AppInitializer;
