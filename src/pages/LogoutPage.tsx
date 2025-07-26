// src/pages/LogoutPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/useUserStore.ts"; // react-router-dom 사용 시
import { TokenInfo } from "../types/members.ts";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { setTokenInfo } = useUserStore(); // store에서 setTokenInfo 불러오기

  useEffect(() => {
    // 0.5초 딜레이 후 로그아웃 처리
    const timeout = setTimeout(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      const emptyTokenInfo: TokenInfo = {
        accessToken: "",
        refreshToken: "",
      };
      setTokenInfo(emptyTokenInfo);
      navigate("/home");
    }, 500);

    return () => clearTimeout(timeout);
  }, [navigate, setTokenInfo]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>로그아웃 처리 중입니다...</p>
    </div>
  );
};

export default LogoutPage;
