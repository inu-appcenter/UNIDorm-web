import { useQuery } from "@tanstack/react-query";
import { FeatureFlag, getFeatureFlags } from "@/apis/featureFlag";

export const FEATURE_FLAGS_QUERY_KEY = ["featureFlags"] as const;

type FeatureFlagMap = Record<string, boolean>;

const toFeatureFlagMap = (featureFlags: FeatureFlag[]): FeatureFlagMap =>
  featureFlags.reduce<FeatureFlagMap>((acc, featureFlag) => {
    acc[featureFlag.key] = featureFlag.flag;
    return acc;
  }, {});

export const useFeatureFlags = () =>
  useQuery({
    queryKey: FEATURE_FLAGS_QUERY_KEY,
    queryFn: async () => {
      const response = await getFeatureFlags();
      return toFeatureFlagMap(response.data);
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

export const useFeatureFlag = (key: string, defaultValue = false) => {
  const query = useFeatureFlags();

  return {
    ...query,
    flag: query.data?.[key] ?? defaultValue,
  };
};
