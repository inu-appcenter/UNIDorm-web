// menuGroupsFactory.ts

import { MenuGroup } from "../types/mypage.ts";

export const createMenuGroups = (
  isLoggedIn: boolean,
  navigate: (path: string) => void,
): MenuGroup[] => [
  {
    title: "내 계정",
    menus: [
      { label: "내 정보 수정", onClick: () => navigate("/myinfoedit") },
      {
        label: "사전 체크리스트 등록/수정",
        onClick: () => navigate("/roommatechecklist"),
      },
    ],
  },
  {
    title: "커뮤니티",
    menus: [
      { label: "내 게시글 보기", onClick: () => navigate("/myposts") },
      { label: "스크랩한 글 보기", onClick: () => navigate("/scrap") },
      { label: "좋아요한 글 보기", onClick: () => navigate("/liked") },
    ],
  },
  {
    title: "룸메이트",
    menus: [
      { label: "내 룸메이트", onClick: () => navigate("/myroommate") },
      { label: "룸메이트 등록하기", onClick: () => navigate("/roommateadd") },
      {
        label: "룸메이트 해제하기",
        onClick: () => {
          console.log("클릭됨");
        },
      },
    ],
  },
  {
    title: undefined,
    menus: [
      { label: "1:1 문의", onClick: () => navigate("/roommate/apply") },
      {
        label: "서비스 정보",
        onClick: () => {
          navigate("/onboarding");
        },
      },
      ...(isLoggedIn
        ? [
            {
              label: "로그아웃",
              onClick: () => {
                if (window.confirm("정말 로그아웃하시겠어요?")) {
                  navigate("/logout");
                }
              },
            },
          ]
        : []),
    ],
  },
];
