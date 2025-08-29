// 민원 상세 타입
export interface ComplaintDetail {
  id: number;
  title: string;
  content: string;
  type: string;
  dormType: string;
  caseNumber: string;
  contact: string;
  status: string;
  createdDate: string;
  officer: string;
  reply?: {
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
  };
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
  title: string;
  content: string;
  type: string;
  dormType: string;
  caseNumber: string;
  contact: string;
}

// 민원 등록 응답 타입
export interface ComplaintResponse {
  id: number;
  title: string;
  content: string;
  type: string;
  dormType: string;
  caseNumber: string;
  contact: string;
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
  caseNumber: string;
  officer: string;
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

// 민원 등록 요청 DTO
export interface ComplaintCreateDto {
  type: string;
  dormType: string;
  caseNumber: string;
  contact: string;
  title: string;
  content: string;
}

// 민원 등록 응답 타입
export interface ComplaintResponse {
  id: number;
  title: string;
  content: string;
  type: string;
  dormType: string;
  caseNumber: string;
  contact: string;
  status: string;
  createdDate: string;
}
