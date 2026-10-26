import { useQuery } from "@tanstack/react-query";
import { getComplaintDetail, getMyComplaints } from "@/apis/complain";
import {
  getAdminComplaintDetail,
  getAdminComplaints,
  getAllComplaints,
} from "@/apis/complainAdmin";
import type { ComplaintSearchDto } from "@/types/complain";

export const complaintKeys = {
  all: ["complaints"] as const,
  mine: () => ["complaints", "mine"] as const,
  detail: (id: number, asAdmin: boolean) =>
    ["complaints", "detail", id, asAdmin ? "admin" : "user"] as const,
  admin: (filters: ComplaintSearchDto | null) =>
    ["complaints", "admin", filters] as const,
};

/** 내 민원 목록. */
export const useMyComplaints = (enabled = true) =>
  useQuery({
    queryKey: complaintKeys.mine(),
    queryFn: async () => (await getMyComplaints()).data,
    enabled,
  });

/** 민원 상세. 관리자는 관리자용 API(담당자·처리 정보 포함)로 조회합니다. */
export const useComplaintDetail = (
  id: number | undefined,
  { asAdmin = false }: { asAdmin?: boolean } = {},
) =>
  useQuery({
    queryKey: complaintKeys.detail(id ?? 0, asAdmin),
    queryFn: async () =>
      (asAdmin
        ? await getAdminComplaintDetail(id!)
        : await getComplaintDetail(id!)
      ).data,
    enabled: !!id,
  });

/**
 * 관리자: 민원 목록/검색 단일화 API.
 * 신규 규격(GET /admin/complaints?params)을 우선 호출하며,
 * 백엔드 마이그레이션 과도기 중 구버전(/search) 및 전체 조회로 이중 안전 폴백을 수행합니다.
 */
export const useAdminComplaints = (
  filters: ComplaintSearchDto | null,
  enabled = true,
) =>
  useQuery({
    queryKey: complaintKeys.admin(filters),
    queryFn: async () => {
      try {
        const response = await getAdminComplaints(filters || undefined);
        return response.data;
      } catch (err) {
        console.warn(
          "getAdminComplaints 실패, 레거시 전체 조회로 최종 폴백을 시도합니다:",
          err,
        );
        const fallback = await getAllComplaints();
        return fallback.data;
      }
    },
    enabled,
    placeholderData: (previous) => previous,
  });
