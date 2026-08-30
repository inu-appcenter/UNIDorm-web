// src/pages/LogoutPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/useUserStore.ts";
import { TokenInfo } from "@/types/members";
import { mixpanelTrack } from "@/utils/mixpanel";
import { unlinkFcmToken } from "@/apis/fcm";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { setTokenInfo, setUserInfo } = useUserStore();

  useEffect(() => {
    const handleLogout = async () => {
      // 1. 서버에 FCM 토큰 연결 해제 요청 (인증 토큰이 남아있을 때 먼저 호출)
      try {
        await unlinkFcmToken();
      } catch (error) {
        console.warn("FCM 토큰 연결 해제 실패 (세션 만료 등):", error);
      } finally {
        // 2. 로컬 스토리지 정리
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userInfo");

        const emptyTokenInfo: TokenInfo = {
          accessToken: "",
          refreshToken: "",
          role: "",
        };
        setTokenInfo(emptyTokenInfo);
        const emptyUserInfo = {
          id: 0,
          name: "",
          studentNumber: "",
          dormType: "",
          college: "",
          reportedCount: 0,
          hasTimeTableImage: false,
          hasUnreadNotifications: false,
          termsAgreed: false,
          privacyAgreed: false,
          roommateCheckList: false,
        };
        setUserInfo(emptyUserInfo);
        mixpanelTrack.logout();

        console.log("로그아웃 성공");
        alert("로그아웃되었습니다.");
        // 처리 완료 즉시 이동
        navigate("/home", { replace: true });
      }
    };

    void handleLogout();
  }, [navigate, setTokenInfo, setUserInfo]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>로그아웃 처리 중입니다...</p>
    </div>
  );
};

export default LogoutPage;
