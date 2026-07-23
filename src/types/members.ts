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

// ✅ 공통 부모 인터페이스
export interface MyPostBase {
  boardId: number; // 게시글 ID
  createDate: string; // 생성일 (ISO 8601)
  filePath: string | null; // 첨부파일 경로
  title: string; // 제목
  type: string; // 게시글 타입
}

// ✅ 공동구매 게시판
export interface MyPost_GroupOrder extends MyPostBase {
  type: "GROUP_ORDER";

  deadline: string;
  groupOrderType: GetGroupPurchaseListParams["type"];
  price: number;
  recruitmentComplete: boolean;
  viewCount: number;
}

// ✅ 룸메이트 게시판
export interface MyPost_RoommateBoard extends MyPostBase {
  type: "ROOMMATE";

  arrangement: string;
  bedTime: string;
  college: string;
  comment: string;
  dormPeriod: string[];
  dormType: string;
  matched: boolean;
  mbti: string;
  religion: string;
  roommateBoardLike: number;
  showerHour: string;
  showerTime: string;
  sleeper: string;
  smoking: string;
  snoring: string;
  toothGrind: string;
  userId: number;
  userName: string;
  userProfileImageUrl: string | null;
}

// ✅ 팁 게시판
export interface MyPost_TipBoard extends MyPostBase {
  type: "TIP"; // 팁 게시판은 고정 타입

  content: string;
  tipCommentCount: number;
  tipLikeCount: number;
}
