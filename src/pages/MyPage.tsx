import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styled from "styled-components";
import { useMyRoommateInfo } from "@/queries/roommates";
import TitleContentArea from "../components/common/TitleContentArea.tsx";
import BottomBar from "../components/common/BottomBar/BottomBar.tsx";
import MenuGroup from "../components/mypage/MenuGroup.tsx";
import MyInfoArea from "../components/mypage/MyInfoArea.tsx";
import RoomMateInfoArea from "../components/roommate/RoomMateInfoArea.tsx";
import { PATHS } from "@/constants/paths";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "../stores/useUserStore.ts";
import { createMyPageMenuGroups } from "@/stores/menuGroupsFactory";
import { mixpanelTrack } from "@/utils/mixpanel";

const overlayText = "로그인 후 사용 가능해요.";

const MyPage = () => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken ?? "");
  const navigate = useNavigate();
  const { data: roommateInfo = null, isSuccess } = useMyRoommateInfo({
    enabled: isLoggedIn,
  });
  const notFound = Boolean(isLoggedIn && isSuccess && !roommateInfo);
  const hasTrackedRoommate = useRef(false);

  const menuGroups = createMyPageMenuGroups(isLoggedIn, navigate);

  //마이페이지 진입 (믹스패널)
  useEffect(() => {
    mixpanelTrack.myPageViewed(isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || hasTrackedRoommate.current) return;
    if (isSuccess) {
      hasTrackedRoommate.current = true;
      if (roommateInfo) {
        mixpanelTrack.myRoommateInfoLoaded();
      } else {
        mixpanelTrack.myRoommateInfoNotFound();
      }
    }
  }, [isLoggedIn, isSuccess, roommateInfo]);

  const isProtected = !isLoggedIn;

  useSetHeader({
    title: "마이페이지",
    showAlarm: true,
    settingOnClick: () => {
      mixpanelTrack.myPageSettingClicked(); //마이페이지 설정
      navigate("/settings");
    },
  });

  const handleLoginClick = () => {
    mixpanelTrack.myPageLoginClicked();
    navigate(PATHS.LOGIN); //원래 있던 이동 여기로
  }; //로그인 버튼 클릭



  return (
    <MyPageWrapper>
      <InfoAreaWrapper>
        {isLoggedIn ? (
          <MyInfoArea />
        ) : (
          <LoginButton
            onClick={handleLoginClick}
            as={motion.button}
            whileTap={{ scale: 0.98 }}
          >
            인천대학교 포털로 <span className="login">로그인</span>하세요
            <span className="go">{">"}</span>
          </LoginButton>
        )}
      </InfoAreaWrapper>

      <MenuGroupsWrapper>
        <ProtectedMenuWrapper disabled={isProtected}>
          <ProtectedContent disabled={isProtected}>
            <TitleContentArea
              title="내 룸메이트"
              children={
                <RoomMateInfoArea
                  roommateInfo={roommateInfo}
                  notFound={notFound}
                />
              }
            />
          </ProtectedContent>
          {isProtected && (
            <OverlayMessage
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <OverlayChip>{overlayText}</OverlayChip>
            </OverlayMessage>
          )}
        </ProtectedMenuWrapper>
        {menuGroups.slice(0, -1).map((group, idx) => (
          <div key={group.title || idx} style={{ display: "contents" }}>
            <ProtectedMenuWrapper disabled={isProtected}>
              <ProtectedContent disabled={isProtected}>
                <MenuGroup
                  title={group.title}
                  menus={group.menus}
                />
              </ProtectedContent>
              {isProtected && (
                <OverlayMessage
                  as={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <OverlayChip>{overlayText}</OverlayChip>
                </OverlayMessage>
              )}
            </ProtectedMenuWrapper>
            <Divider />
          </div>
        ))}

        {/* 고객지원 섹션 */}
        {menuGroups.length > 0 && (
          <MenuGroup
            title={menuGroups[menuGroups.length - 1].title}
            menus={menuGroups[menuGroups.length - 1].menus}
          />
        )}
      </MenuGroupsWrapper>
      <BottomBar />
    </MyPageWrapper>
  );
};

export default MyPage;

const MyPageWrapper = styled.div`
  padding: 24px 16px 100px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  flex: 1;
  overflow-y: auto;

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
  background: none;
  border: none;
  padding: 0;

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
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
`;

const ProtectedContent = styled.div<{ disabled: boolean }>`
  width: 100%;
  filter: ${(props) => (props.disabled ? "blur(1px)" : "none")};
  opacity: ${(props) => (props.disabled ? 0.64 : 1)};
  transition:
    filter 0.2s ease,
    opacity 0.2s ease;
`;

const OverlayMessage = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(0.5px);
  -webkit-backdrop-filter: blur(0.5px);
  pointer-events: none;
  z-index: 2;
`;

const OverlayChip = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 14px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
`;
