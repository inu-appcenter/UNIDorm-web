import styled from "styled-components";
import MyInfoArea from "../components/mypage/MyInfoArea.tsx";
import MenuGroup from "../components/mypage/MenuGroup.tsx";
import React from "react";

const menuGroups = [
  {
    title: "내 계정",
    menus: [
      { label: "프로필 수정", path: "/profile/edit" },
      { label: "사전 체크리스트 수정", path: "/roommatechecklist" },
    ],
  },
  {
    title: "커뮤니티",
    menus: [
      { label: "내 게시글 보기", path: "/community/posts" },
      { label: "스크랩한 글 보기", path: "/community/liked" },
      { label: "좋아요한 글 보기", path: "/community/liked" },
    ],
  },
  {
    title: "룸메이트",
    menus: [
      { label: "룸메이트 등록하기", path: "/roommate/apply" },
      { label: "룸메이트 해제하기", path: "/roommate/result" },
    ],
  },
  {
    title: undefined,
    menus: [
      { label: "1:1 문의", path: "/roommate/apply" },
      { label: "서비스 정보", path: "/roommate/result" },
      { label: "로그아웃", path: "/login" },
    ],
  },
];

const MyPage = () => {
  return (
    <MyPageWrapper>
      <MyInfoArea />
      <Divider />
      {menuGroups.map((group, idx) => (
        <React.Fragment key={idx}>
          <MenuGroup title={group.title} menus={group.menus} />
          {idx < menuGroups.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </MyPageWrapper>
  );
};

export default MyPage;

const MyPageWrapper = styled.div`
  padding: 90px 20px;
  padding-bottom: 120px;

  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;

  //background: #fafafa;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e0e0e0; /* 연한 회색 */
  width: 100%;
`;
