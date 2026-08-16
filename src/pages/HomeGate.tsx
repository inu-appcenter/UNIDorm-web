import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import HomePage from "./HomePage";
import HomePageOld from "./HomePageOld";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  HomeVariant,
  useHomeVariant,
} from "@/hooks/useHomeVariant";
import { mixpanelTrack } from "@/utils/mixpanel";
import { PATHS } from "@/constants/paths";

const SESSION_EXPOSURE_KEY = "home_ab_exposure_sent";
const LAST_VARIANT_KEY = "home_ab_last_variant";

/**
 * /home, /home-old 공용 진입점.
 * 서버(GET /features/ab/{key})가 응답하는 A/B 배정값(useHomeVariant)에 맞는 경로가 아니면
 * 그 경로로 리다이렉트하고, 배정값에 맞는 홈 화면(A: HomePageOld, B: HomePage)을 렌더링하면서
 * 실험 관련 mixpanel 이벤트를 기록한다.
 */
export default function HomeGate() {
  const location = useLocation();
  const { variant, isLoading, abTestGroup } = useHomeVariant(location.search);

  const expectedPath = variant === "A" ? PATHS.HOME_OLD : PATHS.HOME;
  const isOnExpectedPath = location.pathname === expectedPath;
  const entrySource =
    expectedPath === PATHS.HOME_OLD ? "home_old_url" : "home_url";

  useEffect(() => {
    if (isLoading || !isOnExpectedPath) return;

    mixpanelTrack.homeViewed(variant);

    if (!sessionStorage.getItem(SESSION_EXPOSURE_KEY)) {
      const previousVariant = localStorage.getItem(
        LAST_VARIANT_KEY,
      ) as HomeVariant | null;
      mixpanelTrack.homeAbTestAssigned({
        variant,
        experimentId: abTestGroup?.experimentId,
        userId: abTestGroup?.userId,
        userType: abTestGroup?.userType,
        timestamp: abTestGroup?.timestamp,
        previousVariant,
        entrySource,
      });
      sessionStorage.setItem(SESSION_EXPOSURE_KEY, "1");
      localStorage.setItem(LAST_VARIANT_KEY, variant);
    }
  }, [isLoading, isOnExpectedPath, variant, abTestGroup, entrySource]);

  if (isLoading) {
    return <LoadingSpinner message="홈을 불러오고 있어요!" />;
  }

  if (!isOnExpectedPath) {
    return <Navigate to={expectedPath} replace />;
  }

  return variant === "A" ? <HomePageOld /> : <HomePage />;
}
