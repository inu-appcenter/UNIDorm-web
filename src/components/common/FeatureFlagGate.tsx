import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import { PATHS } from "@/constants/paths";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";

interface FeatureFlagGateProps {
  children: ReactNode;
  fallbackPath?: string;
  flagKey: string;
}

export default function FeatureFlagGate({
  children,
  fallbackPath = PATHS.LOGIN,
  flagKey,
}: FeatureFlagGateProps) {
  const { flag, isLoading } = useFeatureFlag(flagKey);

  if (isLoading) {
    return <LoadingSpinner overlay message="페이지를 불러오는 중..." />;
  }

  if (!flag) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
