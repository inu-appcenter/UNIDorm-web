import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import back from "../../assets/header/back.svg";
import noti from "../../assets/header/noti.svg";

interface HeaderProps {
  title: string;
  hasBack: boolean;
}

export default function Header({ title, hasBack }: HeaderProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // 👈 이전 페이지로 이동
  };

  const handleNotiBtnClick = () => {
    navigate("/notification");
  };
  const shadowSelector = () => {
    if (title === "알림") return true;
    else return false;
  };

  return (
    <StyledHeader $hasShadow={shadowSelector()}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {hasBack && (
          <img
            src={back}
            alt={"뒤로가기"}
            onClick={handleBackClick}
            style={{ cursor: "pointer" }}
          />
        )}
        <div className="Title">{title}</div>
      </div>
      <img src={noti} alt="알림" onClick={handleNotiBtnClick} />
    </StyledHeader>
  );
}

const StyledHeader = styled.header<{ $hasShadow: boolean }>`
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
