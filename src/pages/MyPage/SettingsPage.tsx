import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createSettingsMenuGroups } from "@/stores/menuGroupsFactory";
import { useUserRole } from "@/hooks/useUserRole";
import { useSetHeader } from "@/hooks/useSetHeader";
import { PATHS } from "@/constants/paths";
import MenuGroup from "@/components/mypage/MenuGroup";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin } = useUserRole();

  const [showFcm, setShowFcm] = useState(
    () => sessionStorage.getItem("showFcm") === "true",
  );
  const [clickCount, setClickCount] = useState(0);

  const menuGroups = createSettingsMenuGroups(navigate, isLoggedIn);

  useSetHeader({
    title: "설정",
  });

  useEffect(() => {
    if (clickCount >= 5 && !showFcm) {
      setShowFcm(true);
      sessionStorage.setItem("showFcm", "true");
    }
  }, [clickCount, showFcm]);

  const handleAppUpdate = () => {
    if (window.AndroidBridge?.requestAppUpdate) {
      window.AndroidBridge.requestAppUpdate();
    } else if (window.webkit?.messageHandlers?.requestAppUpdate) {
      window.webkit.messageHandlers.requestAppUpdate.postMessage(null);
    } else {
      if (confirm("페이지를 새로고침하시겠습니까?")) {
        window.location.reload();
      }
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
              label: "버전 v 1.7.5",
              onClick: () => setClickCount((prev) => prev + 1),
            },
            ...(showFcm
              ? [
                  {
                    label: "fcm 토큰 확인",
                    onClick: () => navigate(PATHS.ADMIN.FCM),
                  },
                ]
              : []),
            {
              label: "업데이트 하기",
              onClick: handleAppUpdate,
            },
          ]}
        />

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
