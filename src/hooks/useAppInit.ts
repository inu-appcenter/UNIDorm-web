import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/useUserStore";
import { getMemberInfo } from "@/apis/members";
import tokenInstance from "../apis/tokenInstance";
// import { getMobilePlatform } from "@/utils/getMobilePlatform";
import { PATHS } from "@/constants/paths";
import { getRoommateChatRooms, getGroupOrderChatRooms } from "@/apis/chat";
import { getOpenChatRooms } from "@/apis/openchat";

export const useAppInit = () => {
  const { tokenInfo, setUserInfo, setLoading } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const navigate = useNavigate();
  const [fcmToken, setFcmToken] = useState("");
  // const platform = getMobilePlatform();

  // 프로덕션 로그 제거
  useEffect(() => {
    if (import.meta.env.VITE_API_SUBDOMAIN === "unidorm-server") {
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
        setLoading(false);
      }
    };

    if (tokenInfo?.accessToken) initializeUser();
    else setLoading(false);
  }, [tokenInfo.accessToken, setUserInfo, setLoading, navigate]);

  // 온보딩 방문 이력 체크
  useEffect(() => {
    localStorage.removeItem("isFirstVisit");
    const firstVisit = localStorage.getItem("isFirstVisit(10.20)");
    if (firstVisit === null) navigate(PATHS.ONBOARDING);
  }, [navigate]);

  // 웹뷰 FCM 토큰 수신 설정
  useEffect(() => {
    const handleToken = (token: string) => {
      if (token && token.trim() !== "") {
        localStorage.setItem("fcmToken", token);
        setFcmToken(token);
      }
    };

    // React가 마운트된 이후에도 호출될 수 있으므로 전역 함수 등록 유지
    (window as any).onReceiveFcmToken = async function (token: string) {
      handleToken(token);
    };

    // 커스텀 이벤트 리스너 등록 (index.html에서 조기 수신한 경우 대응)
    const onTokenReceived = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setFcmToken(customEvent.detail);
      }
    };

    window.addEventListener("fcmTokenReceived", onTokenReceived);

    // 마운트 시점에 이미 localStorage에 토큰이 있다면 상태 동기화
    const storedToken = localStorage.getItem("fcmToken");
    if (storedToken) {
      setFcmToken(storedToken);
    }

    return () => {
      (window as any).onReceiveFcmToken = null;
      window.removeEventListener("fcmTokenReceived", onTokenReceived);
    };
  }, []);

  // 알림 클릭 시 라우팅 핸들러 설정
  useEffect(() => {
    const resolveChatPath = async (id: string): Promise<string> => {
      try {
        const numericId = Number(id);
        const [roommateRes, groupRes, openRes] = await Promise.allSettled([
          getRoommateChatRooms(),
          getGroupOrderChatRooms(),
          getOpenChatRooms("MY", 0, 100)
        ]);
        
        if (roommateRes.status === "fulfilled") {
          const exists = roommateRes.value.data.some(r => r.chatRoomId === numericId);
          if (exists) return `/chat/roommate/${id}`;
        }
        
        if (groupRes.status === "fulfilled") {
          const exists = groupRes.value.data.some(r => r.chatRoomId === numericId);
          if (exists) return `/chat/groupPurchase/${id}`;
        }

        if (openRes.status === "fulfilled") {
          const exists = openRes.value.data.content.some(r => r.roomId === numericId);
          if (exists) return `/chat/open/${id}`;
        }
      } catch (e) {
        console.error("Resolve chat path error:", e);
      }
      return `/chat/roommate/${id}`;
    };

    window.navigateToPath = async function (path: string) {
      if (!path) return;
      
      let targetPath = path;
      
      // 1. 공지사항 경로 변환 (/notice/5678 -> /announcements/5678)
      if (path.startsWith("/notice/")) {
        const id = path.split("/")[2];
        targetPath = `/announcements/${id}`;
      }
      
      // 2. 채팅 경로 변환 (/chat/1234 -> /chat/roommate/1234 or /chat/groupPurchase/1234)
      const chatMatch = path.match(/^\/chat\/(\d+)$/);
      if (chatMatch) {
        const id = chatMatch[1];
        targetPath = await resolveChatPath(id);
      }
      
      navigate(targetPath);
    };

    return () => {
      window.navigateToPath = undefined;
    };
  }, [navigate]);

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
