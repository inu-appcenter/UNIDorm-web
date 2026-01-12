import { GetGroupPurchaseListParams } from "@/types/grouporder";

export const CATEGORY_LIST: GetGroupPurchaseListParams["type"][] = [
  "전체",
  "배달",
  "식자재",
  "생활용품",
  "기타",
];
export type CategoryType = (typeof CATEGORY_LIST)[number];

export const POST_CATEGORIES = ["배달", "식자재", "생활용품", "기타"];

export const SORT_OPTIONS: GetGroupPurchaseListParams["sort"][] = [
  "마감임박순",
  "최신순",
  "인기순",
  "낮은가격순",
];

export const MAX_IMAGE_COUNT = 5;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 2000;
