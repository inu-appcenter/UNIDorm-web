import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import MenuGroup from "@/components/mypage/MenuGroup";
import { PATHS } from "@/constants/paths";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useUserRole } from "@/hooks/useUserRole";
import { createSettingsMenuGroups } from "@/stores/menuGroupsFactory";

const APP_VERSION = "1.8.0";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin } = useUserRole();
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const menuGroups = createSettingsMenuGroups(navigate, isLoggedIn);

  useSetHeader({
    title: "설정",
  });

  useEffect(() => {
    if (clickCount >= 5 && !showHiddenMenu) {
      setShowHiddenMenu(true);
    }
  }, [clickCount, showHiddenMenu]);

  const handleAppUpdate = () => {
    if (window.AndroidBridge?.requestAppUpdate) {
      window.AndroidBridge.requestAppUpdate();
      return;
    }

    if (window.webkit?.messageHandlers?.requestAppUpdate) {
      window.webkit.messageHandlers.requestAppUpdate.postMessage(null);
      return;
    }

    if (window.confirm("페이지를 새로고침하시겠습니까?")) {
      window.location.reload();
    }
  };

  return (
    <SettingsWrapper>
      <MenuGroupsWrapper>
        <MenuGroup title={menuGroups[0].title} menus={menuGroups[0].menus} />
        <Divider />

        <MenuGroup
          title="앱 정보"
          menus={[
            {
              label: `버전 v ${APP_VERSION}`,
              onClick: () => setClickCount((prev) => prev + 1),
            },
            {
              label: "업데이트 하기",
              onClick: handleAppUpdate,
            },
          ]}
        />

        {showHiddenMenu && (
          <>
            <Divider />
            <MenuGroup
              title="히든 메뉴"
              menus={[
                {
                  label: "로그 확인",
                  onClick: () => navigate(PATHS.SETTINGS_LOGS),
                },
                {
                  label: "FCM 토큰 확인",
                  onClick: () => navigate(PATHS.ADMIN.FCM),
                },
              ]}
            />
          </>
        )}

        {isAdmin && (
          <>
            <Divider />
            <MenuGroup
              title="관리자 전용"
              menus={[
                {
                  label: "관리자 페이지",
                  onClick: () => navigate(PATHS.ADMIN.ROOT),
                },
              ]}
            />
          </>
        )}
      </MenuGroupsWrapper>
    </SettingsWrapper>
  );
};

export default SettingsPage;

const SettingsWrapper = styled.div`
  padding: 24px 16px;
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
