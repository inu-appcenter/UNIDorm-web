import { useQuery } from "@tanstack/react-query";
import { FeatureFlag, getFeatureFlags } from "@/apis/featureFlag";

export const FEATURE_FLAGS_QUERY_KEY = ["featureFlags"] as const;

type FeatureFlagMap = Record<string, boolean>;

const normalizeFeatureFlagKey = (key: string) => key.trim();

const toFeatureFlagMap = (featureFlags: FeatureFlag[]): FeatureFlagMap =>
  featureFlags.reduce<FeatureFlagMap>((acc, featureFlag) => {
    const normalizedKey = normalizeFeatureFlagKey(featureFlag.key);

    if (!normalizedKey) {
      return acc;
    }

    acc[normalizedKey] = featureFlag.flag;
    return acc;
  }, {});

export const useFeatureFlags = () =>
  useQuery({
    queryKey: FEATURE_FLAGS_QUERY_KEY,
    queryFn: async () => {
      const response = await getFeatureFlags();
      return toFeatureFlagMap(response.data);
    },
  });

export const useFeatureFlag = (key: string, defaultValue = false) => {
  const query = useFeatureFlags();

  return {
    ...query,
    flag: query.data?.[key] ?? defaultValue,
  };
};
