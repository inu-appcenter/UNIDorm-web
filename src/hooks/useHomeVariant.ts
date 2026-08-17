import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useUserStore from "@/stores/useUserStore";
import { AbTestGroup, getAbTestGroup } from "@/apis/featureFlag";
import { HOME_AB_EXPERIMENT_KEY } from "@/constants/experiment";

export type HomeVariant = "A" | "B";

export const HOME_AB_DEV_OVERRIDE_KEY = "home_ab_dev_override";

interface UseHomeVariantResult {
  variant: HomeVariant;
  isLoggedIn: boolean;
  isLoading: boolean;
  abTestGroup: AbTestGroup | null;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface CachedAbTest {
  data: AbTestGroup;
  cachedAt: number;
}

const getStorageKey = (userKey: string) =>
  `home_ab_cache_${HOME_AB_EXPERIMENT_KEY}_${userKey}`;

const getCachedAbTest = (userKey: string): CachedAbTest | null => {
  if (!userKey) return null;
  try {
    const raw = localStorage.getItem(getStorageKey(userKey));
    if (!raw) return null;
    return JSON.parse(raw) as CachedAbTest;
  } catch {
    return null;
  }
};

const setCachedAbTest = (userKey: string, data: AbTestGroup) => {
  if (!userKey) return;
  try {
    const payload: CachedAbTest = {
      data,
      cachedAt: Date.now(),
    };
    localStorage.setItem(getStorageKey(userKey), JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to cache AB test group:", error);
  }
};

/**
 * 로그인 사용자의 홈 화면 A/B 배정값을 서버(GET /features/ab/{key})에서 조회합니다.
 * - 비로그인: 항상 B(신규 홈), API 호출 안 함
 * - 계정별 격리 캐싱: 유저 ID(또는 토큰)별로 1일간 독립 캐싱하여, 다른 계정으로 로그인 시 즉시 새 계정 기준으로 재조회
 * - staleTime(1일) 경과 시 백그라운드에서 배정 그룹 재조회 및 캐시 갱신
 * - 개발 모드에서는 localStorage(HOME_AB_DEV_OVERRIDE_KEY)로 강제 override 가능 (QA용)
 */
export const useHomeVariant = (search?: string): UseHomeVariantResult => {
  const { tokenInfo, userInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const userKey = userInfo.id
    ? String(userInfo.id)
    : tokenInfo.accessToken
      ? tokenInfo.accessToken.slice(-20)
      : "";

  const cached = useMemo(() => getCachedAbTest(userKey), [userKey]);

  const { data, isLoading } = useQuery({
    queryKey: ["homeAbTestGroup", HOME_AB_EXPERIMENT_KEY, userKey],
    queryFn: async () => {
      const response = await getAbTestGroup(HOME_AB_EXPERIMENT_KEY);
      setCachedAbTest(userKey, response.data);
      return response.data;
    },
    enabled: isLoggedIn,
    initialData: cached?.data,
    initialDataUpdatedAt: cached?.cachedAt,
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS * 7,
  });

  const variant = useMemo<HomeVariant>(() => {
    // 1. 개발/테스트 모드: URL 쿼리 파라미터(?homeVariant=A|B) 및 localStorage override를 최우선 적용 (로그인 무관)
    if (import.meta.env.DEV) {
      const searchParams = new URLSearchParams(search ?? window.location.search);
      const qp = searchParams.get("homeVariant");
      if (qp === "A" || qp === "B") {
        localStorage.setItem(HOME_AB_DEV_OVERRIDE_KEY, qp);
        return qp;
      } else if (qp === "reset" || qp === "clear") {
        localStorage.removeItem(HOME_AB_DEV_OVERRIDE_KEY);
      }

      const devOverride = localStorage.getItem(HOME_AB_DEV_OVERRIDE_KEY);
      if (devOverride === "A" || devOverride === "B") return devOverride;
    }

    // 2. 비로그인: 신규 홈(B) 기본
    if (!isLoggedIn) return "B";

    // 3. 서버 배정값 적용
    if (data?.group === "A" || data?.group === "B") return data.group;
    return "B"; // OFF 이거나 아직 응답 전이면 신규 홈으로 폴백
  }, [search, isLoggedIn, data]);

  return {
    variant,
    isLoggedIn,
    isLoading: isLoggedIn && isLoading && !data,
    abTestGroup: data ?? null,
  };
};
