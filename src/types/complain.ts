// 민원 상세 타입
export interface ComplaintDetail {
  id: number;
  title: string;
  content: string;
  type: string;
  dormType: string;
  status: string;
  building: string; // 추가
  floor: string; // 추가
  roomNumber: string; // 추가
  bedNumber: string; // 추가
  createdDate: string;
  officer: string | null; // null 타입 추가
  reply: {
    replyTitle: string;
    replyContent: string;
    responderName: string;
    attachmentUrl: {
      filePath: string;
      fileName: string;
      fileSize: number;
      uploadDate: string;
    }[];
    createdDate: string;
  } | null; // null 타입 추가
  images: string[];
}

// 민원 목록용 타입
export interface MyComplaint {
  id: number;
  date: string;
  type: string;
  title: string;
  status: string;
}

// 민원 등록 요청 DTO
export interface ComplaintCreateDto {
  dormType: string;
  privacyAgreed: boolean;
  roomNumber: string;
  bedNumber: string;
  floor: string;
  building: string;
  title: string;
  content: string;
  type: string;
}

// 민원 등록 응답 타입
export interface ComplaintResponse {
  id: number;
  title: string;
  content: string;
  type: string;
  dormType: string;
  caseNumber: string;
  status: string;
  createdDate: string;
}

// 관리자용 민원 목록 타입
export interface AdminComplaint {
  id: number;
  date: string;
  type: string;
  title: string;
  status: string;
  officer: string;
  building: string;
  floor: string;
  roomNumber: string;
  bedNumber: string;
  dormType: string;
}

// 답변 등록/수정 DTO
export interface ComplaintReplyDto {
  replyTitle: string;
  replyContent: string;
  responderName: string;
}

// 답변 응답 타입
export interface ComplaintReplyResponse {
  replyTitle: string;
  replyContent: string;
  responderName: string;
  attachmentUrl: {
    filePath: string;
    fileName: string;
    fileSize: number;
    uploadDate: string;
  }[];
  createdDate: string;
}

// 민원 등록 응답 타입
export interface ComplaintResponse {
  id: number;
  title: string;
  content: string;
  type: string;
  dormType: string;
  caseNumber: string;
  status: string;
  createdDate: string;
}

/**
 * 민원 검색 조건 DTO (쿼리 파라미터로 사용)
 */
export interface ComplaintSearchDto {
  dormType?: string;
  officer?: string;
  status?: string;
  keyword?: string;
  building?: string;
  floor?: string;
  bedNumber?: string;
  roomNumber?: string;
  type?: string;
}
