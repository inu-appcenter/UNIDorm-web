import { TokenInfo, UserInfo } from "@/types/members";
import { create } from "zustand";
import { identifyUser } from "@/utils/mixpanel";
import { appBridge } from "@/utils/appBridgeAdapter";
import { broadcastSync } from "@/stores/middleware/broadcastSync";
import { safeLocalStorage } from "@/utils/safeStorage";
import { secureStorage } from "@/utils/secureStorage";

interface UserState {
  tokenInfo: TokenInfo;
  userInfo: UserInfo;
  setTokenInfo: (tokenInfo: TokenInfo, options?: { fromNative?: boolean }) => void;
  setUserInfo: (userInfo: UserInfo) => void;
  clearUnreadNotifications: () => void;
  setLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

// localStorage에서 tokenInfo 불러오기
const getTokenInfoFromStorage = (): TokenInfo => {
  return {
    accessToken: safeLocalStorage.getItem("accessToken") || "",
    refreshToken: safeLocalStorage.getItem("refreshToken") || "",
    role: safeLocalStorage.getItem("role") || "",
  };
};

// localStorage에서 userInfo 불러오기
const getUserInfoFromStorage = (): UserInfo => {
  const stored = safeLocalStorage.getItem("userInfo");

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed as UserInfo;
    } catch (e) {
      console.error("Error parsing user info from storage:", e);
    }
  }

  return {
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
};

const useUserStore = create<UserState>()(
  broadcastSync<UserState>({
    // 멀티 웹뷰 환경에서 로그인/로그아웃 화면이 별도 서브 웹뷰(mode="sub")로
    // 열리는 경우, 그 웹뷰에서 인증 상태가 변경되어도 루트 웹뷰의 Zustand 스토어는
    // In-Memory 상태라 갱신되지 않는 문제를 해결하기 위해 BroadcastChannel을 통해 실시간 동기화합니다.
    name: "user-store-sync",
    partialize: (state) => ({ tokenInfo: state.tokenInfo, userInfo: state.userInfo }),
    onReceive: (partial) => {
      if (partial.tokenInfo) {
        safeLocalStorage.setItem("accessToken", partial.tokenInfo.accessToken || "");
        safeLocalStorage.setItem("refreshToken", partial.tokenInfo.refreshToken || "");
        safeLocalStorage.setItem("role", partial.tokenInfo.role || "");
        // 원격 웹뷰에서 로그아웃된 경우에도 사생/학적 캐시 일괄 소거
        if (!partial.tokenInfo.accessToken) {
          secureStorage.clearAllPortalCaches();
        }
      }
      if (partial.userInfo) {
        safeLocalStorage.setItem("userInfo", JSON.stringify(partial.userInfo));
        if (partial.userInfo.id && partial.userInfo.id !== 0) {
          identifyUser(String(partial.userInfo.id), {
            $name: partial.userInfo.name,
            dormType: partial.userInfo.dormType,
            college: partial.userInfo.college,
            reportedCount: partial.userInfo.reportedCount,
            studentNumber: partial.userInfo.studentNumber,
            hasTimeTableImage: partial.userInfo.hasTimeTableImage,
            roommateCheckList: partial.userInfo.roommateCheckList,
          });
        }
      }
    },
  })((set) => ({
    tokenInfo: getTokenInfoFromStorage(),
    userInfo: getUserInfoFromStorage(),
    setTokenInfo: (tokenInfo, options) => {
      set(() => ({ tokenInfo, isLoading: true }));
      safeLocalStorage.setItem("accessToken", tokenInfo.accessToken);
      safeLocalStorage.setItem("refreshToken", tokenInfo.refreshToken);
      safeLocalStorage.setItem("role", tokenInfo.role);

      // 토큰이 비어있으면 (로그아웃 신호) 사생/학적 온디바이스 캐시 일괄 소거
      if (!tokenInfo.accessToken) {
        secureStorage.clearAllPortalCaches();
      }

      // 네이티브에서 수신한 업데이트가 아닐 때만 네이티브 브릿지로 동기화 (무한 루프 방지)
      if (!options?.fromNative) {
        if (tokenInfo.accessToken) {
          appBridge.syncTokenInfo(tokenInfo);
          appBridge.loginSuccess();
        } else {
          appBridge.syncTokenInfo(tokenInfo);
        }
      }
    },
    setUserInfo: (userInfo: UserInfo) => {
      set({ userInfo, isLoading: false });
      safeLocalStorage.setItem("userInfo", JSON.stringify(userInfo));

      if (!userInfo.id || userInfo.id === 0) return;
      const userId = String(userInfo.id);

      identifyUser(userId, {
        $name: userInfo.name,
        dormType: userInfo.dormType,
        college: userInfo.college,
        reportedCount: userInfo.reportedCount,
        studentNumber: userInfo.studentNumber,
        hasTimeTableImage: userInfo.hasTimeTableImage,
        roommateCheckList: userInfo.roommateCheckList,
      });
    },
    clearUnreadNotifications: () => {
      set((state) => {
        if (!state.userInfo.hasUnreadNotifications) return state;
        const updated = { ...state.userInfo, hasUnreadNotifications: false };
        safeLocalStorage.setItem("userInfo", JSON.stringify(updated));
        return { userInfo: updated };
      });
    },
    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },
    isLoading: true,
  }))
);

// 네이티브에서 자체 갱신하거나 릴레이한 JWT를 스토어 및 localStorage에 반영
if (typeof window !== "undefined") {
  appBridge.onTokenInfoUpdated((tokenInfo) => {
    // 네이티브 브릿지 스키마에는 role이 없어 비어서 올 수 있으므로 기존 값을 유지한다.
    const current = useUserStore.getState().tokenInfo;
    useUserStore.getState().setTokenInfo(
      { ...tokenInfo, role: tokenInfo.role || (tokenInfo.accessToken ? current.role : "") },
      { fromNative: true },
    );
  });
}

export default useUserStore;
