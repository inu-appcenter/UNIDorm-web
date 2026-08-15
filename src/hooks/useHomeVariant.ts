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

/**
 * 로그인 사용자의 홈 화면 A/B 배정값을 서버(GET /features/ab/{key})에서 조회합니다.
 * - 비로그인: 항상 B(신규 홈), API 호출 안 함
 * - 로그인: group이 "A"/"B"면 그대로 사용, 실험이 꺼져있는 "OFF"면 B로 폴백
 * - 개발 모드에서는 localStorage(HOME_AB_DEV_OVERRIDE_KEY)로 강제 override 가능 (QA용)
 */
export const useHomeVariant = (): UseHomeVariantResult => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const { data, isLoading } = useQuery({
    queryKey: ["homeAbTestGroup", HOME_AB_EXPERIMENT_KEY, tokenInfo.accessToken],
    queryFn: async () => {
      const response = await getAbTestGroup(HOME_AB_EXPERIMENT_KEY);
      return response.data;
    },
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
  });

  const variant = useMemo<HomeVariant>(() => {
    if (!isLoggedIn) return "B";

    if (import.meta.env.DEV) {
      const devOverride = localStorage.getItem(HOME_AB_DEV_OVERRIDE_KEY);
      if (devOverride === "A" || devOverride === "B") return devOverride;
    }

    if (data?.group === "A" || data?.group === "B") return data.group;
    return "B"; // OFF 이거나 아직 응답 전이면 신규 홈으로 폴백
  }, [isLoggedIn, data]);

  return {
    variant,
    isLoggedIn,
    isLoading: isLoggedIn && isLoading,
    abTestGroup: data ?? null,
  };
};
