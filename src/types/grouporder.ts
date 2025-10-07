export interface GetGroupPurchaseListParams {
  sort: "마감임박순" | "최신순" | "인기순" | "낮은가격순";
  type: "전체" | "배달" | "식자재" | "생활용품" | "기타";
  search?: string;
}

// 공동구매 게시글 목록 조회 API
export interface GroupOrder {
  boardId: number;
  title: string;
  type: string;
  createDate: string; // ISO 문자열 형식
  filePath: string;
  deadline: string; // 문자열 형식
  price: number;
  groupOrderType: string; // 예: "전체"
  viewCount: number; // 새로 추가된 필드
  recruitmentComplete: boolean;
}

// 댓글 타입
export interface GroupOrderComment {
  groupOrderCommentId: number;
  userId: number;
  reply: string;
  parentId: number;
  isDeleted: boolean;
  commentAuthorImagePath: string;
  childGroupOrderCommentList: GroupOrderComment[];
  username: string;
}

// 상세 조회용 타입
export interface GroupOrderDetail {
  id: number;
  title: string;
  deadline: string;
  createDate: string;
  groupOrderType: string;
  price: number;
  description: string;
  link: string;
  authorImagePath: string;
  groupOrderCommentDtoList: GroupOrderComment[];
  myPost: boolean;
  checkLikeCurrentUser: boolean;
  likeCount: number;
  openChatLink: string;
  username: string;
  viewCount: number;
  recruitmentComplete: boolean;
}

export interface GroupOrderImage {
  imageUrl: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadDate: string;
}

export interface GroupOrderPopularSearch {
  ranking: number;
  keyword: string;
}

export interface CreateGroupOrderRequest {
  title: string;
  groupOrderType: string;
  price: number;
  link: string;
  openChatLink: string;
  deadline: string;
  description: string;
}

// 공동구매 댓글 등록
export interface CreateGroupOrderCommentRequest {
  parentCommentId?: number | null; // 부모 댓글 ID (대댓글일 경우)
  groupOrderId: number; // 대상 공동구매 글 ID
  reply: string; // 댓글 내용
}

export interface GroupOrderCommentResponse {
  groupOrderCommentId: number;
  userId: number;
  reply: string;
  parentId: number;
  isDeleted: boolean;
  commentAuthorImagePath: string;
  createDate: string;
  username: string;
}
