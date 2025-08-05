import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import StyledInput from "../components/common/StyledInput.tsx";
import SquareButton from "../components/common/SquareButton.tsx";
import { useState } from "react";
import { login } from "../apis/members.ts";
import useUserStore from "../stores/useUserStore.ts";
import Header from "../components/common/Header.tsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const { setTokenInfo, setUserInfo, userInfo } = useUserStore(); // store에서 setTokenInfo 불러오기

  const isFilled = () => {
    return id.trim() !== "" && password.trim() !== "";
  };

  const handleLogin = async () => {
    try {
      const response = await login(id, password);
      console.log(response);

      if (response.status === 201) {
        const tokenInfo = response.data;
        console.log(tokenInfo);

        // 토큰 로컬스토리지에 저장
        localStorage.setItem("accessToken", tokenInfo.accessToken);
        localStorage.setItem("refreshToken", tokenInfo.refreshToken);

        setTokenInfo(tokenInfo);
        if (id === "admin") {
          setUserInfo({ ...userInfo, isAdmin: true });
        }
        navigate("/home");
      } else {
        alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
      console.error(error);
    }
  };

  return (
    <LoginPageWrapper>
      <Header title={"로그인"} hasBack={true} />
      <div>
        {/*<h1>로그인</h1>*/}
        <span className="description">
          인천대학교 포털 아이디, 비밀번호로 간편하게 로그인할 수 있어요.
        </span>

        <h3>아이디</h3>
        <StyledInput
          placeholder="아이디를 입력하세요."
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <h3>비밀번호</h3>
        <StyledInput
          type="password"
          placeholder="영문, 숫자 조합 8~16자"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <ButtonWrapper>
        <SquareButton
          text="로그인"
          disabled={!isFilled()}
          onClick={handleLogin}
        />
      </ButtonWrapper>
    </LoginPageWrapper>
  );
}
const LoginPageWrapper = styled.div`
  padding: 20px;
  padding-top: 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;
  overflow-y: auto;
  justify-content: space-between;

  background: #f4f4f4;

  .description {
    font-size: 14px;
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 16px;
  box-sizing: border-box;
  background: rgba(244, 244, 244, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;
