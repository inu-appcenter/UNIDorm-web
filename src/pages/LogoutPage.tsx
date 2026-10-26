// src/pages/LogoutPage.tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/useUserStore.ts";
import { TokenInfo } from "@/types/members";
import { mixpanelTrack } from "@/utils/mixpanel";
import { unlinkFcmToken } from "@/apis/fcm";
import { deletePortalAccount, isMobileAppEnvironment } from "@/apis/mobileAgentBridge";
import { secureStorage } from "@/utils/secureStorage";
import { safeLocalStorage } from "@/utils/safeStorage";

const LogoutPage = () => {
  const navigate = useNavigate();
  const { setTokenInfo, setUserInfo } = useUserStore();
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const performLogout = async () => {
      // 1. 서버에 FCM 토큰 연결 해제 요청 (인증 토큰이 남아있을 때 먼저 호출)
      const currentAccessToken =
        safeLocalStorage.getItem("accessToken") ||
        (typeof window !== "undefined"
          ? window.localStorage?.getItem("accessToken")
          : null);
      if (currentAccessToken) {
        try {
          await unlinkFcmToken();
        } catch (error) {
          console.warn("FCM 토큰 연결 해제 실패 (세션 만료 등):", error);
        }
      }

      // 2. 모바일 앱 환경인 경우 OS KeyStore/SecureStore에 저장된 포털 계정(학번/비밀번호) 연동 해제
      if (isMobileAppEnvironment()) {
        try {
          await deletePortalAccount();
        } catch (e) {
          console.error("[Logout] 포털 계정 연동 해제 실패:", e);
        }
      }

      // 3. 포털 사생정보, 학적정보, 연동 학번 등 온디바이스 암호화 캐시 및 로컬스토리지 일괄 소거
      secureStorage.clearAllPortalCaches();

      // 4. 일반 인증 토큰 및 유저 정보 로컬스토리지 삭제
      const authKeys = [
        "accessToken",
        "refreshToken",
        "role",
        "userInfo",
        "portal_student_id",
      ];
      authKeys.forEach((key) => {
        safeLocalStorage.removeItem(key);
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.removeItem(key);
          }
        } catch {
          // 로컬스토리지 접근 제한 환경 예외 무시
        }
      });

      // 5. Zustand 스토어 초기화 (동시에 브로드캐스트 미들웨어 및 네이티브 브릿지로 빈 토큰 전파)
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

      console.log("로그아웃 성공: 모든 계정 및 캐시가 초기화되었습니다.");
      alert("로그아웃되었습니다.");

      // 6. 홈으로 이동
      navigate("/home", { replace: true });
    };

    void performLogout();
  }, [navigate, setTokenInfo, setUserInfo]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>로그아웃 처리 중입니다...</p>
    </div>
  );
};

export default LogoutPage;
