import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

import back from "../../assets/header/back.svg";
import noti from "../../assets/header/noti.svg";

interface HeaderProps {
  hasBack?: boolean;
  title?: string;
  showAlarm?: boolean;
}

export default function Header({
  hasBack,
  title,
  showAlarm = true,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
      default:
        return ""; // fallback
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
        return true;
      default:
        return false;
    }
  };

  return (
    <StyledHeader $hasShadow={shadowSelector()}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {hasBack && (
          <img
            src={back}
            alt="뒤로가기"
            onClick={handleBackClick}
            style={{ cursor: "pointer" }}
          />
        )}
        <div className="Title">{title ?? getCurrentPage()}</div>
      </div>
      {showAlarm && (
        <img src={noti} alt="알림" onClick={handleNotiBtnClick} />
      )}
    </StyledHeader>
  );
}

const StyledHeader = styled.header<{ $hasShadow: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  background: white;
  width: 100%;
  height: 70px;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${({ $hasShadow }) =>
    $hasShadow ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none"};

  .Title {
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    letter-spacing: 0.38px;
    color: #1c1c1e;
  }

  img {
    width: 24px;
    height: 24px;
  }
`;
