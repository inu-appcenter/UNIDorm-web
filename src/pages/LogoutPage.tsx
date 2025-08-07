// src/pages/LogoutPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/useUserStore.ts";
import { TokenInfo } from "../types/members.ts";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { setTokenInfo, setUserInfo } = useUserStore();

  useEffect(() => {
    // 로그아웃 처리
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("roommate_alert_shown");

    const emptyTokenInfo: TokenInfo = {
      accessToken: "",
      refreshToken: "",
    };
    setTokenInfo(emptyTokenInfo);
    const emptyUserInfo = {
      name: "",
      studentNumber: "",
      dormType: "",
      college: "",
      penalty: 0,
      hasTimeTableImage: false,
      roommateCheckList: false,
      id: 0,
      isAdmin: false,
    };
    setUserInfo(emptyUserInfo);
    console.log("로그아웃 성공");
    // alert("로그아웃되었습니다.");
    // 처리 완료 즉시 이동
    navigate("/home");
  }, [navigate, setTokenInfo]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>로그아웃 처리 중입니다...</p>
    </div>
  );
};

export default LogoutPage;
