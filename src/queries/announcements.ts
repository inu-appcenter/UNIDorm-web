import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getAnnouncementDetail,
  getAnnouncementFiles,
  getAnnouncementScrollList,
} from "@/apis/announcements";
import type { AnnouncementPost } from "@/types/announcements";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];

export const announcementKeys = {
  all: ["announcements"] as const,
  scroll: (params: AnnouncementScrollParams) =>
    ["announcements", "scroll", params] as const,
  detail: (id: number) => ["announcements", "detail", id] as const,
};

interface AnnouncementScrollParams {
  type: string;
  category: string;
  search: string;
  size: number;
  /** 같은 검색어로 다시 검색할 때 새로 조회하도록 바꾸는 값 */
  requestId?: number;
}

/** 공지 목록 (무한 스크롤). */
export const useAnnouncementScroll = (params: AnnouncementScrollParams) =>
  useInfiniteQuery({
    queryKey: announcementKeys.scroll(params),
    queryFn: ({ pageParam }) =>
      getAnnouncementScrollList(
        params.type,
        params.category,
        params.search,
        pageParam,
        params.size,
      ),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: AnnouncementPost[]) => {
      if (!lastPage || lastPage.length < params.size) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    staleTime: 1000 * 60 * 5,
  });

/** 공지 최신 목록 첫 페이지 (홈 카드). */
export const useLatestAnnouncements = (size = 10) =>
  useQuery({
    queryKey: [...announcementKeys.all, "latest", size],
    queryFn: () => getAnnouncementScrollList("ALL", "ALL", "", undefined, size),
  });

/**
 * 공지 상세 + 첨부. 상세 조회 API 는 호출할 때마다 조회수를 올리므로 같은 화면의
 * 쓰기로는 다시 조회하지 않습니다 (`sync: "otherWebViews"`).
 */
export const useAnnouncementDetail = (id: number | undefined) =>
  useQuery({
    queryKey: announcementKeys.detail(id ?? 0),
    queryFn: async () => {
      const [detail, files] = await Promise.all([
        getAnnouncementDetail(id!),
        getAnnouncementFiles(id!),
      ]);
      const attachments = files.data;
      const images = attachments.filter((file) => {
        const ext = file.fileName.split(".").pop()?.toLowerCase();
        return !!ext && IMAGE_EXTENSIONS.includes(ext);
      });
      return { announce: detail.data, attachments, images };
    },
    enabled: !!id,
    retry: false,
    meta: { sync: "otherWebViews" },
  });
