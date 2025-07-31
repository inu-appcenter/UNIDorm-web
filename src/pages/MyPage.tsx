import styled from "styled-components";
import MyInfoArea from "../components/mypage/MyInfoArea.tsx";
import MenuGroup from "../components/mypage/MenuGroup.tsx";
import React from "react";
import Header from "../components/common/Header.tsx";
import useUserStore from "../stores/useUserStore.ts";
import { useNavigate } from "react-router-dom";
import { createMenuGroups } from "../stores/menuGroupsFactory.ts";

const MyPage = () => {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken ?? "");
  const navigate = useNavigate();

  const menuGroups = createMenuGroups(isLoggedIn, navigate);

  return (
    <MyPageWrapper>
      <Header title={"마이페이지"} showAlarm={true} />
      <InfoAreaWrapper>
        {isLoggedIn ? (
          <MyInfoArea />
        ) : (
          <LoginMessage onClick={() => navigate("/login")}>
            로그인을 해주세요<span className="go">{">"}</span>
          </LoginMessage>
        )}
      </InfoAreaWrapper>

      <MenuGroupsWrapper>
        {menuGroups.map((group, idx) => {
          const requiresLogin = ["내 계정", "커뮤니티", "룸메이트"].includes(
            group.title ?? "",
          );
          const isProtected = !isLoggedIn && requiresLogin;

          return (
            <React.Fragment key={idx}>
              {group.menus.length > 0 && (
                <ProtectedMenuWrapper disabled={isProtected}>
                  <MenuGroup title={group.title} menus={group.menus} />
                  {isProtected && (
                    <OverlayMessage>로그인 후 사용 가능해요.</OverlayMessage>
                  )}
                </ProtectedMenuWrapper>
              )}
              {idx < menuGroups.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </MenuGroupsWrapper>
    </MyPageWrapper>
  );
};
export default MyPage;

const MyPageWrapper = styled.div`
  padding: 90px 16px;
  padding-bottom: 120px;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;
  background: #fafafa;
`;

const MenuGroupsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e0e0e0; /* 연한 회색 */
  width: 100%;
`;

const LoginMessage = styled.div`
  text-align: start;
  font-size: 18px;
  font-weight: 500;
  color: black;
  height: fit-content;
  .go {
    font-size: 16px;
    margin-left: 5px;
    font-weight: 300;
  }
`;

const InfoAreaWrapper = styled.div`
  margin-bottom: 24px; /* 원하는 여백 크기 */
`;

const ProtectedMenuWrapper = styled.div<{ disabled: boolean }>`
  position: relative;
  opacity: ${(props) => (props.disabled ? 0.4 : 1)};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
`;

const OverlayMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  font-size: 15px;
  font-weight: 600;
  color: #333; /* 더 진한 글자색 */
  background: rgba(255, 255, 255, 0.9); /* 밝은 배경 유지 */

  padding: 8px 14px;
  border-radius: 10px;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 부드러운 그림자 */
  pointer-events: none;
  white-space: nowrap;
  z-index: 1;
`;
