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

type Weekday = "월" | "화" | "수" | "목" | "금" | "토" | "일";

export interface MyPost {
  boardId: number;
  content: string;
  createDate: string; // "2025-08-07T17:56:25.348745"
  filePath: string | null;
  tipCommentCount: number;
  tipLikeCount: number;
  title: string;
  type: "TIP" | "ROOMMATE" | "GROUP";

  arrangement: string;
  bedTime: string;
  college: string;
  comment: string;
  dormPeriod: Weekday[];
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
}
