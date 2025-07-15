import { TokenInfo, UserInfo } from "../types/members";
import { create } from "zustand";

interface UserState {
  tokenInfo: TokenInfo;
  userInfo: UserInfo;
  setTokenInfo: (tokenInfo: TokenInfo) => void;
  setUserInfo: (userProfile: UserInfo) => void;
}

const useUserStore = create<UserState>((set) => ({
  tokenInfo: {
    accessToken: "",
    refreshToken: "",
  },
  userInfo: {
    name: "",
    studentNumber: "",
    dormType: "",
    college: "",
    penalty: 0,
  },
  setTokenInfo: (tokenInfo) => {
    set(() => ({ tokenInfo }));
    localStorage.setItem("tokenInfo", JSON.stringify(tokenInfo));
  },
  setUserInfo: (userInfo) => set(() => ({ userInfo })),
}));

export default useUserStore;
