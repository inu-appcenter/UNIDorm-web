import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import StyledInput from "../components/common/StyledInput.tsx";
import SquareButton from "../components/common/SquareButton.tsx";
import React, { useState } from "react";
import { signupFreshman, login } from "@/apis/members";
import useUserStore from "../stores/useUserStore.ts";
import LoadingSpinner from "../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

export default function FreshmanLoginPage() {
  const navigate = useNavigate();
  const { setTokenInfo } = useUserStore();

  // API 명세(studentNumber)에 맞춰 상태 이름 변경
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isFilled = () => studentNumber.trim() !== "" && password.trim() !== "";

  const handleIntegrateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFilled()) return;

    setIsLoading(true);
    try {
      // 1. 회원가입 시도 (이미 가입된 경우 에러가 발생하므로 try-catch로 감싸기)
      try {
        await signupFreshman(studentNumber, password);
      } catch (signupError: any) {
        // 400(Bad Request)이나 409(Conflict) 등 이미 가입된 계정인 경우 무시하고 진행
        console.log("이미 가입된 계정이거나 가입 단계 건너뜀");
      }

      // 2. 로그인 시도
      const response = await login(studentNumber, password);

      if (response.status === 201 || response.status === 200) {
        const tokenInfo = response.data;

        // 토큰 및 사용자 정보 저장
        localStorage.setItem("accessToken", tokenInfo.accessToken);
        localStorage.setItem("refreshToken", tokenInfo.refreshToken);
        localStorage.setItem("role", tokenInfo.role);

        setTokenInfo(tokenInfo);
        navigate("/home");
      }
    } catch (loginError: any) {
      // 회원가입 실패 후 로그인도 실패한 경우 (비밀번호 불일치 등)
      alert("로그인에 실패했습니다. 비밀번호를 확인하거나 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: "신입생 로그인/가입" });

  return (
    <FormWrapper onSubmit={handleIntegrateLogin}>
      {isLoading && <LoadingSpinner overlay message="처리 중..." />}

      <div>
        <span className="description">
          학번이 없는 신입생을 위한 전용 페이지입니다.
          <br />
          아이디가 없으면 자동으로 생성 후 로그인됩니다.
        </span>

        <h3>아이디 (임시)</h3>
        <StyledInput
          placeholder="아이디를 입력하세요."
          value={studentNumber}
          onChange={(e) => setStudentNumber(e.target.value)}
        />
        <h3>비밀번호</h3>
        <StyledInput
          type="password"
          placeholder="비밀번호를 입력하세요."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <ButtonWrapper>
        <SquareButton
          text="로그인 및 시작하기"
          type="submit"
          disabled={!isFilled() || isLoading}
        />
      </ButtonWrapper>
    </FormWrapper>
  );
}

const FormWrapper = styled.form`
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  .description {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }
`;

const ButtonWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(10px);
  z-index: 10;
`;
