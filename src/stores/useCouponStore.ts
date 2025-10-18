import { create } from "zustand";

// 1. 상태와 액션의 타입 정의
interface CouponState {
  // 상태 (boolean 타입)
  isCouponWinOpen: boolean;

  // 액션 (boolean 값을 인수로 받아 상태를 설정하는 함수)
  setIsCouponWinOpen: (isOpen: boolean) => void;
}

// 2. Zustand 스토어 생성
export const useCouponStore = create<CouponState>((set) => ({
  // 초기 상태 값
  isCouponWinOpen: false,

  // 상태를 업데이트하는 액션 구현
  setIsCouponWinOpen: (isOpen) =>
    set({
      isCouponWinOpen: isOpen,
    }),
}));
