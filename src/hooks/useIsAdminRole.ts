// hooks/useIsAdminRole.ts
import useUserStore from "../stores/useUserStore.ts";

type RoleInfo = {
  isAdmin: boolean;
  isDormAdmin: boolean;
  isSupporters: boolean;
  isMainAdmin: boolean;
  roleName: string;
};

export const useIsAdminRole = (): RoleInfo => {
  const { tokenInfo } = useUserStore();

  const roleMap: Record<string, string> = {
    ROLE_ADMIN: "관리자",
    ROLE_DORM_MANAGER: "생활원 관리자",
    ROLE_DORM_LIFE_MANAGER: "생활민원 담당",
    ROLE_DORM_ROOMMATE_MANAGER: "룸메이트민원 담당",
    ROLE_DORM_SUPPORTERS: "서포터즈",
    ROLE_USER: "일반 사용자",
  };

  const role = tokenInfo?.role ?? "ROLE_USER";
  const isAdmin =
    role === "ROLE_ADMIN" ||
    role === "ROLE_DORM_MANAGER" ||
    role === "ROLE_DORM_LIFE_MANAGER" ||
    role === "ROLE_DORM_ROOMMATE_MANAGER" ||
    role === "ROLE_DORM_SUPPORTERS";
  const isDormAdmin =
    role === "ROLE_DORM_MANAGER" ||
    role === "ROLE_DORM_LIFE_MANAGER" ||
    role === "ROLE_DORM_ROOMMATE_MANAGER";

  const isSupporters = role === "ROLE_DORM_SUPPORTERS";

  const isMainAdmin = role === "ROLE_ADMIN";

  return {
    isAdmin,
    isDormAdmin,
    isSupporters,
    isMainAdmin,
    roleName: roleMap[role] ?? "알 수 없는 권한",
  };
};
