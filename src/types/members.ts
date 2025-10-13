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

export interface MyPost_GroupOrder {
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

export interface RoommateBoard {
  arrangement: string; // 정리정돈 습관 (예: "애매해요")
  bedTime: string; // 취침 시간 (예: "일찍 자요")
  boardId: number; // 게시글 ID
  college: string; // 단과대학 (예: "정보기술대")
  comment: string; // 자기소개 및 룸메 관련 코멘트
  createDate: string; // 게시글 생성일 (ISO 문자열)
  dormPeriod: string[]; // 생활 요일 (예: ['월', '화', '수', '목', '금', '토', '일'])
  dormType: string; // 기숙사 종류 (예: "2기숙사")
  filePath: string | null; // 이미지나 첨부파일 경로
  matched: boolean; // 매칭 여부
  mbti: string; // MBTI (예: "INTP")
  religion: string; // 종교 (예: "무교")
  roommateBoardLike: number; // 좋아요 수
  showerHour: string; // 샤워 시간대 (예: "둘다")
  showerTime: string; // 샤워 소요 시간 (예: "30분 이내")
  sleeper: string; // 수면 스타일 (예: "밝아요")
  smoking: string; // 흡연 여부 (예: "안피워요")
  snoring: string; // 코골이 여부 (예: "안골아요")
  title: string; // 게시글 제목 (예: "룸메 구합니다")
  toothGrind: string; // 이갈이 여부 (예: "안갈아요")
  type: string; // 게시글 타입 (예: "ROOMMATE")
  userId: number; // 작성자 ID
  userName: string; // 작성자 이름
  userProfileImageUrl: string | null; // 프로필 이미지 URL
}
