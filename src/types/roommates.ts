export interface RoommatePost {
  boardId: number;
  title: string;
  dormPeriod: string[]; // 예: ["월요일", "화요일"]
  dormType: string; // 예: "2기숙사"
  college: string; // 예: "인문대학"
  mbti: string; // 예: "INFP"
  smoking: string; // 예: "피워요"
  snoring: string; // 예: "골아요"
  toothGrind: string; // 예: "갈아요"
  sleeper: string; // 예: "밝아요"
  showerHour: string; // 예: "아침"
  showerTime: string; // 예: "10분 이내"
  bedTime: string; // 예: "일찍 자요"
  arrangement: string; // 예: "깔끔해요"
  religion: string;
  matched: boolean;
  roommateBoardLike: number;

  comment: string; // 추가 설명
}

export interface SimilarRoommatePost {
  boardId: number;
  title: string;
  dormPeriod: string[]; // 예: ["월요일", "화요일"]
  dormType: string; // 예: "2기숙사"
  college: string; // 예: "인문대학"
  mbti: string; // 예: "INFP"
  smoking: string; // 예: "피워요"
  snoring: string; // 예: "골아요"
  toothGrind: string; // 예: "갈아요"
  sleeper: string; // 예: "밝아요"
  showerHour: string; // 예: "아침"
  showerTime: string; // 예: "10분 이내"
  bedTime: string; // 예: "일찍 자요"
  arrangement: string; // 예: "깔끔해요"
  religion: string;
  matched: boolean;
  roommateBoardLike: number;

  comment: string; // 본문 요약 or 한줄 코멘트
  similarityPercentage: number; // 유사도 (예: 85)
}

export interface RoomMateCardProps {
  boardId: number;
  title: string;
  dormType: string;
  mbti: string;
  college: string;
  isSmoker: boolean;
  isClean: boolean;
  stayDays: string[];
  description: string;
  roommateBoardLike: number;
  matched: boolean;
  percentage?: number;
}

export interface RoommatePostRequest {
  title: string;
  dormPeriod: string[];
  dormType: string;
  college: string;
  mbti: string;
  smoking: string;
  snoring: string;
  toothGrind: string;
  sleeper: string;
  showerHour: string;
  showerTime: string;
  bedTime: string;
  arrangement: string;
  religion: string;
  comment: string;
}

export interface RoommatePostResponse {
  boardId: number;
  title: string;
  dormPeriod: string[];
  dormType: string;
  college: string;
  mbti: string;
  smoking: string;
  snoring: string;
  toothGrind: string;
  sleeper: string;
  showerHour: string;
  showerTime: string;
  bedTime: string;
  arrangement: string;
  religion: string;
  matched: boolean;
  roommateBoardLike: number;

  comment: string;
}

// types.ts (또는 적절한 타입 정의 파일에 추가)
export interface RoommateMatchingRequest {
  receiverStudentNumber: string;
}

export interface RoommateMatchingResponse {
  reciverId: number; // 오타가 아니라면 그대로 사용
  status: "REQUEST";
  matchingId: number;
}

export interface MyRoommateInfoResponse {
  name: string;
  dormType: string;
  college: string;
  imagePath: string;
}

export interface RoommateRulesResponse {
  rules: string[] | null;
}
export interface RoommateRulesUpdateRequest {
  rules: string[];
}

export interface ReceivedMatchingRequest {
  matchingId: number;
  senderId: number;
  senderName: string;
  status: string;
}
