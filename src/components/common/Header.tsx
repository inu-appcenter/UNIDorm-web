import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

import back from "../../assets/header/back.svg";
import TopRightDropdownMenu from "./TopRightDropdownMenu.tsx";

import logo from "../../assets/unidorm-logo.webp";

import { Bell } from "lucide-react";
import useUserStore from "../../stores/useUserStore.ts";
import { useIsAdminRole } from "../../hooks/useIsAdminRole.ts";

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
  const { isAdmin, roleName } = useIsAdminRole();
  const location = useLocation();

  // const [showInfoModal, setShowInfoModal] = useState(false);
  const deferredPromptRef = useRef<any>(null); // ← 설치 이벤트 저장용 ref

  const { userInfo } = useUserStore();

  // beforeinstallprompt 이벤트 감지
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      console.log("PWA 설치 가능 상태 감지됨");
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener,
      );
    };
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
      case "/roommate/checklist":
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
      case "/roommate/list":
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
      <MainLine>
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
          {isAdmin && (
            <RoundButton
              onClick={() => {
                navigate("/admin");
              }}
            >
              {roleName}
            </RoundButton>
          )}
          {showAlarm && (
            <NotificationBell hasNew={userInfo.hasUnreadNotifications} />
          )}

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
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const MainLine = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 16px 20px;
`;

const SecondLine = styled.div`
  width: 100%;
  height: 100%;
`;

// 알림 여부를 prop으로 전달받아서 표시 여부 결정
const NotificationBell = ({ hasNew }: { hasNew: boolean }) => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useUserStore();

  const handleNotiBtnClick = () => {
    setUserInfo({
      // 기존 userInfo 객체의 모든 속성을 복사
      ...userInfo,
      // hasUnreadNotifications 필드만 true로 덮어쓰기
      hasUnreadNotifications: false,
    });
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

const RoundButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  height: fit-content;
  padding: 8px 16px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #0a84ff, #4aa3ff);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  text-align: center;

  /* ✅ 줄바꿈 관련 속성 추가 */
  white-space: normal; /* 여러 줄 허용 */
  word-break: keep-all; /* 단어 단위로 줄바꿈 */
  overflow-wrap: break-word; /* 너무 긴 단어는 줄바꿈 */

  &:hover {
    background: linear-gradient(135deg, #0980f8, #3794f5);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
`;
