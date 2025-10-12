export interface Tip {
  boardId: number;
  title: string;
  type: string;
  createDate: string;
  filePath: string;
  content: string;
  tipLikeCount: number;
  tipCommentCount: number;
}

export interface TipComment {
  tipCommentId: number; // 댓글 ID
  userId: number; // 작성자 ID
  reply: string; // 댓글 내용
  parentId: number | null; // 부모 댓글 ID (없으면 null)
  isDeleted: boolean; // 삭제 여부
  createdDate?: string; // 작성일 (옵션)
  name: string; // 작성자 이름
  writerImageFile?: string; // 작성자 이미지 URL (옵션)
  profileImageUrl?: string; // 프로필 이미지 URL (옵션)
  childTipCommentList?: TipComment[]; // 대댓글 목록 (옵션)
}

export interface TipDetail {
  writerImageFile: string;
  boardId: number;
  title: string;
  content: string;
  tipLikeCount: number;
  tipLikeUserList: number[];
  createDate: string;
  tipCommentDtoList: TipComment[];
  checkLikeCurrentUser: boolean; // ← 서버 응답에 포함
  name: string;
  profileImageUrl: string;
}

export interface TipImage {
  contentType: string; // 예: "image/png"
  imageUrl: string; // 예: "https://inu-dormitory-dev.inuappcenter.kr/images/tip/tip_2_d0188fe0-8a0e-484b-a2fa-fd44e55d320e.png"
  fileSize: number; // 예: 215
  imageName: string; // 예: "http://inu-dormitory-dev.inuappcenter.kr/api/images/tip/26"
}
