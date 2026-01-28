import { MenuGroup } from "@/types/mypage";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import { PATHS } from "@/constants/paths";

// 마이페이지용 메뉴 그룹
export const createMyPageMenuGroups = (
  isLoggedIn: boolean,
  navigate: (path: string) => void,
): MenuGroup[] => [
  {
    title: "내 계정",
    menus: [
      { label: "내 정보 수정", onClick: () => navigate(PATHS.MYINFO_EDIT) },
      {
        label: "사전 체크리스트 등록/수정",
        onClick: () => navigate(PATHS.ROOMMATE.CHECKLIST),
      },
    ],
  },
  {
    title: "커뮤니티",
    menus: [
      { label: "내 게시글 보기", onClick: () => navigate(PATHS.MY_POSTS) },
      { label: "좋아요한 글 보기", onClick: () => navigate(PATHS.MY_LIKES) },
    ],
  },
  {
    title: "고객지원",
    menus: [
      {
        label: "1:1 문의",
        onClick: () =>
          window.open("https://forms.gle/PGkiDutmmT8gzddF7", "_blank"),
      },
      { label: "서비스 정보", onClick: () => navigate(PATHS.ONBOARDING) },
      {
        label: "인천대학교 앱센터",
        onClick: () => window.open("https://home.inuappcenter.kr", "_blank"),
      },
      ...(isLoggedIn
        ? [
            {
              label: "로그아웃",
              onClick: () => {
                if (window.confirm("정말 로그아웃하시겠어요?")) {
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
): MenuGroup[] => [
  {
    title: "알림 설정",
    menus: [
      {
        label: "알림 수신 설정",
        onClick: () => {
          const platform = getMobilePlatform();
          if (platform === "android_browser" || platform === "ios_browser") {
            alert("앱 설치 후 사용할 수 있습니다.");
            return;
          }
          navigate(PATHS.NOTI_SETTING);
        },
      },
      {
        label: "공동구매 키워드 알림 설정",
        onClick: () => {
          const platform = getMobilePlatform();
          if (platform === "android_browser" || platform === "ios_browser") {
            alert("앱 설치 후 사용할 수 있습니다.");
            return;
          }
          navigate(PATHS.GROUP_PURCHASE.KEYWORD_SETTING);
        },
      },
    ],
  },
];
