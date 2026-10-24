import { useQuery } from "@tanstack/react-query";
import {
  fetchDailyRandomTips,
  fetchTips,
  getTipDetail,
  getTipImages,
} from "@/apis/tips";

export const tipKeys = {
  all: ["tips"] as const,
  list: () => ["tips", "list"] as const,
  dailyRandom: () => ["tips", "dailyRandom"] as const,
  detail: (id: number) => ["tips", "detail", id] as const,
};

/** 꿀팁 목록. */
export const useTips = () =>
  useQuery({ queryKey: tipKeys.list(), queryFn: fetchTips });

/** 오늘의 꿀팁 (무작위라 다시 조회하면 내용이 바뀌므로 자동 재조회하지 않음). */
export const useDailyRandomTips = () =>
  useQuery({
    queryKey: tipKeys.dailyRandom(),
    queryFn: fetchDailyRandomTips,
    meta: { sync: "none" },
  });

/** 꿀팁 상세 + 이미지. */
export const useTipDetail = (id: number | undefined) =>
  useQuery({
    queryKey: tipKeys.detail(id ?? 0),
    queryFn: async () => {
      const [tip, images] = await Promise.all([
        getTipDetail(id!),
        getTipImages(id!),
      ]);
      return { tip, images };
    },
    enabled: !!id,
  });
