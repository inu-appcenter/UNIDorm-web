import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import back from "@/assets/header/back.svg";
import logo from "@/assets/unidorm-logo.webp";
import { Bell, Settings } from "lucide-react";
import useUserStore from "@/stores/useUserStore";
import useHeaderStore from "@/stores/useHeaderStore";
import { useIsAdminRole } from "@/hooks/useIsAdminRole";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import TooltipMessage from "./TooltipMessage";
import TopRightDropdownMenu from "../TopRightDropdownMenu";

interface HeaderProps {
  hasBack?: boolean;
  backPath?: string;
}

export default function Header({ hasBack = false, backPath }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, roleName } = useIsAdminRole();
  const { userInfo } = useUserStore();
  const platform = getMobilePlatform();

  /* 전역 상태 구독 */
  const { title, menuItems, settingOnClick, showAlarm, secondHeader } =
    useHeaderStore();

  const [showSettingTooltip, setShowSettingTooltip] = useState(() => {
    return localStorage.getItem("showKeywordSettingTooltip") !== "false";
  });

  const isHome = location.pathname === "/home" || location.pathname === "/";

  return (
    <StyledHeader $isHome={isHome}>
      <MainLine>
        <Left>
          {hasBack && (
            <img
              src={back}
              alt="뒤로가기"
              onClick={() => (backPath ? navigate(backPath) : navigate(-1))}
            />
          )}
          <div className="Title">
            {isHome ? <img className="logo" src={logo} alt="로고" /> : title}
          </div>
        </Left>
        <Right>
          {!isAdmin &&
            (platform === "ios_browser" || platform === "android_browser") && (
              <RoundButton
                onClick={() => window.open("앱스토어주소", "_blank")}
              >
                앱 설치
              </RoundButton>
            )}
          {isAdmin && (
            <RoundButton onClick={() => navigate("/admin")}>
              {roleName}
            </RoundButton>
          )}
          {showAlarm && (
            <BellWrapper onClick={() => navigate("/notification")}>
              <Bell size={22} />
              {userInfo.hasUnreadNotifications && <Badge />}
            </BellWrapper>
          )}
          {menuItems && <TopRightDropdownMenu items={menuItems} />}
          {settingOnClick && (
            <SettingWrapper onClick={settingOnClick}>
              <Settings size={24} />
              {showSettingTooltip && (
                <TooltipMessage
                  message="알림 설정 안내"
                  onClose={() => {
                    setShowSettingTooltip(false);
                    localStorage.setItem("showKeywordSettingTooltip", "false");
                  }}
                />
              )}
            </SettingWrapper>
          )}
        </Right>
      </MainLine>
      {/* 주입된 세컨드 헤더 렌더링 */}
      {secondHeader && <SecondLine>{secondHeader}</SecondLine>}
    </StyledHeader>
  );
}

const StyledHeader = styled.header<{ $isHome: boolean }>`
  min-height: 70px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 11;
  width: 100%;
  background: ${({ $isHome }) =>
    $isHome
      ? "linear-gradient(360deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 80.71%)"
      : "rgba(244, 244, 244, 0.6)"};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  @media (min-width: 1024px) {
    padding: 0 10vw;
  }
  img {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  .logo {
    width: 60px;
    height: 100%;
  }
  .Title {
    font-weight: 600;
    font-size: 20px;
    color: #1c1c1e;
    display: flex;
    align-items: center;
  }
`;

const MainLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
`;
const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const SecondLine = styled.div`
  width: 100%;
`;
const BellWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;
const Badge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #ffd60a;
  border-radius: 50%;
`;
const RoundButton = styled.button`
  padding: 8px 16px;
  background: #0a84ff;
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
`;
const SettingWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;
