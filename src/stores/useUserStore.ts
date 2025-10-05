import { TokenInfo, UserInfo } from "../types/members";
import { create } from "zustand";

interface UserState {
  tokenInfo: TokenInfo;
  userInfo: UserInfo;
  setTokenInfo: (tokenInfo: TokenInfo) => void;
  setUserInfo: (userInfo: UserInfo) => void;
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
  return stored
    ? JSON.parse(stored)
    : {
        name: "",
        studentNumber: "",
        dormType: "",
        college: "",
        penalty: 0,
        hasTimeTableImage: false,
        roommateCheckList: false,
        id: 0,
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
}));

export default useUserStore;
