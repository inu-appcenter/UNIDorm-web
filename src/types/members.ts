export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  name: string;
  studentNumber: string;
  dormType: string;
  college: string;
  penalty: number;
  hasTimeTableImage: boolean;
  roommateCheckList: boolean;
  id: number;
  isAdmin: boolean;
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
