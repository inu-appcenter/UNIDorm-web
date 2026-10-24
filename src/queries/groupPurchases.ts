import { useQuery } from "@tanstack/react-query";
import {
  getGroupPurchaseDetail,
  getGroupPurchaseImages,
  getGroupPurchaseList,
} from "@/apis/groupPurchase";
import {
  getGroupOrderCategoryNotifications,
  getGroupOrderKeywordNotifications,
} from "@/apis/groupPurchaseKeywordSetting";
import type { GetGroupPurchaseListParams } from "@/types/grouporder";

export const groupPurchaseKeys = {
  all: ["groupPurchases"] as const,
  list: (params: GetGroupPurchaseListParams) =>
    ["groupPurchases", "list", params] as const,
  detail: (id: number) => ["groupPurchases", "detail", id] as const,
  keywordAlerts: () => ["groupPurchases", "keywordAlerts"] as const,
  categoryAlerts: () => ["groupPurchases", "categoryAlerts"] as const,
};

/** 공동구매 목록 (정렬·카테고리·검색어). */
export const useGroupPurchaseList = (params: GetGroupPurchaseListParams) =>
  useQuery({
    queryKey: groupPurchaseKeys.list(params),
    queryFn: () => getGroupPurchaseList(params),
  });

/**
 * 공동구매 상세 + 이미지. 상세 조회 API 는 호출할 때마다 조회수를 올리므로 같은
 * 화면의 좋아요·댓글로는 다시 조회하지 않습니다 (`sync: "otherWebViews"`).
 * 같은 화면에서 바뀐 값이 필요하면 `refetch()` 를 직접 호출합니다.
 */
export const useGroupPurchaseDetail = (id: number | undefined) =>
  useQuery({
    queryKey: groupPurchaseKeys.detail(id ?? 0),
    queryFn: async () => {
      const [post, images] = await Promise.all([
        getGroupPurchaseDetail(id!),
        getGroupPurchaseImages(id!),
      ]);
      return { post, images };
    },
    enabled: !!id,
    retry: false,
    meta: { sync: "otherWebViews" },
  });

/** 공동구매 키워드 알림 목록. */
export const useGroupPurchaseKeywordAlerts = () =>
  useQuery({
    queryKey: groupPurchaseKeys.keywordAlerts(),
    queryFn: getGroupOrderKeywordNotifications,
  });

/** 공동구매 카테고리 알림 목록. */
export const useGroupPurchaseCategoryAlerts = () =>
  useQuery({
    queryKey: groupPurchaseKeys.categoryAlerts(),
    queryFn: getGroupOrderCategoryNotifications,
  });
