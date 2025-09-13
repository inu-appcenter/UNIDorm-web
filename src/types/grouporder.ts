export interface GetGroupPurchaseListParams {
  sort: "조회순" | "낮은가격순" | "마감임박순";
  type: "전체" | "배달" | "식료품" | "생활용품" | "기타";
  search?: string;
}

// 공동구매 게시글 목록 조회 API
export interface GroupOrder {
  boardId: number;
  title: string;
  type: string;
  createDate: string;
  filePath: string;
  deadline: string;
  price: number;
  currentPeople: number;
  maxPeople: number;
  groupOrderType: string;
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
}

// 목록 조회용 타입
export interface GroupOrder {
  boardId: number;
  title: string;
  type: string;
  createDate: string;
  filePath: string;
  deadline: string;
  price: number;
  currentPeople: number;
  maxPeople: number;
  groupOrderType: string;
  recruitmentComplete: boolean;
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
  deadline: string;
  groupOrderType: string;
  price: number;
  maxPeople: number;
  description: string;
  link: string;
  openChatLink: string;
}
