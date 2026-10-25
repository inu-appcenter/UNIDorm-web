// 민원 답변 삭제 (관리자용)
import tokenInstance from "./tokenInstance.ts";
import {
  AdminComplaint,
  ComplaintDetail,
  ComplaintReplyDto,
  ComplaintReplyResponse,
  ComplaintResponse,
  ComplaintSearchDto,
} from "@/types/complain";
import { AxiosResponse } from "axios";
import { ManagedFile } from "@/hooks/useFileHandler";

export const deleteComplaintReply = async (
  complaintId: number,
): Promise<AxiosResponse<void>> => {
  const response = await tokenInstance.delete<void>(
    `/admin/complaints/${complaintId}`,
  );
  console.log(response);
  return response;
};

// 관리자용 민원 목록 조회 (단일화 API 규격: 검색 조건 및 페이징 파라미터 지원)
// 신버전 서버(/admin/complaints?params)와 구버전 서버(/admin/complaints/search) 간 양방향 무중단 폴백 제공
type ComplaintApiResponseData = AdminComplaint[] | { content?: AdminComplaint[]; complaints?: AdminComplaint[] };

export const getAdminComplaints = async (
  dto?: ComplaintSearchDto,
): Promise<AxiosResponse<AdminComplaint[]>> => {
  try {
    const response = await tokenInstance.get<ComplaintApiResponseData>(`/admin/complaints`, {
      params: dto && Object.keys(dto).length > 0 ? dto : undefined,
    });
    // 응답 형태가 페이징 객체(content/complaints) 또는 순수 배열 모두 지원
    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.content || response.data?.complaints || [];
    return { ...response, data };
  } catch (error) {
    // 만약 신버전 엔드포인트에서 조건부 쿼리 처리 실패 시, 구버전 검색 API(/admin/complaints/search)로 자동 폴백
    if (dto && Object.keys(dto).length > 0) {
      try {
        const fallbackRes = await tokenInstance.get<ComplaintApiResponseData>(
          `/admin/complaints/search`,
          { params: dto },
        );
        const data = Array.isArray(fallbackRes.data)
          ? fallbackRes.data
          : fallbackRes.data?.content || fallbackRes.data?.complaints || [];
        return { ...fallbackRes, data };
      } catch (fallbackError) {
        console.error("구버전 검색 API 폴백 실패:", fallbackError);
      }
    }
    throw error;
  }
};

// 관리자용 민원 전체 조회 (최신순 / 하위 호환성 유지)
export const getAllComplaints = async (): Promise<
  AxiosResponse<AdminComplaint[]>
> => {
  return getAdminComplaints();
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
  files?: ManagedFile[],
): Promise<AxiosResponse<ComplaintReplyResponse>> => {
  const formData = new FormData();
  formData.append("dto", JSON.stringify(dto));

  if (files) {
    files.forEach((file) => formData.append("files", file.file));
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
  files?: ManagedFile[],
): Promise<AxiosResponse<ComplaintResponse>> => {
  const formData = new FormData();
  formData.append("dto", JSON.stringify(dto));

  if (files) {
    files.forEach((file) => formData.append("files", file.file));
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
 * 민원 검색 (하위 호환성 유지)
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

// 민원 목록 CSV 다운로드
export const downloadComplaintsCSV = async (): Promise<AxiosResponse<Blob>> => {
  const response = await tokenInstance.get<Blob>(
    `/admin/complaints/export/csv`,
    {
      responseType: "blob", // 바이너리 데이터 수신
      headers: {
        Accept: "application/octet-stream",
      },
    },
  );
  console.log(response);
  return response;
};

// 검색 조건에 맞는 민원 CSV 다운로드
export const downloadFilteredComplaintsCSV = async (
  params: ComplaintSearchDto,
): Promise<AxiosResponse<Blob>> => {
  const response = await tokenInstance.get<Blob>(
    `/admin/complaints/export/csv/search`,
    {
      params,
      responseType: "blob",
      headers: {
        Accept: "application/octet-stream",
      },
    },
  );
  return response;
};
