// hooks/useIsAdminRole.ts
import useUserStore from "../stores/useUserStore.ts";

export const useIsAdminRole = (): boolean => {
  const { tokenInfo } = useUserStore();

  const adminRoles: string[] = [
    "ROLE_ADMIN",
    "ROLE_DORM_MANAGER",
    "ROLE_DORM_LIFE_MANAGER",
    "ROLE_DORM_ROOMMATE_MANAGER",
  ];

  return !!tokenInfo?.role && adminRoles.includes(tokenInfo.role);
};
