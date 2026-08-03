import { useQuery } from "@tanstack/react-query";
import { getRoommateMatchingStatus } from "@/apis/roommate";

export const ROOMMATE_MATCHING_STATUS_QUERY_KEY = [
  "roommateMatchingStatus",
] as const;

export const useRoommateMatchingStatus = () => {
  const query = useQuery({
    queryKey: ROOMMATE_MATCHING_STATUS_QUERY_KEY,
    queryFn: async () => {
      const response = await getRoommateMatchingStatus();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    isOpen: query.data?.status === "OPEN",
    isClosed: query.data?.status === "CLOSED",
  };
};
