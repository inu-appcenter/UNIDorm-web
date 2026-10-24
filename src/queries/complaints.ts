import { useQuery } from "@tanstack/react-query";
import { getComplaintDetail, getMyComplaints } from "@/apis/complain";
import {
  getAdminComplaintDetail,
  getAllComplaints,
  searchComplaints,
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

/** 관리자: 전체 민원, 또는 `filters` 로 검색한 민원. */
export const useAdminComplaints = (
  filters: ComplaintSearchDto | null,
  enabled = true,
) =>
  useQuery({
    queryKey: complaintKeys.admin(filters),
    queryFn: async () =>
      (filters ? await searchComplaints(filters) : await getAllComplaints())
        .data,
    enabled,
    placeholderData: (previous) => previous,
  });
