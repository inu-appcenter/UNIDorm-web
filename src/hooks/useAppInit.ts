import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/useUserStore";
import { getMemberInfo } from "@/apis/members";
import tokenInstance from "../apis/tokenInstance";
// import { getMobilePlatform } from "@/utils/getMobilePlatform";
import { PATHS } from "@/constants/paths";

export const useAppInit = () => {
  const { tokenInfo, setUserInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const navigate = useNavigate();
  const [fcmToken, setFcmToken] = useState("");
  // const platform = getMobilePlatform();

  // 프로덕션 로그 제거
  useEffect(() => {
    if (import.meta.env.MODE === "production") {
      console.log =
        console.debug =
        console.info =
        console.warn =
        console.error =
          () => {};
    }
  }, []);

  // 유저 초기화 및 온보딩 체크
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const memberResponse = await getMemberInfo();
        setUserInfo(memberResponse.data);

        // 첫 방문 유도
        if (tokenInfo.accessToken && memberResponse.data.name === "") {
          alert("처음 로그인하셨네요! 먼저 회원 정보를 입력해주세요.");
          navigate(`${PATHS.MYINFO_EDIT}?firstvisit=true`, { replace: true });
          return;
        }
        // 약관 동의 체크
        if (
          !memberResponse.data.termsAgreed ||
          !memberResponse.data.privacyAgreed
        ) {
          navigate(PATHS.AGREEMENT, { replace: true });
        }
      } catch (error) {
        // 회원 정보 로드 실패
      }
    };

    if (tokenInfo?.accessToken) initializeUser();
  }, [tokenInfo.accessToken, setUserInfo, navigate]);

  // 온보딩 방문 이력 체크
  useEffect(() => {
    localStorage.removeItem("isFirstVisit");
    const firstVisit = localStorage.getItem("isFirstVisit(10.20)");
    if (firstVisit === null) navigate(PATHS.ONBOARDING);
  }, [navigate]);

  // 웹뷰 FCM 토큰 수신 설정
  useEffect(() => {
    (window as any).onReceiveFcmToken = async function (token: string) {
      // 토큰이 존재하고 빈 문자열이 아닌 경우에만 처리
      if (token && token.trim() !== "") {
        localStorage.setItem("fcmToken", token);
        setFcmToken(token);
      }
    };
    return () => {
      (window as any).onReceiveFcmToken = null;
    };
  }, []);

  // FCM 토큰 서버 등록 (로컬 스토리지 기반 무조건 전송)
  useEffect(() => {
    const registerFcmToken = async () => {
      // 로컬 스토리지에서 토큰 조회
      const storedToken = localStorage.getItem("fcmToken");

      // 토큰이 존재하고 로그인된 상태라면 플랫폼 구분 없이 전송
      if (storedToken && isLoggedIn) {
        try {
          await tokenInstance.post("/fcm/token", { fcmToken: storedToken });
        } catch (error) {
          // FCM 등록 실패
        }
      }
    };

    registerFcmToken();
    // fcmToken 상태 변경 혹은 로그인 성공 시 즉시 실행
  }, [fcmToken, isLoggedIn, tokenInfo]);

  return { isLoggedIn };
};
