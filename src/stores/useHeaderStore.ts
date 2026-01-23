import { create } from "zustand";
import { HeaderConfig } from "@/types/header";

/** 스토어 전용 상태 및 액션 인터페이스 */
interface HeaderState extends Required<HeaderConfig> {
  setHeader: (newConfig: HeaderConfig) => void;
  resetHeader: () => void;
}

const useHeaderStore = create<HeaderState>((set) => ({
  /* 초기 상태값 */
  title: "",
  menuItems: null,
  settingOnClick: null,
  showAlarm: false,
  secondHeader: null,

  /** 헤더 정보 업데이트 */
  setHeader: (newConfig) =>
    set((state) => {
      /* 변경 사항 확인 (참조 및 값 비교) */
      const isSameTitle = state.title === newConfig.title;
      const isSameHeader = state.secondHeader === newConfig.secondHeader;
      const isSameAlarm = state.showAlarm === newConfig.showAlarm;
      const isSameMenu = state.menuItems === newConfig.menuItems;
      const isSameSetting = state.settingOnClick === newConfig.settingOnClick;

      /* 모든 값이 동일하면 상태 업데이트 스킵 (리렌더링 방지) */
      if (
        isSameTitle &&
        isSameHeader &&
        isSameAlarm &&
        isSameMenu &&
        isSameSetting
      ) {
        return state;
      }

      return { ...state, ...newConfig };
    }),

  /** 상태 초기화 */
  resetHeader: () =>
    set({
      title: "",
      menuItems: null,
      settingOnClick: null,
      showAlarm: false,
      secondHeader: null,
    }),
}));

export default useHeaderStore;
