import { useQuery } from "@tanstack/react-query";
import { getFcmStats } from "@/apis/fcm";
import { FeatureFlag, getFeatureFlags } from "@/apis/featureFlag";
import { getAdminOpenChatRooms } from "@/apis/openchat";
import { getOpenChatReports, OpenChatReportStatus } from "@/apis/report";
import { getStatistics, getStatisticsTotal } from "@/apis/admin/statistics";

export const adminKeys = {
  all: ["admin"] as const,
  featureFlags: () => [...adminKeys.all, "featureFlags"] as const,
  fcmStats: () => [...adminKeys.all, "fcmStats"] as const,
  openChatRooms: () => [...adminKeys.all, "openChatRooms"] as const,
  openChatReports: (status?: OpenChatReportStatus, page?: number) =>
    [...adminKeys.all, "openChatReports", { status, page }] as const,
  statistics: (
    date?: string,
    from?: string,
    to?: string,
    apiPath?: string,
  ) => [...adminKeys.all, "statistics", { date, from, to, apiPath }] as const,
  statisticsTotal: (apiPath?: string, from?: string, to?: string) =>
    [...adminKeys.all, "statisticsTotal", { apiPath, from, to }] as const,
};

export const useAdminFeatureFlags = (options?: { enabled?: boolean }) =>
  useQuery<FeatureFlag[]>({
    queryKey: adminKeys.featureFlags(),
    queryFn: () => getFeatureFlags().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
    ...options,
  });

export const useFcmStatsQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: adminKeys.fcmStats(),
    queryFn: () => getFcmStats().then((res) => res.data),
    staleTime: 1000 * 30,
    ...options,
  });

export const useAdminOpenChatRooms = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: adminKeys.openChatRooms(),
    queryFn: () => getAdminOpenChatRooms().then((res) => res.data),
    staleTime: 1000 * 60,
    ...options,
  });

export const useOpenChatReports = (
  status: OpenChatReportStatus,
  page: number,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: adminKeys.openChatReports(status, page),
    queryFn: () => getOpenChatReports(status, page).then((res) => res.data),
    staleTime: 1000 * 30,
    ...options,
  });

export const useStatisticsQuery = (
  params: {
    date?: string;
    from?: string;
    to?: string;
    apiPath?: string;
  },
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: adminKeys.statistics(
      params.date,
      params.from,
      params.to,
      params.apiPath,
    ),
    queryFn: () =>
      getStatistics(
        params.date,
        params.from,
        params.to,
        params.apiPath,
      ).then((res) => res.data),
    staleTime: 1000 * 60,
    ...options,
  });

export const useStatisticsTotalQuery = (
  params: {
    apiPath?: string;
    from?: string;
    to?: string;
  },
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: adminKeys.statisticsTotal(
      params.apiPath,
      params.from,
      params.to,
    ),
    queryFn: () =>
      getStatisticsTotal(params.apiPath ?? "", params.from, params.to).then(
        (res) => res.data,
      ),
    staleTime: 1000 * 60,
    ...options,
  });
