// src/pages/Announcement/AnnouncementContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAnnouncements } from "../apis/announcements.ts";
import { Announcement } from "../types/announcements.ts";

interface AnnouncementContextProps {
  notices: Announcement[];
  loading: boolean;
}

const AnnouncementContext = createContext<AnnouncementContextProps>({
  notices: [],
  loading: true,
});

export const AnnouncementProvider = ({ children }: { children: ReactNode }) => {
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getAnnouncements();
        setNotices(response.data);
      } catch (error) {
        console.error("공지사항 불러오기 실패", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <AnnouncementContext.Provider value={{ notices, loading }}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncement = () => useContext(AnnouncementContext);
