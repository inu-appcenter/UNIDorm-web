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
import 궁금해하는횃불이 from "../../assets/roommate/궁금해하는횃불이.png";
import RoundSquareWhiteButton from "../button/RoundSquareWhiteButton.tsx";

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
  const [showInfoModal, setShowInfoModal] = useState(false);

  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  useEffect(() => {
    setPlatform(getMobilePlatform());
  }, []);

  const [hasMatchingRequests, setHasMatchingRequests] = useState(false);
  useEffect(() => {
    const fetchMatchingRequests = async () => {
      console.log("알림이 있는지 확인합니다");
      try {
        const response = await getReceivedRoommateRequests();

        if (Array.isArray(response.data) && response.data.length > 0) {
          setHasMatchingRequests(true);

          // 로컬스토리지에 'roommate_alert_shown' 값이 없으면 alert 띄우기
          const alertShown = localStorage.getItem("roommate_alert_shown");
          if (!alertShown) {
            alert(
              "룸메이트 매칭 요청이 도착했습니다!\n알림 페이지로 이동해서 매칭 요청을 수락해 주세요!",
            );
            localStorage.setItem("roommate_alert_shown", "true");
          }
        } else {
          setHasMatchingRequests(false);
          // 알림 없으면 로컬스토리지 값도 제거 (원하면 유지 가능)
          localStorage.removeItem("roommate_alert_shown");
        }
      } catch (error) {
        console.error("매칭 요청 조회 실패:", error);
      }
    };

    if (showAlarm && isLoggedIn) {
      fetchMatchingRequests();
    }
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
          {/*<RoundButton*/}
          {/*  onClick={() => {*/}
          {/*    setShowInfoModal(true);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  앱 설치하기*/}
          {/*</RoundButton>*/}
          {showAlarm && <NotificationBell hasNew={hasMatchingRequests} />}

          {menuItems && <TopRightDropdownMenu items={menuItems} />}
        </Right>
      </MainLine>
      <SecondLine>{secondHeader}</SecondLine>

      {showInfoModal && (
        <ModalBackGround>
          <Modal>
            <ModalContentWrapper>
              <ModalHeader>
                <img src={궁금해하는횃불이} className="wonder-character" />
                <h2>UNI Dorm 앱 설치하기!</h2>
                <span>
                  App Store와 Google Play Store에는 곧 출시 예정입니다. 그
                  전까지는 아래 방법을 참고해 주세요!
                </span>
              </ModalHeader>
              <ModalScrollArea>
                <h3>Galaxy</h3>
                <p>Samsung Galaxy에서의 설치 방법을 안내드립니다.</p>

                <h3>iPhone</h3>
                <p>
                  <strong>
                    반드시 룸메이트 사전 지정 기간에 인천대학교 포털에서
                    신청해주세요!!!!
                    <br />❍ 신청기간 : 2025. 08. 15(금) 00:00 ~ 08. 17(일) 23:59
                  </strong>
                  <br />
                  ❍ 신청방법
                  <br />- 포털(
                  <a
                    href="https://portal.inu.ac.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://portal.inu.ac.kr
                  </a>
                  ) → 통합정보 → 부속행정(생활원) → 합격조회
                  <br />
                  ❍ 주의사항
                  <br />
                  - 입사기간 및 호실형태가 동일한 학생끼리 서로 신청해야
                  룸메이트 매칭 가능
                  <br />
                  ▷ 별도선발 신청자의 룸메이트 신청을 원하는 경우, 별도선발 부서
                  신청 기간 내 신청바랍니다.
                  <br />
                  - 룸메이트 신청은 2명이 서로 신청한 경우에만 신청이 인정됨
                  <br />
                  <br />
                  기타 자세한 사항은{" "}
                  <a
                    href="https://dorm.inu.ac.kr/dorm/6521/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGZG9ybSUyRjIwMDMlMkY0MTAwNjIlMkZhcnRjbFZpZXcuZG8lM0Y%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    여기
                  </a>
                  를 클릭하여 확인
                </p>
              </ModalScrollArea>
            </ModalContentWrapper>
            <ButtonGroupWrapper>
              <RoundSquareWhiteButton
                btnName={"닫기"}
                onClick={() => {
                  setShowInfoModal(false);
                }}
              />
            </ButtonGroupWrapper>
          </Modal>
        </ModalBackGround>
      )}
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

// const RoundButton = styled.button`
//   display: flex;
//   align-items: center;
//   gap: 6px;
//   width: fit-content;
//   height: fit-content;
//   padding: 8px 16px;
//   box-sizing: border-box;
//   background: linear-gradient(135deg, #0a84ff, #4aa3ff);
//   color: white;
//   border: none;
//   border-radius: 25px;
//   font-weight: 600;
//   font-size: 15px;
//   cursor: pointer;
//   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
//   transition: all 0.2s ease;
//
//   &:hover {
//     background: linear-gradient(135deg, #0980f8, #3794f5);
//     box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
//     transform: translateY(-1px);
//   }
//
//   &:active {
//     transform: translateY(1px);
//     box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
//   }
// `;

const ModalBackGround = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  padding: 32px 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  max-height: 80%;
  background: white;
  color: #333366;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
  overflow: hidden;
  position: relative;

  .wonder-character {
    position: absolute;
    top: 10px;
    right: 0;
    width: 100px;
    height: 100px;
    z-index: 1000;
  }

  .content {
    width: 100%;
    flex: 1;
    //height: 100%;
    overflow-y: auto;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; /* 내부에서만 스크롤 생기도록 */
`;

const ModalHeader = styled.div`
  flex-shrink: 0; /* 스크롤 시 줄어들지 않게 고정 */
  margin-bottom: 12px;
  justify-content: space-between;
  padding-right: 50px;
  overflow-wrap: break-word; // 또는 wordWrap
  word-break: keep-all; // 단어 중간이 아니라 단어 단위로 줄바꿈

  h2 {
    margin: 0;
    box-sizing: border-box;
  }
  span {
    font-size: 14px;
  }
`;

const ModalScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px; /* 스크롤바 여백 */
`;

// const ButtonGroupWrapper = styled.div`
//   display: flex;
//   flex-direction: row;
//   gap: 6px;
// `;
