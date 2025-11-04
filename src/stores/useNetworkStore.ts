// src/stores/useNetworkStore.ts
import { create } from "zustand";

interface NetworkState {
  isNetworkError: boolean;
  setNetworkError: (value: boolean) => void;
}

const useNetworkStore = create<NetworkState>((set) => ({
  isNetworkError: false,
  setNetworkError: (value) => set({ isNetworkError: value }),
}));

export default useNetworkStore;
