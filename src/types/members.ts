import { GetGroupPurchaseListParams } from "./grouporder.ts";

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface UserInfo {
  id: number;
  name: string;
  studentNumber: string;
  dormType: string;
  college: string;
  penalty: number;
  hasTimeTableImage: boolean;
  /** 읽지 않은 알림이 있는지 여부 */
  hasUnreadNotifications: boolean;
  /** 서비스 약관 동의 여부 */
  termsAgreed: boolean;
  /** 개인정보 처리 방침 동의 여부 */
  privacyAgreed: boolean;
  roommateCheckList: boolean;
  // isAdmin: boolean; // JSON 객체에 없으므로 삭제됨
}

// type Weekday = "월" | "화" | "수" | "목" | "금" | "토" | "일";

export interface MyPost {
  boardId: number;
  createDate: string;
  deadline: string;
  filePath: string;
  groupOrderType: GetGroupPurchaseListParams["type"];
  price: number;
  recruitmentComplete: boolean;
  title: string;
  type: "GROUP_ORDER" | "ROOMMATE" | "TIP";
  viewCount: number;
}
