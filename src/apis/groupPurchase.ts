import axiosInstance from "./axiosInstance";
import {
  CreateGroupOrderCommentRequest,
  CreateGroupOrderRequest,
  GetGroupPurchaseListParams,
  GroupOrder,
  GroupOrderCommentResponse,
  GroupOrderDetail,
  GroupOrderImage,
  GroupOrderPopularSearch,
} from "../types/grouporder.ts";
import tokenInstance from "./tokenInstance.ts"; // 이미 토큰 처리된 인스턴스

//공동구매 게시글 목록 조회
export const getGroupPurchaseList = async (
  params: GetGroupPurchaseListParams,
) => {
  const response = await axiosInstance.get<GroupOrder[]>("/group-orders", {
    params,
  });
  return response.data;
};

// 특정 공동구매 게시글 상세 조회
export const getGroupPurchaseDetail = async (groupOrderId: number) => {
  const response = await axiosInstance.get<GroupOrderDetail>(
    `/group-orders/${groupOrderId}`,
  );
  return response.data;
};

//공동구매 게시글 삭제
export const deleteGroupPurchase = async (
  groupOrderId: number,
): Promise<void> => {
  await tokenInstance.delete(`/group-orders/${groupOrderId}`);
};

//공동구매 게시글 이미지 조회
export const getGroupPurchaseImages = async (
  groupOrderId: number,
): Promise<GroupOrderImage[]> => {
  const response = await axiosInstance.get<GroupOrderImage[]>(
    `/group-orders/${groupOrderId}/images`,
  );
  return response.data;
};

//사용자의 공동구매 검색 기록 조회
export const getGroupPurchaseSearchLog = async (): Promise<string[]> => {
  const response = await tokenInstance.get<string[]>("/group-orders/searchLog");
  return response.data;
};

//인기 검색어 조회
export const getGroupPurchasePopularSearch = async (): Promise<
  GroupOrderPopularSearch[]
> => {
  const response = await axiosInstance.get<GroupOrderPopularSearch[]>(
    "/group-orders/popular-search",
  );
  return response.data;
};

//공동구매 게시글 등록
export const createGroupPurchase = async (
  requestGroupOrderDto: CreateGroupOrderRequest,
  images?: File[],
): Promise<void> => {
  const formData = new FormData();
  formData.append(
    "requestGroupOrderDto",
    new Blob([JSON.stringify(requestGroupOrderDto)], {
      type: "application/json",
    }),
  );

  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append("images", image);
    });
  }

  await tokenInstance.post("/group-orders", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

//공동구매 평점 추가
export const addGroupPurchaseRating = async (
  groupOrderId: number,
  ratingScore: number,
): Promise<void> => {
  await axiosInstance.post(
    `/group-orders/${groupOrderId}/rating/${ratingScore}`,
  );
};

//공동구매 게시글 수정
export const updateGroupPurchase = async (
  groupOrderId: number,
  requestGroupOrderDto: CreateGroupOrderRequest,
  images?: File[],
): Promise<void> => {
  const formData = new FormData();
  formData.append(
    "requestGroupOrderDto",
    new Blob([JSON.stringify(requestGroupOrderDto)], {
      type: "application/json",
    }),
  );

  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append("images", image);
    });
  }

  await tokenInstance.put(`/group-orders/${groupOrderId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 공동구매 게시글 좋아요 취소
export const unlikeGroupPurchase = async (
  groupOrderId: number,
): Promise<number> => {
  const response = await axiosInstance.patch<number>(
    `/group-orders/${groupOrderId}/unlike`,
  );
  return response.data;
};

// 공동구매 게시글 모집 완료 취소
export const cancelGroupPurchaseCompletion = async (
  groupOrderId: number,
): Promise<void> => {
  await axiosInstance.patch(`/group-orders/${groupOrderId}/unCompletion`);
};

// 공동구매 게시글 좋아요 추가
export const likeGroupPurchase = async (
  groupOrderId: number,
): Promise<number> => {
  const response = await axiosInstance.patch<number>(
    `/group-orders/${groupOrderId}/like`,
  );
  return response.data;
};

// 공동구매 게시글 모집 완료 처리
export const completeGroupPurchase = async (
  groupOrderId: number,
): Promise<void> => {
  await axiosInstance.patch(`/group-orders/${groupOrderId}/completion`);
};

export const createGroupOrderComment = async (
  comment: CreateGroupOrderCommentRequest,
): Promise<GroupOrderCommentResponse> => {
  const { data } = await tokenInstance.post<GroupOrderCommentResponse>(
    "/group-order-comments",
    comment,
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  return data;
};

// 공동구매 댓글 삭제
export const deleteGroupOrderComment = async (
  groupOrderCommentId: number,
): Promise<void> => {
  await tokenInstance.delete(`/group-order-comments/${groupOrderCommentId}`);
};
