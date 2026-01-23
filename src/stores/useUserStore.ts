import { TokenInfo, UserInfo } from "@/types/members";
import { create } from "zustand";

interface UserState {
  tokenInfo: TokenInfo;
  userInfo: UserInfo;
  setTokenInfo: (tokenInfo: TokenInfo) => void;
  setUserInfo: (userInfo: UserInfo) => void;
  isLoading: boolean;
}

// localStorage에서 tokenInfo 불러오기
const getTokenInfoFromStorage = (): TokenInfo => {
  return {
    accessToken: localStorage.getItem("accessToken") || "",
    refreshToken: localStorage.getItem("refreshToken") || "",
    role: localStorage.getItem("role") || "",
  };
};

// localStorage에서 userInfo 불러오기
const getUserInfoFromStorage = (): UserInfo => {
  const stored = localStorage.getItem("userInfo");

  // JSON.parse(stored)를 반환하기 전에 UserInfo 타입 단언을 하는 것이 일반적입니다.
  // 여기서는 'stored'가 있을 경우 파싱된 값이 UserInfo 구조를 따른다고 가정합니다.
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed as UserInfo;
    } catch (e) {
      console.error("Error parsing user info from storage:", e);
      // 파싱 실패 시 기본값 반환
    }
  }

  // localStorage에 없거나 파싱에 실패했을 때, 새로운 UserInfo 인터페이스에 맞춘 기본 객체 반환
  return {
    id: 0,
    name: "",
    studentNumber: "",
    dormType: "",
    college: "",
    penalty: 0,
    hasTimeTableImage: false,
    hasUnreadNotifications: false, // 새로 추가된 필드
    termsAgreed: false, // 새로 추가된 필드
    privacyAgreed: false, // 새로 추가된 필드
    roommateCheckList: false,
  };
};

const useUserStore = create<UserState>((set) => ({
  tokenInfo: getTokenInfoFromStorage(),
  userInfo: getUserInfoFromStorage(),
  setTokenInfo: (tokenInfo) => {
    set(() => ({ tokenInfo }));
    localStorage.setItem("accessToken", tokenInfo.accessToken);
    localStorage.setItem("refreshToken", tokenInfo.refreshToken);
  },
  setUserInfo: (userInfo) => {
    set(() => ({ userInfo }));
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  },
  isLoading: true, // 초기 상태를 true로 설정
}));

export default useUserStore;
