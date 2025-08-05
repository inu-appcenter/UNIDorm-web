import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import back from "../../assets/header/back.svg";
import TopRightDropdownMenu from "./TopRightDropdownMenu.tsx";

import logo from "../../assets/unidorm-logo.svg";

import { getMobilePlatform } from "../../utils/getMobilePlatform";
import { getReceivedRoommateRequests } from "../../apis/roommate.ts";
import { Bell } from "lucide-react";
import useUserStore from "../../stores/useUserStore.ts";

interface MenuItemType {
  label: string;
  onClick: () => void;
}
interface HeaderProps {
  hasBack?: boolean; // 뒤로가기 버튼 노출 여부
  backPath?: string; // 뒤로가기 경로 (없으면 -1)
  title?: string;
  showAlarm?: boolean;
  menuItems?: MenuItemType[];
  rightContent?: React.ReactNode;
  secondHeader?: React.ReactNode;
}

export default function Header({
  hasBack = false,
  backPath,
  title,
  showAlarm = false,
  menuItems,
  secondHeader,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [platform, setPlatform] = useState<"ios" | "android" | "other">(
    "other",
  );
  const { tokenInfo } = useUserStore();

  useEffect(() => {
    setPlatform(getMobilePlatform());
  }, []);

  const [hasMatchingRequests, setHasMatchingRequests] = useState(false);
  useEffect(() => {
    const fetchMatchingRequests = async () => {
      console.log("알림이 있는지 확인합니다");
      try {
        const response = await getReceivedRoommateRequests();

        // 매칭 요청이 하나라도 있으면 true
        if (Array.isArray(response.data) && response.data.length > 0) {
          setHasMatchingRequests(true);
        } else {
          setHasMatchingRequests(false);
        }
      } catch (error) {
        console.error("매칭 요청 조회 실패:", error);
      }
    };
    const isLoggedIn = Boolean(tokenInfo.accessToken);

    if (showAlarm && isLoggedIn) fetchMatchingRequests();
  }, []);

  const getCurrentPage = () => {
    switch (location.pathname) {
      case "/home":
        return "아이돔";
      case "/roommate":
        return "룸메이트";
      case "/groupPurchase":
        return "공동구매";
      case "/chat":
        return "채팅";
      case "/mypage":
        return "마이페이지";
      case "/notification":
        return "알림";
      case "/roommatelist/1":
        return "게시글";
      case "/roommatechecklist":
        return "사전 체크리스트";
      default:
        return "";
    }
  };

  const handleBackClick = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const shadowSelector = () => {
    return false;

    //헤더 쉐도우 제거
    switch (location.pathname) {
      case "/notification":
      case "/home":
      case "/roommate":
      case "/roommatelist":
      case "/roommatelist/1":
      case "/":
      case "/mypage":
        return true;
      default:
        return false;
    }
  };

  return (
    <StyledHeader
      $hasShadow={shadowSelector()}
      $isHome={location.pathname === "/home" || location.pathname === "/"}
    >
      <MainLine $platform={platform}>
        <Left>
          {hasBack && (
            <img src={back} alt="뒤로가기" onClick={handleBackClick} />
          )}
          <div className="Title">
            {location.pathname === "/home" || location.pathname === "/" ? (
              <img className="logo" src={logo} />
            ) : (
              (title ?? getCurrentPage())
            )}
          </div>
          {/*<span>{platform}</span>*/}
        </Left>

        <Right>
          {showAlarm && <NotificationBell hasNew={hasMatchingRequests} />}

          {menuItems && <TopRightDropdownMenu items={menuItems} />}
        </Right>
      </MainLine>
      <SecondLine>{secondHeader}</SecondLine>
    </StyledHeader>
  );
}

const StyledHeader = styled.header<{ $hasShadow: boolean; $isHome: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;

  background: ${({ $isHome }) =>
    $isHome
      ? "linear-gradient(360deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 80.71%)"
      : "rgba(244, 244, 244, 0.6)"};

  backdrop-filter: ${({ $isHome }) => ($isHome ? "none" : "blur(10px)")};
  -webkit-backdrop-filter: ${({ $isHome }) =>
    $isHome ? "none" : "blur(10px)"};

  box-shadow: ${({ $hasShadow }) =>
    $hasShadow ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none"};

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
    line-height: 24px;
    letter-spacing: 0.38px;
    color: #1c1c1e;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Left = styled.div`
  width: fit-content;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const Right = styled.div`
  width: fit-content;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
`;

const MainLine = styled.div<{ $platform: string }>`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding-left: 20px;
  padding-right: 20px;

  ${({ $platform }) =>
    $platform === "ios"
      ? `
        padding-top: env(safe-area-inset-top, 0px);
        height: calc(44px + env(safe-area-inset-top, 0px));
      `
      : `
        height: 70px;
      `}
`;

const SecondLine = styled.div`
  width: 100%;
  height: 100%;
`;

// 알림 여부를 prop으로 전달받아서 표시 여부 결정
const NotificationBell = ({ hasNew }: { hasNew: boolean }) => {
  const navigate = useNavigate();

  const handleNotiBtnClick = () => {
    navigate("/notification");
  };

  return (
    <BellWrapper>
      <Bell size={22} onClick={handleNotiBtnClick} />
      {hasNew && <Badge />}
    </BellWrapper>
  );
};

const BellWrapper = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
`;

const Badge = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 8px;
  height: 8px;
  background-color: #ffd60a;
  border-radius: 50%;
`;
