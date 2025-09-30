// src/contexts/TipContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchTips } from "../apis/tips";
import { Tip } from "../types/tips.ts";

interface TipContextType {
  tips: Tip[];
  reloadTips: () => void;
}

const TipContext = createContext<TipContextType | undefined>(undefined);

export function TipProvider({ children }: { children: ReactNode }) {
  const [tips, setTips] = useState<Tip[]>([]);

  const loadTips = async () => {
    try {
      const data = await fetchTips();
      console.log(data);
      setTips(data);
    } catch (error) {
      console.error("팁 리스트 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    loadTips();
  }, []);

  return (
    <TipContext.Provider value={{ tips, reloadTips: loadTips }}>
      {children}
    </TipContext.Provider>
  );
}

export function useTipContext() {
  const context = useContext(TipContext);
  if (!context)
    throw new Error("useTipContext는 TipProvider 내부에서만 사용 가능합니다.");
  return context;
}
