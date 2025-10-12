// 민원 답변 삭제 (관리자용)
import tokenInstance from "./tokenInstance.ts";
import {
  AdminComplaint,
  ComplaintDetail,
  ComplaintReplyDto,
  ComplaintReplyResponse,
  ComplaintResponse,
  ComplaintSearchDto,
} from "../types/complain.ts";
import { AxiosResponse } from "axios";

export const deleteComplaintReply = async (
  complaintId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.delete<void>(
    `/admin/complaints/${complaintId}`,
  );
  console.log(response);
  return response;
};

// 관리자용 민원 전체 조회 (최신순)
export const getAllComplaints = async (): Promise<
  AxiosResponse<AdminComplaint[]>
> => {
  const response =
    await tokenInstance.get<AdminComplaint[]>(`/admin/complaints`);
  console.log(response);
  return response;
};

// 관리자용 민원 상세 조회
export const getAdminComplaintDetail = async (
  complaintId: number,
): Promise<AxiosResponse<ComplaintDetail>> => {
  const response = await tokenInstance.get<ComplaintDetail>(
    `/admin/complaints/${complaintId}`,
  );
  console.log(response);
  return response;
};

// 관리자용 민원 상태 변경
export const updateComplaintStatus = async (
  complaintId: number,
  status: string,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.patch<void>(
    `/admin/complaints/${complaintId}/status`,
    { status },
  );
  console.log(response);
  return response;
};

// 관리자용 민원 담당자 배정
export const assignComplaintOfficer = async (
  complaintId: number,
  officer: string,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.patch<void>(
    `/admin/complaints/${complaintId}/officer/${officer}`,
  );
  console.log(response);
  return response;
};

// 관리자용 민원 답변 수정
export const updateComplaintReply = async (
  complaintId: number,
  dto: ComplaintReplyDto,
  files?: File[],
): Promise<AxiosResponse<ComplaintReplyResponse>> => {
  const formData = new FormData();
  formData.append("dto", JSON.stringify(dto));

  if (files) {
    files.forEach((file) => formData.append("files", file));
  }

  const response = await tokenInstance.put<ComplaintReplyResponse>(
    `/admin/complaints/${complaintId}/reply`,
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

// 민원 등록
export const createComplaintReply = async (
  complaintId: number,
  dto: ComplaintReplyDto,
  files?: File[],
): Promise<AxiosResponse<ComplaintResponse>> => {
  const formData = new FormData();
  formData.append("dto", JSON.stringify(dto));

  if (files) {
    files.forEach((file) => formData.append("files", file));
  }

  const response = await tokenInstance.post<ComplaintResponse>(
    `/admin/complaints/${complaintId}/reply`,
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

/**
 * 민원 검색
 * GET /admin/complaints/search
 * @param dto 검색 조건 (쿼리 파라미터)
 * @returns 민원 목록 응답
 */
export const searchComplaints = async (
  dto: ComplaintSearchDto,
): Promise<AxiosResponse<AdminComplaint[]>> => {
  // dto 객체가 axios에 의해 URL 쿼리 파라미터로 변환됩니다.
  const response = await tokenInstance.get<AdminComplaint[]>(
    `/admin/complaints/search`,
    {
      params: dto,
    },
  );

  console.log(response);
  return response;
};
