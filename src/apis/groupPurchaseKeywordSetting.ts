import tokenInstance from "./tokenInstance.ts";
import { CategoryType } from "../constants/groupPurchase.ts";

// 공동구매 키워드 알림 삭제
export const deleteGroupOrderKeywordNotification = async (keyword: string) => {
  const response = await tokenInstance.delete<void>(
    `/user-notifications/group-order/keyword`,
    {
      params: { keyword },
    },
  );
  return response.data;
};

// 공동구매 카테고리 알림 삭제
export const deleteGroupOrderCategoryNotification = async (
  category: string,
) => {
  const response = await tokenInstance.delete<void>(
    `/user-notifications/group-order/category`,
    {
      params: { category },
    },
  );
  return response.data;
};

// 공동구매 키워드 알림 목록 조회
export const getGroupOrderKeywordNotifications = async () => {
  const response = await tokenInstance.get<string[]>(
    `/user-notifications/group-order/keyword`,
  );
  return response.data;
};

// 공동구매 카테고리 알림 목록 조회
export const getGroupOrderCategoryNotifications = async (): Promise<
  CategoryType[]
> => {
  const response = await tokenInstance.get<CategoryType[]>(
    `/user-notifications/group-order/category`,
  );
  return response.data;
};

// 공동구매 키워드 알림 추가
export const addGroupOrderKeywordNotification = async (keyword: string) => {
  const response = await tokenInstance.post<void>(
    `/user-notifications/group-order/keyword`,
    null, // body 없음
    {
      params: { keyword },
    },
  );
  return response.data;
};

// 공동구매 카테고리 알림 추가
export const addGroupOrderCategoryNotification = async (category: string) => {
  const response = await tokenInstance.post<void>(
    `/user-notifications/group-order/category`,
    null, // body 없음
    {
      params: { category },
    },
  );
  return response.data;
};
