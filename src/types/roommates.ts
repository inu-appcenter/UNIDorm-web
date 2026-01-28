// --- 공통 기반 타입 ---
interface RoommateBase {
  dormType: string;
  dormPeriod: string[];
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
}

// --- 게시글 관련 타입 ---
export interface RoommatePostRequest extends RoommateBase {
  title: string;
  comment: string;
}

export interface RoommatePost extends RoommatePostRequest {
  boardId: number;
  matched: boolean;
  roommateBoardLike: number;
  userName: string;
  userProfileImageUrl: string;
  createDate: string;
}

export interface RoommatePostResponse extends RoommatePost {}

export interface SimilarRoommatePost
  extends Omit<
    RoommatePost,
    "userName" | "userProfileImageUrl" | "createDate"
  > {
  similarityPercentage: number;
}

// --- UI 및 컴포넌트 Props ---
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

// --- 알림 필터 관련 ---
export interface RoommateNotificationFilter
  extends Partial<Omit<RoommateBase, "dormPeriod" | "college" | "religion">> {
  dormPeriodDays?: string[];
  colleges?: string[];
  religions?: string[];
}

// --- 매칭 관련 타입 ---
export interface RoommateMatchingRequest {
  receiverStudentNumber: string;
}

export interface RoommateMatchingResponse {
  reciverId: number; // API 명세상의 오타 유지
  status: "REQUEST";
  matchingId: number;
}

export interface MyRoommateInfoResponse {
  name: string;
  dormType: string;
  college: string;
  imagePath: string;
  matchingId: number;
}

export interface ReceivedMatchingRequest {
  matchingId: number;
  senderId: number;
  senderName: string;
  status: string;
}

export interface RoommateMatchingByChatRoomRequest {
  chatRoomId: number;
}

// --- 규칙 관련 타입 ---
export interface RoommateRulesResponse {
  rules: string[] | null;
}

export interface RoommateRulesUpdateRequest {
  rules: string[];
}

// --- 입력 폼 관련 타입 ---
export interface CheckListForm {
  title: string;
  comment: string;
  dormType: number | null;
  college: number | null;
  dormPeriod: number[];
  smoking: number | null;
  snoring: number | null;
  toothGrind: number | null;
  arrangement: number | null;
  religion: number | null;
  sleeper: number | null;
  showerHour: number | null;
  showerTime: number | null;
  bedTime: number | null;
  mbti: (number | null)[];
}

export const INITIAL_FORM_STATE: CheckListForm = {
  title: "",
  comment: "",
  dormType: null,
  college: null,
  dormPeriod: [],
  smoking: null,
  snoring: null,
  toothGrind: null,
  arrangement: null,
  religion: null,
  sleeper: null,
  showerHour: null,
  showerTime: null,
  bedTime: null,
  mbti: [null, null, null, null],
};

export interface StepProps {
  data: CheckListForm;
  onChange: (key: keyof CheckListForm, value: any) => void;
}
