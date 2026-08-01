import type { AxiosResponse } from "axios";
import tokenInstance from "./tokenInstance";

export interface BlockedUser {
  blockedUserId: number;
  blockedUserName: string;
  blockedAt: string;
}

export const getBlockedUsers = (): Promise<AxiosResponse<BlockedUser[]>> =>
  tokenInstance.get<BlockedUser[]>("/block");

/**
 * 특정 사용자를 차단합니다.
 * 차단 후 상대 사용자는 1:1 채팅방 생성 및 메시지 전송이 제한됩니다.
 */
export const blockUser = (
  targetUserId: number,
): Promise<AxiosResponse<void>> =>
  tokenInstance.post<void>(`/block/${targetUserId}`);

/**
 * 특정 사용자의 차단을 해제합니다.
 */
export const unblockUser = (
  blockedUserId: number,
): Promise<AxiosResponse<void>> =>
  tokenInstance.delete<void>(`/block/${blockedUserId}`);
