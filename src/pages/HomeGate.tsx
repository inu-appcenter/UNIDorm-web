import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HomePage from "./HomePage";
import HomePageOld from "./HomePageOld";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  HomeVariant,
  useHomeVariant,
} from "@/hooks/useHomeVariant";
import { mixpanelTrack } from "@/utils/mixpanel";

const SESSION_EXPOSURE_KEY = "home_ab_exposure_sent";
const LAST_VARIANT_KEY = "home_ab_last_variant";

/**
 * /home 공용 진입점.
 * 서버(GET /features/ab/{key})가 응답하는 A/B 배정값(useHomeVariant)에 따라
 * URL 리다이렉트 없이 동일한 /home 경로에서 배정된 화면(A: HomePageOld, B: HomePage)을 렌더링하고
 * 실험 관련 mixpanel 이벤트를 기록한다.
 */
export default function HomeGate() {
  const location = useLocation();
  const { variant, isLoading, abTestGroup } = useHomeVariant(location.search);

  useEffect(() => {
    if (isLoading) return;

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
        entrySource: "home_url",
      });
      sessionStorage.setItem(SESSION_EXPOSURE_KEY, "1");
      localStorage.setItem(LAST_VARIANT_KEY, variant);
    }
  }, [isLoading, variant, abTestGroup]);

  if (isLoading) {
    return <LoadingSpinner message="홈을 불러오고 있어요!" />;
  }

  return variant === "A" ? <HomePageOld /> : <HomePage />;
}
