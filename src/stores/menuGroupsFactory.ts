import { TFunction } from "i18next";
import { MenuGroup } from "@/types/mypage";
import { PATHS } from "@/constants/paths";
import { guardAppOnly, guardLogin } from "@/utils/guard";

// 마이페이지용 메뉴 그룹
export const createMyPageMenuGroups = (
  isLoggedIn: boolean,
  navigate: (path: string) => void,
  t: TFunction<["mypage", "common"]>,
): MenuGroup[] => [
  {
    title: t("mypage:menuGroups.account.title"),
    menus: [
      {
        label: t("mypage:menuGroups.account.editInfo"),
        onClick: () => navigate(PATHS.MYINFO_EDIT),
      },
      {
        label: t("mypage:menuGroups.account.checklist"),
        onClick: () => navigate(PATHS.ROOMMATE.CHECKLIST),
      },
      {
        label: t("mypage:menuGroups.account.portalAccount"),
        onClick: () => navigate(PATHS.PORTAL_ACCOUNT),
      },
    ],
  },
  {
    title: t("mypage:menuGroups.community.title"),
    menus: [
      {
        label: t("mypage:menuGroups.community.myPosts"),
        onClick: () => navigate(PATHS.MY_POSTS),
      },
      {
        label: t("mypage:menuGroups.community.myLikes"),
        onClick: () => navigate(PATHS.MY_LIKES),
      },
    ],
  },
  {
    title: t("mypage:menuGroups.support.title"),
    menus: [
      {
        label: t("mypage:menuGroups.support.dormitoryGuide"),
        onClick: () => navigate(PATHS.DORMITORY_GUIDE),
      },
      {
        label: t("mypage:menuGroups.support.inquiry"),
        onClick: () =>
          window.open("https://forms.gle/PGkiDutmmT8gzddF7", "_blank"),
      },
      {
        label: t("mypage:menuGroups.support.serviceInfo"),
        onClick: () => navigate(PATHS.ONBOARDING),
      },
      {
        label: t("mypage:menuGroups.support.appCenter"),
        onClick: () => window.open("https://home.inuappcenter.kr", "_blank"),
      },
      ...(isLoggedIn
        ? [
            {
              label: t("mypage:menuGroups.support.logout"),
              onClick: () => {
                if (window.confirm(t("mypage:menuGroups.support.logoutConfirm"))) {
                  navigate(PATHS.LOGOUT);
                }
              },
            },
          ]
        : []),
    ],
  },
];

// 설정 페이지용 메뉴 그룹
export const createSettingsMenuGroups = (
  navigate: (path: string) => void,
  isLoggedIn: boolean,
  t: TFunction<["mypage", "common"]>,
): MenuGroup[] => [
  {
    title: t("mypage:menuGroups.notiSettings.title"),
    menus: [
      {
        label: t("mypage:menuGroups.notiSettings.push"),
        onClick: () => {
          if (!guardLogin(isLoggedIn, navigate)) return;
          if (!guardAppOnly()) return;

          navigate(PATHS.NOTI_SETTING);
        },
      },
      {
        label: t("mypage:menuGroups.notiSettings.groupPurchaseKeyword"),
        onClick: () => {
          if (!guardLogin(isLoggedIn, navigate)) return;
          if (!guardAppOnly()) return;

          navigate(PATHS.GROUP_PURCHASE.KEYWORD_SETTING);
        },
      },
    ],
  },
];
