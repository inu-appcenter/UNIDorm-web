import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

import back from "../../assets/header/back.svg";
import noti from "../../assets/header/noti.svg";

interface HeaderProps {
  hasBack?: boolean;
  title?: string;
  showAlarm?: boolean;
  rightContent?: React.ReactNode; // ✅ 추가: 오른쪽 사용자 정의 콘텐츠
}

export default function Header({
  hasBack,
  title,
  showAlarm = true,
  rightContent,
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
        return true;
      default:
        return false;
    }
  };

  return (
    <StyledHeader $hasShadow={shadowSelector()}>
      <Left>
        {hasBack ? (
          <img src={back} alt="뒤로가기" onClick={handleBackClick} />
        ) : (
          <Spacer />
        )}
      </Left>

      <TitleWrapper>
        <div className="Title">{title ?? getCurrentPage()}</div>
      </TitleWrapper>

      <Right>
        {rightContent !== undefined ? (
          rightContent
        ) : showAlarm ? (
          <img src={noti} alt="알림" onClick={handleNotiBtnClick} />
        ) : (
          <Spacer />
        )}
      </Right>
    </StyledHeader>
  );
}

const StyledHeader = styled.header<{ $hasShadow: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 70px;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;

  // ✅ 블러 효과 추가
  background-color: rgba(255, 255, 255, 0.7);
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
  }
`;

const Left = styled.div`
  width: 24px;
`;

const Right = styled.div`
  width: 100px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const Spacer = styled.div`
  width: 24px;
`;

const TitleWrapper = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;
