import type { MigrationBannerVariant } from "@/components/common/MigrationBanner";
import { PATHS } from "@/constants/paths";
import {
  FRESHMAN_LOGIN_FEATURE_FLAG_KEY,
  FRESHMAN_MIGRATION_FEATURE_FLAG_KEY,
} from "@/constants/featureFlags";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import useUserStore from "@/stores/useUserStore";
import { useNavigate } from "react-router-dom";

const STUDENT_NUMBER_PATTERN = /^[0-9]{8,10}$/;
const PORTAL_MIGRATION_GUIDE_MESSAGE =
  "신입생 임시 계정 로그인 페이지로 이동합니다.\n\n이전에 가입하신 임시 계정으로 로그인하신 뒤, 홈 화면 배너에서 포털 계정 통합을 진행해 주세요.\n\n신입생 임시 계정으로 사용하신 적이 없으시다면 이 배너는 무시해 주세요.";
const PORTAL_MIGRATION_UNAVAILABLE_MESSAGE =
  "현재 계정 통합 기능이 비활성화되어 있어 기존 신입생 계정과의 통합을 진행할 수 없습니다.";

export const useFreshmanMigrationBanner = () => {
  const navigate = useNavigate();
  const { flag: isFreshmanLoginEnabled } = useFeatureFlag(
    FRESHMAN_LOGIN_FEATURE_FLAG_KEY,
  );
  const { flag: isFreshmanMigrationEnabled } = useFeatureFlag(
    FRESHMAN_MIGRATION_FEATURE_FLAG_KEY,
  );
  const { tokenInfo, userInfo, isLoading } = useUserStore();

  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const studentNumber = userInfo.studentNumber.trim();

  // isLoading이 false일 때만 정확한 상태를 판별
  const isFreshman =
    !isLoading && isLoggedIn && !STUDENT_NUMBER_PATTERN.test(studentNumber);
  const isPortalAccount =
    !isLoading && isLoggedIn && STUDENT_NUMBER_PATTERN.test(studentNumber);

  const bannerVariant: MigrationBannerVariant = isFreshman
    ? "freshman"
    : "portal";

  const shouldShowMigrationBanner =
    !isLoading &&
    isFreshmanMigrationEnabled &&
    (isFreshman || (isPortalAccount && isFreshmanLoginEnabled));

  const handleMigrationBannerClick = () => {
    if (!isFreshmanMigrationEnabled) {
      alert(PORTAL_MIGRATION_UNAVAILABLE_MESSAGE);
      return;
    }

    if (isFreshman) {
      navigate(PATHS.FRESHMAN_MIGRATION);
      return;
    }

    if (!isFreshmanLoginEnabled) {
      alert(PORTAL_MIGRATION_UNAVAILABLE_MESSAGE);
      return;
    }

    alert(PORTAL_MIGRATION_GUIDE_MESSAGE);
    navigate(PATHS.FRESHMAN_LOGIN);
  };

  return {
    bannerVariant,
    handleMigrationBannerClick,
    isFreshman,
    isPortalAccount,
    shouldShowMigrationBanner,
  };
};
