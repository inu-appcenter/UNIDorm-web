// src/contexts/RoomMateContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { RoommatePost, SimilarRoommatePost } from "../types/roommates.ts";
import { getRoomMateList, getSimilarRoomMateList } from "../apis/roommate.ts";
import useUserStore from "../stores/useUserStore.ts";

interface RoomMateContextType {
  roommates: RoommatePost[];
  similarRoommates: SimilarRoommatePost[];
  reloadRoommates: () => void;
  reloadSimilarRoommates: () => void;
}

const RoomMateContext = createContext<RoomMateContextType | undefined>(
  undefined,
);

export function RoomMateProvider({ children }: { children: ReactNode }) {
  const [roommates, setRoommates] = useState<RoommatePost[]>([]);
  const [similarRoommates, setSimilarRoommates] = useState<
    SimilarRoommatePost[]
  >([]);
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const loadRoommates = async () => {
    try {
      const data = await getRoomMateList();
      setRoommates(data.data);
    } catch (error) {
      console.error("룸메이트 리스트 불러오기 실패:", error);
    }
  };

  const loadSimilarRoommates = async () => {
    if (!isLoggedIn) return;
    try {
      const response = await getSimilarRoomMateList();
      const list = Array.isArray(response.data) ? response.data : [];
      setSimilarRoommates(list);
    } catch (error) {
      console.error("유사한 룸메이트 리스트 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    loadRoommates();
    loadSimilarRoommates();
  }, [isLoggedIn]);

  return (
    <RoomMateContext.Provider
      value={{
        roommates,
        similarRoommates,
        reloadRoommates: loadRoommates,
        reloadSimilarRoommates: loadSimilarRoommates,
      }}
    >
      {children}
    </RoomMateContext.Provider>
  );
}

export function useRoomMateContext() {
  const context = useContext(RoomMateContext);
  if (!context)
    throw new Error(
      "useRoomMateContext는 RoomMateProvider 내부에서만 사용 가능합니다.",
    );
  return context;
}
