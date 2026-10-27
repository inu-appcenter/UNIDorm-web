// 민원 답변 삭제 (관리자용)
import tokenInstance from "./tokenInstance.ts";
import {
  AdminComplaint,
  ComplaintCursorPageResponse,
  ComplaintDetail,
  ComplaintReplyDto,
  ComplaintReplyResponse,
  ComplaintResponse,
  ComplaintSearchDto,
} from "@/types/complain";
import { AxiosResponse } from "axios";
import { ManagedFile } from "@/hooks/useFileHandler";
import { formatBuildingForServer } from "@/constants/constants";

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
type ComplaintApiResponseData =
  | AdminComplaint[]
  | {
      content?: AdminComplaint[];
      complaints?: AdminComplaint[];
      hasNext?: boolean;
      nextCursor?: number | null;
    };

export const adaptAdminComplaintListResponse = (
  raw: any,
): ComplaintCursorPageResponse<AdminComplaint> => {
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

const normalizeComplaintListResponse = (
  response: AxiosResponse<ComplaintApiResponseData>,
): AxiosResponse<AdminComplaint[]> => {
  const data = Array.isArray(response.data)
    ? response.data
    : response.data?.content || response.data?.complaints || [];
  return { ...response, data };
};

// 검색 DTO 정규화 (building 'A동' -> 'A' 등 백엔드 enum 매핑 방어)
const normalizeSearchDto = (dto?: ComplaintSearchDto): ComplaintSearchDto | undefined => {
  if (!dto || Object.keys(dto).length === 0) return undefined;
  const normalized = { ...dto };
  if (normalized.building) {
    normalized.building = formatBuildingForServer(normalized.building);
  }
  return normalized;
};

// 관리자용 민원 전체 조회 (최신순 / 하위 호환성 유지)
export const getAllComplaints = async (): Promise<
  AxiosResponse<AdminComplaint[]>
> => {
  const response = await tokenInstance.get<ComplaintApiResponseData>(`/admin/complaints`);
  return normalizeComplaintListResponse(response);
};

// 관리자용 민원 목록/검색 통합 조회
// 구버전 서버(/admin/complaints/search) 및 신규 단일화 규격(/admin/complaints) 양방향 자동 폴백
export const getAdminComplaints = async (
  dto?: ComplaintSearchDto,
): Promise<AxiosResponse<AdminComplaint[]>> => {
  const normalized = normalizeSearchDto(dto);
  const hasFilter = Boolean(normalized && Object.keys(normalized).length > 0);

  // 1. 조건이 없는 순수 전체 목록 조회는 항상 GET /admin/complaints 호출
  if (!hasFilter) {
    return getAllComplaints();
  }

  // 2. 검색 조건이 있는 경우:
  // 레거시 서버 환경에서는 GET /admin/complaints/search 가 검색을 처리하므로 우선 호출하고,
  // 신규 단일화 규격이 배포되어 /search 가 404가 되면 GET /admin/complaints 로 안전하게 폴백합니다.
  try {
    const searchRes = await tokenInstance.get<ComplaintApiResponseData>(
      `/admin/complaints/search`,
      { params: normalized },
    );
    return normalizeComplaintListResponse(searchRes);
  } catch (searchError) {
    console.warn(
      "구버전 검색 API(/admin/complaints/search) 실패, 신규 단일화 API(/admin/complaints)로 폴백 시도:",
      searchError,
    );
    try {
      const unifiedRes = await tokenInstance.get<ComplaintApiResponseData>(
        `/admin/complaints`,
        { params: normalized },
      );
      return normalizeComplaintListResponse(unifiedRes);
    } catch (unifiedError) {
      console.error("신규 단일화 API 폴백도 실패했습니다:", unifiedError);
      throw searchError;
    }
  }
};


// 관리자용 민원 목록 커서 페이징 조회 (신규 규격)
export const getAdminComplaintsPage = async (
  dto?: ComplaintSearchDto,
): Promise<AxiosResponse<ComplaintCursorPageResponse<AdminComplaint>>> => {
  const normalized = normalizeSearchDto(dto);
  const response = await tokenInstance.get<ComplaintApiResponseData>(
    `/admin/complaints`,
    { params: normalized },
  );
  return {
    ...response,
    data: adaptAdminComplaintListResponse(response.data),
  };
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
