// src/apis/groupOrders.ts
import axiosInstance from "./axiosInstance";

export type GroupOrderType = "전체" | "배달" | "식자재" | "생활용품" | "기타";

export interface GroupOrderItem {
  boardId: number;
  title: string;
  type: string;
  createDate: string;      // ISO string
  filePath: string;        // 이미지 경로/URL
  deadline: string;        // ISO or YYYY-MM-DD (백엔드와 합의)
  price: number;
  currentPeople: number;
  maxPeople: number;
  groupOrderType: GroupOrderType;
}

export interface FetchGroupOrdersParams {
  category?: GroupOrderType;
  search?: string;
  sort?: "마감 임박 순" | "최신순" | "좋아요 순";
}

export async function fetchGroupOrders(_params?: FetchGroupOrdersParams) {
  // 서버가 쿼리 파라미터 지원하지 않는다고 가정 -> 전체 받아서 프론트에서 처리
  const res = await axiosInstance.get<GroupOrderItem[]>("/group-orders");
  return res.data;
}
