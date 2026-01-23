// 회원 가져오기
import tokenInstance from "./tokenInstance.ts";
import { AxiosResponse } from "axios";
import { CouponInfo } from "@/types/event";

export const getEventWin = async (): Promise<AxiosResponse<CouponInfo>> => {
  const response = await tokenInstance.get<CouponInfo>(`/coupons`);
  console.log(response);
  return response;
};
