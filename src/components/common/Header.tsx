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

  return (
    <StyledHeader>
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
      <img src={noti} alt="알림" />
    </StyledHeader>
  );
}

const StyledHeader = styled.header`
  width: 100%;
  height: 70px;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .Title {
    font-family: "Pretendard";
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
