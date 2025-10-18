// 회원 가져오기
import tokenInstance from "./tokenInstance.ts";
import { AxiosResponse } from "axios";
import { CouponInfo } from "../types/event.ts";

export const getEventWin = async (): Promise<AxiosResponse<CouponInfo>> => {
  const response = await tokenInstance.get<CouponInfo>(`/users`);
  console.log(response);
  return response;
};
