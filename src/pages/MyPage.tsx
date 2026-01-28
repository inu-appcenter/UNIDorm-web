import styled from "styled-components";
import MyInfoArea from "../components/mypage/MyInfoArea.tsx";
import MenuGroup from "../components/mypage/MenuGroup.tsx";
import { useEffect, useState } from "react";
import useUserStore from "../stores/useUserStore.ts";
import { useNavigate } from "react-router-dom";
import { createMyPageMenuGroups } from "@/stores/menuGroupsFactory";
import RoomMateInfoArea from "../components/roommate/RoomMateInfoArea.tsx";
import { getMyRoommateInfo } from "@/apis/roommate";
import { MyRoommateInfoResponse } from "@/types/roommates";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import BottomBar from "../components/common/BottomBar/BottomBar.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { PATHS } from "@/constants/paths";

const MyPage = () => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken ?? "");
  const navigate = useNavigate();
  const [roommateInfo, setRoommateInfo] =
    useState<MyRoommateInfoResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  const menuGroups = createMyPageMenuGroups(isLoggedIn, navigate);

  useEffect(() => {
    const fetchRoommateInfo = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await getMyRoommateInfo();
        setRoommateInfo(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setNotFound(true);
        }
      }
    };
    fetchRoommateInfo();
  }, [isLoggedIn]);

  const isProtected = !isLoggedIn;

  useSetHeader({
    title: "마이페이지",
    showAlarm: true,
    // 설정 페이지 이동 연결
    settingOnClick: () => navigate("/settings"),
  });

  return (
    <MyPageWrapper>
      <InfoAreaWrapper>
        {isLoggedIn ? (
          <MyInfoArea />
        ) : (
          <LoginButton onClick={() => navigate(PATHS.LOGIN)}>
            인천대학교 포털로 <span className="login"> 로그인</span>하세요
            <span className="go">{">"}</span>
          </LoginButton>
        )}
      </InfoAreaWrapper>

      <MenuGroupsWrapper>
        {/*/!* 내 계정 그룹 *!/*/}
        {/*<ProtectedMenuWrapper disabled={isProtected}>*/}
        {/*  <MenuGroup title={menuGroups[0].title} menus={menuGroups[0].menus} />*/}
        {/*  {isProtected && (*/}
        {/*    <OverlayMessage>로그인 후 사용 가능해요.</OverlayMessage>*/}
        {/*  )}*/}
        {/*</ProtectedMenuWrapper>*/}
        {/*<Divider />*/}

        {/* 룸메이트 정보 섹션 */}
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

        {/* 커뮤니티 그룹 */}
        <ProtectedMenuWrapper disabled={isProtected}>
          <MenuGroup title={menuGroups[1].title} menus={menuGroups[1].menus} />
          {isProtected && (
            <OverlayMessage>로그인 후 사용 가능해요.</OverlayMessage>
          )}
        </ProtectedMenuWrapper>
        <Divider />

        {/* 고객지원 및 정보 그룹 */}
        <MenuGroup title={menuGroups[2].title} menus={menuGroups[2].menus} />
      </MenuGroupsWrapper>
      <BottomBar />
    </MyPageWrapper>
  );
};

export default MyPage;

const MyPageWrapper = styled.div`
  padding: 0 16px 100px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  flex: 1;
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
`;

const Divider = styled.div`
  height: 1px;
  margin: 0 -16px;
  background: #0000001a;
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
  margin-bottom: 24px;
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
  color: #333;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 14px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  white-space: nowrap;
  z-index: 1;
`;
