import axiosInstance from "./axiosInstance"; // 이미 토큰 처리된 인스턴스

export const getGroupPurchaseList = async () => {
  const response = await axiosInstance.get("/group-orders");
  return response.data;
};
