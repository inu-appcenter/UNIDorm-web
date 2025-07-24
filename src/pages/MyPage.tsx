import styled from "styled-components";
import MyInfoArea from "../components/mypage/MyInfoArea.tsx";
import MenuGroup from "../components/mypage/MenuGroup.tsx";
import React from "react";
import Header from "../components/common/Header.tsx";
import useUserStore from "../stores/useUserStore.ts";
import { useNavigate } from "react-router-dom";

const menuGroups = [
  {
    title: "내 계정",
    menus: [
      { label: "내 정보 수정", path: "/myinfoedit" },
      { label: "사전 체크리스트 등록/수정", path: "/roommatechecklist" },
    ],
  },
  {
    title: "커뮤니티",
    menus: [
      { label: "내 게시글 보기", path: "/myposts" },
      { label: "스크랩한 글 보기", path: "/scrap" },
      { label: "좋아요한 글 보기", path: "/liked" },
    ],
  },
  {
    title: "룸메이트",
    menus: [
      { label: "내 룸메이트", path: "/myroommate" },
      { label: "룸메이트 등록하기", path: "/roommateadd" },
      { label: "룸메이트 해제하기", path: "/roommate/result" },
    ],
  },
  {
    title: undefined,
    menus: [
      { label: "1:1 문의", path: "/roommate/apply" },
      { label: "서비스 정보", path: "/roommate/result" },
      { label: "로그아웃", path: "/logout" },
    ],
  },
];

const MyPage = () => {
  const { tokenInfo } = useUserStore();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  return (
    <MyPageWrapper>
      <Header title={"마이페이지"} showAlarm={true} />
      {isLoggedIn ? (
        <InfoAreaWrapper>
          <MyInfoArea />
        </InfoAreaWrapper>
      ) : (
        <InfoAreaWrapper>
          <LoginMessage
            onClick={() => {
              navigate("/login");
            }}
          >
            로그인을 해주세요<span className={"go"}>{">"}</span>
          </LoginMessage>
        </InfoAreaWrapper>
      )}

      <MenuGroupsWrapper>
        {menuGroups.map((group, idx) => (
          <React.Fragment key={idx}>
            <MenuGroup title={group.title} menus={group.menus} />
            {idx < menuGroups.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </MenuGroupsWrapper>
    </MyPageWrapper>
  );
};
export default MyPage;

const MyPageWrapper = styled.div`
  padding: 90px 16px;
  padding-bottom: 120px;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;
`;

const MenuGroupsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e0e0e0; /* 연한 회색 */
  width: 100%;
`;

const LoginMessage = styled.div`
  text-align: start;
  font-size: 18px;
  font-weight: 500;
  color: black;
  height: fit-content;
  .go {
    font-size: 16px;
    margin-left: 5px;
    font-weight: 300;
  }
`;

const InfoAreaWrapper = styled.div`
  margin-bottom: 24px; /* 원하는 여백 크기 */
`;
