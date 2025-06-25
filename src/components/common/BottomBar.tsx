import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

import buy from "../../assets/bottombar/buy.svg";
import chat from "../../assets/bottombar/chat.svg";
import home from "../../assets/bottombar/home.svg";
import roommate from "../../assets/bottombar/roommate.svg";
import mypage from "../../assets/bottombar/mypage.svg";

interface ButtonProps {
  imgsrc: string;
  buttonName: string;
  path: string;
}

const Button = ({ imgsrc, buttonName, path }: ButtonProps) => {
  const navigate = useNavigate();

  return (
    <ButtonWrapper onClick={() => navigate(path)}>
      <img src={imgsrc} alt={buttonName} />
      <div className="BtnName">{buttonName}</div>
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 100%;
  gap: 5px;
  cursor: pointer;

  .BtnName {
    font-size: 8px;
  }
`;

export default function BottomBar() {
  const location = useLocation();
  console.log(location.pathname);

  return location.pathname.includes("/chat/roommate") ||
    location.pathname.includes("/chat/groupPurchase") ? (
    <></>
  ) : (
    <StyledFooter>
      <Button imgsrc={home} buttonName={"홈"} path={"/home"} />
      <Button imgsrc={roommate} buttonName={"룸메"} path={"/roommate"} />
      <Button imgsrc={buy} buttonName={"공구"} path={"/groupPurchase"} />
      <Button imgsrc={chat} buttonName={"채팅"} path={"/chat"} />
      <Button imgsrc={mypage} buttonName={"마이페이지"} path={"/mypage"} />
    </StyledFooter>
  );
}

const StyledFooter = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  height: 70px;
  background: #f4f4f4;
  padding: 0 20px;
  box-sizing: border-box;

  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;
