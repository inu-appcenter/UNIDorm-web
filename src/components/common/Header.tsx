import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import back from "../../assets/header/back.svg";
import TopRightDropdownMenu from "./TopRightDropdownMenu.tsx";
import { Bell } from "lucide-react";

import { getMobilePlatform } from "../../utils/getMobilePlatform";

interface MenuItemType {
  label: string;
  onClick: () => void;
}

interface HeaderProps {
  hasBack?: boolean;
  title?: string;
  showAlarm?: boolean;
  menuItems?: MenuItemType[];
  rightContent?: React.ReactNode;
  secondHeader?: React.ReactNode;
}

export default function Header({
  hasBack,
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

  useEffect(() => {
    setPlatform(getMobilePlatform());
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
    navigate(-1);
  };

  const handleNotiBtnClick = () => {
    navigate("/notification");
  };

  const shadowSelector = () => {
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
    <StyledHeader $hasShadow={shadowSelector()}>
      <MainLine $platform={platform}>
        <Left>
          {hasBack && (
            <img src={back} alt="뒤로가기" onClick={handleBackClick} />
          )}
          <div className="Title">{title ?? getCurrentPage()}</div>
          <span>{platform}</span>
        </Left>

        <Right>
          {showAlarm && (
            <div>
              <Bell onClick={handleNotiBtnClick} size={22} />
            </div>
          )}
          {menuItems && <TopRightDropdownMenu items={menuItems} />}
        </Right>
      </MainLine>
      <SecondLine>{secondHeader}</SecondLine>
    </StyledHeader>
  );
}

const StyledHeader = styled.header<{ $hasShadow: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;

  background: rgba(244, 244, 244, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  box-shadow: ${({ $hasShadow }) =>
    $hasShadow ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none"};

  img {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  .Title {
    font-weight: 600;
    font-size: 18px;
    line-height: 24px;
    letter-spacing: 0.38px;
    color: #1c1c1e;
    text-align: center;
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
