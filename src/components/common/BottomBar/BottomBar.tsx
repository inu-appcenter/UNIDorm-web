import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import useUserStore from "../../../stores/useUserStore.ts";
import { getMyRoommateInfo } from "@/apis/roommate";
import { getAllRoommateChatUnreadCount } from "@/apis/chat";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import TooltipMessage from "@/components/common/TooltipMessage";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import { mixpanelTrack } from "@/utils/mixpanel";
import complaintIcon from "@/assets/bottombar/Complaint.svg";
import complaintClickedIcon from "@/assets/bottombar/complaint-clicked.svg";

const ROOMMATE_MATCHING_FEATURE_FLAG_KEY = "ROOMMATE_MATCHING";

// SVG Icon components matching Figma Vuesax icons
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 18V15M10.07 2.82L3.14 8.37C2.36 8.99 1.86 10.3 2.03 11.28L3.36 19.24C3.6 20.66 4.96 21.81 6.4 21.81H17.6C19.03 21.81 20.4 20.65 20.64 19.24L21.97 11.28C22.13 10.3 21.63 8.99 20.86 8.37L13.93 2.83C12.86 1.97 11.13 1.97 10.07 2.82Z"
      stroke={isActive ? "#1677FF" : "#6F6F6F"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RoommateIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68999C2 5.59999 4.49 3.09999 7.56 3.09999C9.38 3.09999 10.99 3.97999 12 5.33999C13.01 3.97999 14.63 3.09999 16.44 3.09999C19.51 3.09999 22 5.59999 22 8.68999C22 15.69 15.52 19.82 12.62 20.81Z"
      stroke={isActive ? "#1677FF" : "#6F6F6F"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChatIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 9 2H15C19 2 21 4 21 8V13C21 17 19 19 15 19H14.5C14.19 19 13.89 19.15 13.7 19.4L12.2 21.4C11.54 22.28 10.46 22.28 9.8 21.4L8.3 19.4C8.11 19.15 7.81 19 7.5 19H8.5Z"
      stroke={isActive ? "#1677FF" : "#6F6F6F"}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.9965 11H16.0055M11.9955 11H12.0045M7.99451 11H8.00351"
      stroke={isActive ? "#1677FF" : "#6F6F6F"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ComplainIcon = ({ isActive }: { isActive: boolean }) => (
  <img
    src={isActive ? complaintClickedIcon : complaintIcon}
    width={24}
    height={24}
    alt=""
    aria-hidden="true"
  />
);

const MyPageIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
      stroke={isActive ? "#1677FF" : "#6F6F6F"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.09998 19.33C4.09998 16.39 7.63998 14 12 14C16.36 14 19.9 16.39 19.9 19.33"
      stroke={isActive ? "#1677FF" : "#6F6F6F"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={isActive ? "#1677FF" : "#6F6F6F"}
      strokeWidth="1.5"
    />
  </svg>
);

interface ButtonProps {
  icon: (isActive: boolean) => React.ReactNode;
  buttonName: string;
  isActive: boolean;
  onClick: () => void;
  showTooltip?: boolean;
  onTooltipClose?: () => void;
  badgeCount?: number;
}

const Button = ({
  icon,
  buttonName,
  isActive,
  onClick,
  showTooltip = false,
  onTooltipClose,
  badgeCount = 0,
}: ButtonProps) => {
  return (
    <ButtonWrapper onClick={onClick}>
      {showTooltip && onTooltipClose && (
        <TooltipMessage
          message={"26년 1학기\n룸메이트 매칭 중!"}
          onClose={onTooltipClose}
          position={"top"}
          align={"center"}
          width={"90px"}
        />
      )}

      <BadgeWrapper>
        {icon(isActive)}
        {badgeCount > 0 && (
          <Badge>{badgeCount > 99 ? "99+" : badgeCount}</Badge>
        )}
      </BadgeWrapper>

      <div className={`BtnName ${isActive ? "active" : ""}`}>{buttonName}</div>
    </ButtonWrapper>
  );
};

export default function BottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const { flag: isMatchingActive } = useFeatureFlag(
    ROOMMATE_MATCHING_FEATURE_FLAG_KEY,
  );

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState(() => {
    const stored = localStorage.getItem("showRoommateTooltip");
    return stored !== "false";
  });

  const hideTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem("showRoommateTooltip", "false");
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isLoggedIn) {
        setUnreadCount(0);
        return;
      }

      try {
        const chatRes = await getAllRoommateChatUnreadCount();
        setUnreadCount(chatRes.data);
      } catch (err) {
        console.error("미확인 메시지 조회 실패", err);
      }
    };

    fetchUnreadCount();
  }, [pathname, isLoggedIn]);

  if (
    pathname.includes("/chat/roommate") ||
    pathname.includes("/chat/groupPurchase")
  ) {
    return null;
  }

  return (
    <StyledBottomBar>
      <PillContainer>
        <Button
          icon={(active) => <HomeIcon isActive={active} />}
          buttonName="홈"
          isActive={pathname === "/home" || pathname === "/"}
          onClick={() => {
            mixpanelTrack.featureClicked("홈", "BottomBar");
            navigate("/home");
          }}
        />
        <Button
          icon={(active) => <RoommateIcon isActive={active} />}
          buttonName="룸메"
          isActive={
            pathname === "/roommate" || pathname.startsWith("/roommate")
          }
          onClick={async () => {
            mixpanelTrack.featureClicked("룸메이트", "BottomBar");
            if (!isLoggedIn) {
              navigate("/roommate");
              return;
            }
            try {
              await getMyRoommateInfo();
              navigate("/roommate/my");
            } catch {
              navigate("/roommate");
            }
          }}
          showTooltip={showTooltip && isMatchingActive === true}
          onTooltipClose={hideTooltip}
        />
        <Button
          icon={(active) => <ChatIcon isActive={active} />}
          buttonName="채팅"
          isActive={pathname === "/chat" || pathname.startsWith("/chat")}
          onClick={() => {
            mixpanelTrack.featureClicked("채팅", "BottomBar");
            navigate("/chat");
          }}
          badgeCount={unreadCount}
        />
        <Button
          icon={(active) => <ComplainIcon isActive={active} />}
          buttonName="민원"
          isActive={
            pathname === "/complain" || pathname.startsWith("/complain")
          }
          onClick={() => {
            mixpanelTrack.featureClicked("민원", "BottomBar");
            if (!isLoggedIn) {
              alert("로그인 후 사용할 수 있습니다.");
              navigate("/login");
              return;
            }
            navigate("/complain");
          }}
        />
        <Button
          icon={(active) => <MyPageIcon isActive={active} />}
          buttonName="마이페이지"
          isActive={pathname === "/mypage"}
          onClick={() => {
            mixpanelTrack.featureClicked("마이페이지", "BottomBar");
            navigate("/mypage");
          }}
        />
      </PillContainer>
    </StyledBottomBar>
  );
}

const ButtonWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 44px;
  gap: 4px;
  cursor: pointer;

  .BtnName {
    font-family: "Pretendard", sans-serif;
    font-size: 10px;
    font-weight: 600;
    line-height: normal;
    color: #6f6f6f;
    text-align: center;
    white-space: nowrap;
  }

  .BtnName.active {
    color: #1677ff;
  }
`;

const BadgeWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

/** 알림 뱃지 스타일 */
const Badge = styled.div`
  position: absolute;
  top: -2px;
  right: -8px;

  background-color: #f97171;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;

  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 100px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #ffffff;
  box-sizing: border-box;
  line-height: 1;
`;

const platform = getMobilePlatform();

const StyledBottomBar = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  padding: 8px 20px 16px 20px;
  padding-bottom: ${platform === "ios_webview" ? "24px" : "16px"};
  box-sizing: border-box;
  pointer-events: none;
`;

const PillContainer = styled.div`
  pointer-events: auto;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  max-width: 360px;
  padding: 10px 16px;
  box-sizing: border-box;

  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid #ffffff;
  border-radius: 60px;

  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);
`;
