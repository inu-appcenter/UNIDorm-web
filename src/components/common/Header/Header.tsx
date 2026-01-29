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
import TooltipMessage from "src/components/common/TooltipMessage";
import TopRightDropdownMenu from "../TopRightDropdownMenu";

interface HeaderProps {
  hasBack?: boolean;
  backPath?: string;
}

export default function Header({ hasBack = false, backPath }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, roleName } = useIsAdminRole();
  const { userInfo, setUserInfo } = useUserStore();
  const platform = getMobilePlatform();

  const { title, menuItems, settingOnClick, showAlarm, secondHeader } =
    useHeaderStore();

  const [showSettingTooltip, setShowSettingTooltip] = useState(() => {
    return localStorage.getItem("showKeywordSettingTooltip") !== "false";
  });

  const isHome = location.pathname === "/home" || location.pathname === "/";
  // 공동구매 페이지 여부 확인
  const isGroupPurchase = location.pathname === "/groupPurchase";

  /* 설치 핸들러 */
  const handleInstallClick = () => {
    if (platform === "ios_browser") {
      window.open(
        "https://apps.apple.com/kr/app/%EC%9C%A0%EB%8B%88%EB%8F%94/id6751404748",
        "_blank",
      );
    } else if (platform === "android_browser") {
      window.open(
        "https://play.google.com/store/apps/details?id=com.hjunieee.inudormitory",
        "_blank",
      );
    }
  };

  /* 알림 핸들러 */
  const handleNotificationClick = () => {
    setUserInfo({ ...userInfo, hasUnreadNotifications: false });
    navigate("/notification");
  };

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
          {/* 앱 설치 버튼: 비관리자 및 모바일 브라우저 */}
          {!isAdmin &&
            (platform === "ios_browser" || platform === "android_browser") && (
              <RoundButton onClick={handleInstallClick}>앱 설치</RoundButton>
            )}

          {/* 관리자 버튼 */}
          {isAdmin && (
            <RoundButton onClick={() => navigate("/admin")}>
              {roleName}
            </RoundButton>
          )}

          {/* 알림 아이콘 */}
          {showAlarm && (
            <BellWrapper onClick={handleNotificationClick}>
              <Bell size={24} />
              {userInfo.hasUnreadNotifications && <Badge />}
            </BellWrapper>
          )}

          {/* 메뉴 */}
          {menuItems && <TopRightDropdownMenu items={menuItems} />}

          {/* 설정 아이콘 및 툴팁: 공동구매 페이지에서만 툴팁 노출 */}
          {settingOnClick && (
            <SettingWrapper>
              <Settings size={24} onClick={settingOnClick} />
              {showSettingTooltip && isGroupPurchase && (
                <TooltipMessage
                  message={"키워드 / 카테고리\n알림을 설정해보세요."}
                  onClose={() => {
                    setShowSettingTooltip(false);
                    localStorage.setItem("showKeywordSettingTooltip", "false");
                  }}
                  width={"100px"}
                />
              )}
            </SettingWrapper>
          )}
        </Right>
      </MainLine>
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
  box-sizing: border-box;
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
    display: block;
  }
  .logo {
    width: 60px;
    height: auto;
  }
  .Title {
    font-weight: 600;
    font-size: 20px;
    color: #1c1c1e;
    display: flex;
    align-items: center;
    line-height: 1;
  }
`;

const MainLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  height: 70px;
  box-sizing: border-box;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
`;

const SecondLine = styled.div`
  width: 100%;
`;

const BellWrapper = styled.div`
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const Badge = styled.div`
  position: absolute;
  top: 2px;
  right: 0;
  width: 8px;
  height: 8px;
  background: #ffd60a;
  border-radius: 50%;
  border: 1.5px solid white;
`;

const RoundButton = styled.button`
  padding: 6px 14px;
  background: linear-gradient(135deg, #0a84ff, #4aa3ff);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: linear-gradient(135deg, #0980f8, #3794f5);
    transform: translateY(-1px);
  }
`;

const SettingWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: 100%;
`;
