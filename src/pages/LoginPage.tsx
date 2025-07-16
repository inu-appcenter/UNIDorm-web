import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import StyledInput from "../components/common/StyledInput.tsx";
import SquareButton from "../components/common/SquareButton.tsx";
import { useState } from "react";
import { login } from "../apis/members.ts";
import useUserStore from "../stores/useUserStore.ts";

export default function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const { setTokenInfo } = useUserStore(); // store에서 setTokenInfo 불러오기

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
      <div>
        <h1>로그인</h1>

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

      <SquareButton
        text="로그인"
        disabled={!isFilled()}
        onClick={handleLogin}
      />
    </LoginPageWrapper>
  );
}
const LoginPageWrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;

  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  justify-content: space-between;

  background: #f4f4f4;
`;
