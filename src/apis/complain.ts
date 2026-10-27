// 민원 삭제
import tokenInstance from "./tokenInstance.ts";
import { AxiosResponse } from "axios";
import {
  ComplaintCreateDto,
  ComplaintCursorPageResponse,
  ComplaintDetail,
  ComplaintResponse,
  ComplaintSearchDto,
  MyComplaint,
} from "@/types/complain";
import { ManagedFile } from "@/hooks/useFileHandler";

export const deleteComplaint = async (
  complaintId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.delete<void>(
    `/complaints/${complaintId}`,
  );
  console.log(response);
  return response;
};

// 민원 상세 조회
export const getComplaintDetail = async (
  complaintId: number,
): Promise<AxiosResponse<ComplaintDetail>> => {
  const response = await tokenInstance.get<ComplaintDetail>(
    `/complaints/${complaintId}`,
  );
  console.log(response);
  return response;
};

type UserComplaintApiResponseData =
  | MyComplaint[]
  | {
      content?: MyComplaint[];
      complaints?: MyComplaint[];
      hasNext?: boolean;
      nextCursor?: number | null;
    };

export const adaptUserComplaintListResponse = (
  raw: any,
): ComplaintCursorPageResponse<MyComplaint> => {
  if (Array.isArray(raw)) {
    return {
      content: raw,
      hasNext: false,
      nextCursor: null,
    };
  }
  return {
    content: Array.isArray(raw?.content)
      ? raw.content
      : Array.isArray(raw?.complaints)
        ? raw.complaints
        : [],
    hasNext: Boolean(raw?.hasNext),
    nextCursor: raw?.nextCursor ?? null,
  };
};

const normalizeMyComplaintListResponse = (
  response: AxiosResponse<UserComplaintApiResponseData>,
): AxiosResponse<MyComplaint[]> => {
  const page = adaptUserComplaintListResponse(response.data);
  return { ...response, data: page.content };
};

// 내 민원 목록 조회 (최신순 / 하위 호환성 어댑터 적용)
export const getMyComplaints = async (
  params?: ComplaintSearchDto,
): Promise<AxiosResponse<MyComplaint[]>> => {
  const response = await tokenInstance.get<UserComplaintApiResponseData>(
    `/complaints`,
    { params },
  );
  return normalizeMyComplaintListResponse(response);
};

// 내 민원 목록 커서 페이징 조회 (신규 규격)
export const getMyComplaintsPage = async (
  params?: ComplaintSearchDto,
): Promise<AxiosResponse<ComplaintCursorPageResponse<MyComplaint>>> => {
  const response = await tokenInstance.get<UserComplaintApiResponseData>(
    `/complaints`,
    { params },
  );
  return {
    ...response,
    data: adaptUserComplaintListResponse(response.data),
  };
};

// 민원 등록
export const createComplaint = async (
  dto: ComplaintCreateDto,
  files?: ManagedFile[],
): Promise<AxiosResponse<ComplaintResponse>> => {
  const formData = new FormData();
  formData.append("dto", JSON.stringify(dto));

  if (files) {
    files.forEach((file) => formData.append("files", file.file));
  }

  const response = await tokenInstance.post<ComplaintResponse>(
    `/complaints`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  console.log(response);
  return response;
};

// 민원 수정
export const updateComplaint = async (
  complaintId: number,
  dto: ComplaintCreateDto,
  files?: ManagedFile[],
): Promise<AxiosResponse<ComplaintResponse>> => {
  const formData = new FormData();
  formData.append("dto", JSON.stringify(dto));

  if (files) {
    files.forEach((file) => formData.append("files", file.file));
  }

  const response = await tokenInstance.put<ComplaintResponse>(
    `/complaints/${complaintId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  console.log(response);
  return response;
};
