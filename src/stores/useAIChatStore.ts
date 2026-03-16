import { create } from "zustand";

interface AIChatState {
  isOpen: boolean;
  isVisible: boolean; // 버튼 노출 여부
  shouldAnimate: boolean; // 버튼 애니메이션 여부
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setChatConfig: (config: { isVisible?: boolean; shouldAnimate?: boolean }) => void;
  resetChatConfig: () => void;
}

const useAIChatStore = create<AIChatState>((set) => ({
  isOpen: false,
  isVisible: false, // 기본값: 숨김
  shouldAnimate: true, // 기본값: 켬
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  setChatConfig: (config) => set((state) => ({ ...state, ...config })),
  resetChatConfig: () => set({ isVisible: false, shouldAnimate: true }),
}));

export default useAIChatStore;
