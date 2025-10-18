import styled from "styled-components";
import MyInfoArea from "../components/mypage/MyInfoArea.tsx";
import MenuGroup from "../components/mypage/MenuGroup.tsx";
import { useEffect, useState } from "react";
import Header from "../components/common/Header.tsx";
import useUserStore from "../stores/useUserStore.ts";
import { useNavigate } from "react-router-dom";
import { createMenuGroups } from "../stores/menuGroupsFactory.ts";
import RoomMateInfoArea from "../components/roommate/RoomMateInfoArea.tsx";
import { getMyRoommateInfo } from "../apis/roommate.ts";
import { MyRoommateInfoResponse } from "../types/roommates.ts";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import BottomBar from "../components/common/BottomBar.tsx";
import { useIsAdminRole } from "../hooks/useIsAdminRole.ts";

const MyPage = () => {
  const { tokenInfo } = useUserStore();
  const { isAdmin } = useIsAdminRole();
  const isLoggedIn = Boolean(tokenInfo?.accessToken ?? "");
  const navigate = useNavigate();
  const [roommateInfo, setRoommateInfo] =
    useState<MyRoommateInfoResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  const menuGroups = createMenuGroups(isLoggedIn, navigate);

  useEffect(() => {
    const fetchRoommateInfo = async () => {
      if (!isLoggedIn) return;

      try {
        const res = await getMyRoommateInfo();
        setRoommateInfo(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // alert(
          //   "등록된 내 룸메이트가 없어요!\n룸메이트 탭에서 룸메이트를 찾아보거나, 이미 같이 하기로 한 친구가 있다면 등록해주세요.",
          // );
          setNotFound(true);
        } else {
          console.log("룸메이트 정보를 불러오는 데 실패했습니다." + err);
        }
      }
    };
    fetchRoommateInfo();
  }, []);
  const isProtected = !isLoggedIn;

  return (
    <MyPageWrapper>
      <Header title={"마이페이지"} showAlarm={true} />
      <InfoAreaWrapper>
        {isLoggedIn ? (
          <MyInfoArea />
        ) : (
          <LoginButton onClick={() => navigate("/login")}>
            인천대학교 포털로
            <span className="login"> 로그인</span>하세요
            <span className="go">{">"}</span>
          </LoginButton>
        )}
      </InfoAreaWrapper>

      <MenuGroupsWrapper>
        <ProtectedMenuWrapper disabled={isProtected}>
          <MenuGroup title={menuGroups[0].title} menus={menuGroups[0].menus} />
          {isProtected && (
            <OverlayMessage>로그인 후 사용 가능해요.</OverlayMessage>
          )}
        </ProtectedMenuWrapper>
        <Divider />

        <ProtectedMenuWrapper disabled={isProtected}>
          <MenuGroup title={menuGroups[2].title} menus={menuGroups[2].menus} />
          {isProtected && (
            <OverlayMessage>로그인 후 사용 가능해요.</OverlayMessage>
          )}
        </ProtectedMenuWrapper>
        <Divider />

        <ProtectedMenuWrapper disabled={isProtected}>
          <TitleContentArea
            title={"내 룸메이트"}
            children={
              <RoomMateInfoArea
                roommateInfo={roommateInfo}
                notFound={notFound}
              />
            }
          />
          {isProtected && (
            <OverlayMessage>로그인 후 사용 가능해요.</OverlayMessage>
          )}
        </ProtectedMenuWrapper>
        <Divider />

        <ProtectedMenuWrapper disabled={isProtected}>
          <MenuGroup title={menuGroups[1].title} menus={menuGroups[1].menus} />
          {isProtected && (
            <OverlayMessage>로그인 후 사용 가능해요.</OverlayMessage>
          )}
        </ProtectedMenuWrapper>
        <Divider />

        <MenuGroup title={menuGroups[4].title} menus={menuGroups[4].menus} />
        <Divider />

        <MenuGroup title={"앱 버전"} menus={[{ label: "v 1.3.4" }]} />

        {isAdmin && (
          <>
            <Divider />

            <MenuGroup
              title={"관리자 전용"}
              menus={[
                {
                  label: "관리자 페이지",
                  onClick: () => {
                    navigate("/admin");
                  },
                },
              ]}
            />
          </>
        )}
      </MenuGroupsWrapper>
      <BottomBar />
    </MyPageWrapper>
  );
};
export default MyPage;

const MyPageWrapper = styled.div`
  padding: 90px 16px;
  padding-bottom: 150px;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  width: 100%;
  flex: 1;
  //height: 100%;

  overflow-y: auto;
  background: #fafafa;

  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const MenuGroupsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .appcenter-logo {
    width: 100%;
  }
`;

const Divider = styled.div`
  height: 1px;
  width: 100vw;
  background: #0000001a;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
`;

const LoginButton = styled.button`
  text-align: start;
  font-size: 18px;
  color: #333;
  height: fit-content;
  cursor: pointer;
  .go {
    font-size: 16px;
    margin-left: 5px;
    font-weight: 300;
  }
  .login {
    font-weight: 600;
  }
`;

const InfoAreaWrapper = styled.div`
  margin-bottom: 24px; /* 원하는 여백 크기 */
`;

const ProtectedMenuWrapper = styled.div<{ disabled: boolean }>`
  position: relative;
  opacity: ${(props) => (props.disabled ? 0.4 : 1)};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
`;

const OverlayMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  font-size: 15px;
  font-weight: 600;
  color: #333; /* 더 진한 글자색 */
  background: rgba(255, 255, 255, 0.9); /* 밝은 배경 유지 */

  padding: 8px 14px;
  border-radius: 10px;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 부드러운 그림자 */
  pointer-events: none;
  white-space: nowrap;
  z-index: 1;
`;
