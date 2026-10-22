import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "@/stores/useUserStore";
import { AbTestGroup, getAbTestGroup } from "@/apis/featureFlag";

export type AbVariant = "A" | "B";

export interface UseAbTestOptions {
  search?: string;
  fallbackGroup?: AbVariant;
}

export interface UseAbTestResult {
  group: AbVariant;
  rawGroup: "A" | "B" | "OFF";
  isLoggedIn: boolean;
  isLoading: boolean;
  abTestGroup: AbTestGroup | null;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface CachedAbTest {
  data: AbTestGroup;
  cachedAt: number;
}

const getStorageKey = (experimentKey: string, userKey: string) =>
  `ab_test_cache_${experimentKey}_${userKey}`;

const getDevOverrideKey = (experimentKey: string) =>
  `ab_test_dev_override_${experimentKey}`;

const getCachedAbTest = (
  experimentKey: string,
  userKey: string,
): CachedAbTest | null => {
  if (!userKey || !experimentKey) return null;
  try {
    const raw = localStorage.getItem(getStorageKey(experimentKey, userKey));
    if (!raw) return null;
    return JSON.parse(raw) as CachedAbTest;
  } catch {
    return null;
  }
};

const setCachedAbTest = (
  experimentKey: string,
  userKey: string,
  data: AbTestGroup,
) => {
  if (!userKey || !experimentKey) return;
  try {
    const payload: CachedAbTest = {
      data,
      cachedAt: Date.now(),
    };
    localStorage.setItem(
      getStorageKey(experimentKey, userKey),
      JSON.stringify(payload),
    );
  } catch (error) {
    console.error(`Failed to cache AB test [${experimentKey}]:`, error);
  }
};

/**
 * 범용 A/B 테스트 배정 훅 (GET /features/ab/{experimentKey})
 * - 유저 ID(또는 토큰)별로 1일간 독립 캐싱하여 불필요한 API 호출 방지
 * - 비로그인 시 fallbackGroup 반환
 * - 개발 모드에서는 URL 쿼리(?abVariant_{experimentKey}=A|B) 또는 localStorage로 강제 override 가능
 */
export const useAbTest = (
  experimentKey: string,
  options?: UseAbTestOptions,
): UseAbTestResult => {
  const { fallbackGroup = "A", search } = options ?? {};
  const { tokenInfo, userInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const userKey = userInfo.id
    ? String(userInfo.id)
    : tokenInfo.accessToken
      ? tokenInfo.accessToken.slice(-20)
      : "";

  const cached = useMemo(
    () => getCachedAbTest(experimentKey, userKey),
    [experimentKey, userKey],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["abTestGroup", experimentKey, userKey],
    queryFn: async () => {
      const response = await getAbTestGroup(experimentKey);
      setCachedAbTest(experimentKey, userKey, response.data);
      return response.data;
    },
    enabled: isLoggedIn && Boolean(experimentKey),
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.cachedAt,
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS * 7,
  });

  const rawGroup = data?.group ?? "OFF";

  const group = useMemo<AbVariant>(() => {
    // 1. 개발 모드 override
    if (import.meta.env.DEV) {
      const searchParams = new URLSearchParams(search ?? window.location.search);
      const qp =
        searchParams.get(`abVariant_${experimentKey}`) ??
        searchParams.get("abVariant");
      const devOverrideKey = getDevOverrideKey(experimentKey);

      if (qp === "A" || qp === "B") {
        localStorage.setItem(devOverrideKey, qp);
        return qp;
      } else if (qp === "reset" || qp === "clear") {
        localStorage.removeItem(devOverrideKey);
      }

      const devOverride = localStorage.getItem(devOverrideKey);
      if (devOverride === "A" || devOverride === "B") return devOverride;
    }

    // 2. 비로그인 시 fallback
    if (!isLoggedIn) return fallbackGroup;

    // 3. 서버 배정값
    if (data?.group === "A" || data?.group === "B") return data.group;

    return fallbackGroup;
  }, [experimentKey, search, isLoggedIn, data, fallbackGroup]);

  return {
    group,
    rawGroup,
    isLoggedIn,
    isLoading: isLoggedIn && isLoading && !data,
    abTestGroup: data ?? null,
  };
};
