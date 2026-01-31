import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

import buy from "../../../assets/bottombar/buy.svg";
import chat from "../../../assets/bottombar/chat.svg";
import home from "../../../assets/bottombar/home.svg";
import roommate from "../../../assets/bottombar/roommate.svg";
import mypage from "../../../assets/bottombar/mypage.svg";

import buyClicked from "../../../assets/bottombar/buy-clicked.svg";
import chatClicked from "../../../assets/bottombar/chat-clicked.svg";
import homeClicked from "../../../assets/bottombar/home-clicked.svg";
import roommateClicked from "../../../assets/bottombar/roommate-clicked.svg";
import mypageClicked from "../../../assets/bottombar/mypage-clicked.svg";
import { useEffect, useState } from "react";
import useUserStore from "../../../stores/useUserStore.ts";
import { getMyRoommateInfo } from "@/apis/roommate";
import { getRoommateChatRooms } from "@/apis/chat";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import TooltipMessage from "@/components/common/TooltipMessage";
import { getFeatureFlagByKey } from "@/apis/featureFlag";

interface ButtonProps {
  defaultImg: string;
  clickedImg: string;
  buttonName: string;
  isActive: boolean;
  onClick: () => void;
  showTooltip?: boolean;
  onTooltipClose?: () => void;
  badgeCount?: number;
}

const Button = ({
  defaultImg,
  clickedImg,
  buttonName,
  isActive,
  onClick,
  showTooltip = false,
  onTooltipClose,
}: ButtonProps) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <ButtonWrapper onClick={handleClick}>
      {showTooltip && onTooltipClose && (
        <TooltipMessage
          message="26년 1학기\n룸메이트 매칭 중!"
          onClose={onTooltipClose}
          position={"top"}
          align={"center"}
          width={"90px"}
        />
      )}

      <BadgeWrapper>
        <img src={isActive ? clickedImg : defaultImg} alt={buttonName} />
      </BadgeWrapper>

      <div className={`BtnName ${isActive ? "active" : ""}`}>{buttonName}</div>
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  gap: 5px;
  cursor: pointer;

  .BtnName {
    font-size: 10px;
    color: #000;
    min-width: fit-content;
  }

  .BtnName.active {
    color: #0a84ff;
  }
`;

const BadgeWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export default function BottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const [roommateChatCount, setRoommateChatCount] = useState<number>(0);

  // // 채팅방 개수 조회
  // useEffect(() => {
  //   if (!isLoggedIn) return;
  //
  //   getRoommateChatRooms()
  //     .then((res) => {
  //       setRoommateChatCount(res.data.length);
  //     })
  //     .catch((err) => {
  //       console.error("룸메이트 채팅방 목록 조회 실패", err);
  //     });
  // }, [pathname, isLoggedIn]);

  // 툴팁 표시 상태 관리
  const [showTooltip, setShowTooltip] = useState(() => {
    const stored = localStorage.getItem("showRoommateTooltip");
    return stored !== "false";
  });

  const hideTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem("showRoommateTooltip", "false");
  };

  /* 피처 플래그 상태 관리 */
  const [isMatchingActive, setIsMatchingActive] = useState<boolean>(true);

  useEffect(() => {
    /* 채팅방 개수 및 피처 플래그 조회 */
    const fetchData = async () => {
      if (isLoggedIn) {
        try {
          const chatRes = await getRoommateChatRooms();
          setRoommateChatCount(chatRes.data.length);
        } catch (err) {
          console.error("룸메이트 채팅방 목록 조회 실패", err);
        }
      }

      try {
        // return; //피쳐플래그 버그로 인해 임시로 작동 해제
        const flagRes = await getFeatureFlagByKey("ROOMMATE_MATCHING");
        setIsMatchingActive(flagRes.data.flag);
      } catch (err) {
        console.error("피처 플래그 조회 실패", err);
      }
    };

    fetchData();
  }, [pathname, isLoggedIn]);

  // 특정 페이지에서 하단바 숨김 처리
  if (
    pathname.includes("/chat/roommate") ||
    pathname.includes("/chat/groupPurchase")
  ) {
    return null;
  }

  return (
    <StyledBottomBar>
      <Button
        defaultImg={home}
        clickedImg={homeClicked}
        buttonName="홈"
        isActive={pathname === "/home" || pathname === "/"}
        onClick={() => navigate("/home")}
      />
      <Button
        defaultImg={roommate}
        clickedImg={roommateClicked}
        buttonName="룸메이트"
        isActive={pathname === "/roommate" || pathname === "/roommate/my"}
        onClick={() => {
          const fetchRoommateInfo = async () => {
            if (!isLoggedIn) {
              navigate("/roommate");
              return;
            }
            try {
              await getMyRoommateInfo();
              navigate("/roommate/my");
            } catch (err: any) {
              navigate("/roommate");
              console.log(err);
            }
          };
          fetchRoommateInfo();
        }}
        showTooltip={showTooltip && isMatchingActive}
        onTooltipClose={hideTooltip}
      />
      <Button
        defaultImg={buy}
        clickedImg={buyClicked}
        buttonName="공동구매"
        isActive={pathname === "/groupPurchase"}
        onClick={() => navigate("/groupPurchase")}
      />
      <Button
        defaultImg={chat}
        clickedImg={chatClicked}
        buttonName="채팅"
        isActive={pathname === "/chat"}
        onClick={() => navigate("/chat")}
        badgeCount={roommateChatCount}
      />

      <Button
        defaultImg={mypage}
        clickedImg={mypageClicked}
        buttonName="마이페이지"
        isActive={pathname === "/mypage"}
        onClick={() => navigate("/mypage")}
      />
    </StyledBottomBar>
  );
}

const platform = getMobilePlatform();

const StyledBottomBar = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  height: fit-content;
  padding: 8px 20px;
  box-sizing: border-box;

  background: rgba(244, 244, 244, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  padding-bottom: ${platform === "ios_webview" && "24px"};

  @media (min-width: 1024px) {
    padding-left: 30vw;
    padding-right: 30vw;
  }
`;
