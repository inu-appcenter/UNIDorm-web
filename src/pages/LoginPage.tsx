import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import StyledInput from "../components/common/StyledInput.tsx";
import SquareButton from "../components/common/SquareButton.tsx";
import React, { useState } from "react";
import { login } from "@/apis/members";
import useUserStore from "../stores/useUserStore.ts";
import LoadingSpinner from "../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

export default function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setTokenInfo } = useUserStore();

  const isFilled = () => {
    return id.trim() !== "" && password.trim() !== "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFilled()) return;

    setIsLoading(true);
    try {
      const response = await login(id, password);
      if (response.status === 201) {
        const tokenInfo = response.data;
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
      setIsLoading(false);
    }
  };

  useSetHeader({ title: "로그인" });

  return (
    <LoginFormWrapper onSubmit={handleLogin}>
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
          disabled={!isFilled() || isLoading}
        />

        {/* 추가된 신입생 전용 링크 섹션 */}
        <FreshmanLinkWrapper>
          <span>신입생이신가요?</span>
          <button type="button" onClick={() => navigate("/login/freshman")}>
            신입생 로그인 및 회원가입
          </button>
        </FreshmanLinkWrapper>
      </ButtonWrapper>
    </LoginFormWrapper>
  );
}

const LoginFormWrapper = styled.form`
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
  flex: 1;
  overflow-y: auto;

  .description {
    font-size: 14px;
    color: #666;
  }
`;

const ButtonWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column; /* 버튼과 링크를 세로로 배치 */
  align-items: center;
  padding: 16px;
  padding-bottom: 30px; /* 하단 여유 공간 추가 */
  box-sizing: border-box;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

const FreshmanLinkWrapper = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 8px;
  font-size: 14px;
  color: #999;

  button {
    background: none;
    border: none;
    color: #333;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
  }
`;
