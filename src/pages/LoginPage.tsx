import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import StyledInput from "../components/common/StyledInput.tsx";
import SquareButton from "../components/common/SquareButton.tsx";
import { useState } from "react";
import { login } from "../apis/members.ts";
import useUserStore from "../stores/useUserStore.ts";
import Header from "../components/common/Header/Header.tsx";
import React from "react";
import LoadingSpinner from "../components/common/LoadingSpinner.tsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ✅ 로딩 상태 추가
  const { setTokenInfo } = useUserStore();

  const isFilled = () => {
    return id.trim() !== "" && password.trim() !== "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFilled()) {
      return;
    }

    setIsLoading(true); // ✅ 로그인 시작 시 로딩 상태 true 설정

    try {
      const response = await login(id, password);
      console.log(response);

      if (response.status === 201) {
        const tokenInfo = response.data;
        console.log(tokenInfo);

        // 토큰 로컬스토리지에 저장
        localStorage.setItem("accessToken", tokenInfo.accessToken);
        localStorage.setItem("refreshToken", tokenInfo.refreshToken);
        localStorage.setItem("role", tokenInfo.role);

        setTokenInfo(tokenInfo);

        navigate("/home");
      } else {
        alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
      console.error(error);
    } finally {
      setIsLoading(false); // ✅ 로그인 완료(성공/실패) 후 로딩 상태 false 설정
    }
  };

  return (
    <LoginFormWrapper onSubmit={handleLogin}>
      <Header title={"로그인"} hasBack={true} />
      {isLoading && <LoadingSpinner overlay message="로그인 중..." />}

      <div>
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
          type="submit"
          disabled={!isFilled() || isLoading} // ✅ 로딩 중일 때도 버튼 비활성화
        />
      </ButtonWrapper>
    </LoginFormWrapper>
  );
}

const LoginFormWrapper = styled.form`
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
