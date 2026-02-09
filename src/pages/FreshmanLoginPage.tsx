import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import StyledInput from "../components/common/StyledInput.tsx";
import SquareButton from "../components/common/SquareButton.tsx";
import React, { useState } from "react";
import { signupFreshman } from "@/apis/members";
import useUserStore from "../stores/useUserStore.ts";
import LoadingSpinner from "../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

export default function FreshmanLoginPage() {
  const navigate = useNavigate();
  const { setTokenInfo } = useUserStore();

  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 영문 또는 영문+숫자 5자 이상
  const idRegex = /^[a-zA-Z0-9]{5,}$/;
  // 영문, 숫자 필수 포함 및 특수문자 허용 5자 이상
  const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{5,}$/;

  const isValidId = idRegex.test(studentNumber);
  const isValidPw = pwRegex.test(password);

  const handleIntegrateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidId || !isValidPw) return;

    if (
      !window.confirm(
        `입력하신 정보는 다음과 같습니다.\n아이디:${studentNumber}\n비밀번호:${password}\n입력하신 아이디와 비밀번호는 수정이 어렵고 분실 시 찾기 어려우니, 다시한번 꼭 확인해주세요.\n추후 학번이 부여되면 계정 통합에 대해 안내 드리겠습니다.\n\n입력하신 정보로 로그인(회원가입)할까요?`,
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await signupFreshman(studentNumber, password);
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

  useSetHeader({ title: "신입생 임시 로그인" });

  return (
    <FormWrapper onSubmit={handleIntegrateLogin}>
      {isLoading && <LoadingSpinner overlay message="처리 중..." />}

      <div>
        <span className="description">
          학번이 없는 신입생을 위한 임시 로그인(가입)입니다. <br />
          신규 아이디인 경우 자동으로 회원가입 및 로그인됩니다.
          <br />
          추후 학번이 부여되면 계정 통합 관련 안내가 진행될 예정입니다. 현재
          로그인하신 아이디와 비밀번호를 꼭 기억해주세요!
        </span>

        <InputGroup>
          <h3>아이디 (임시)</h3>
          <StyledInput
            placeholder="영문 또는 영문+숫자 5자 이상"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
          {studentNumber.length > 0 && !isValidId && (
            <ErrorMessage>
              영문 또는 숫자를 포함하여 5자리 이상 입력해주세요.
            </ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <h3>비밀번호</h3>
          <StyledInput
            type="password"
            placeholder="영문, 숫자 포함 5자 이상 (특수문자 가능)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && !isValidPw && (
            <ErrorMessage>
              영문과 숫자를 조합하여 5자리 이상 입력해주세요. (특수문자 가능)
            </ErrorMessage>
          )}
        </InputGroup>
      </div>

      <ButtonWrapper>
        <SquareButton
          text="로그인 및 시작하기"
          type="submit"
          disabled={!isValidId || !isValidPw || isLoading}
        />
      </ButtonWrapper>
    </FormWrapper>
  );
}

const FormWrapper = styled.form`
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  .description {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    margin-bottom: 10px;
    display: block;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  h3 {
    margin-bottom: 8px;
  }
`;

const ErrorMessage = styled.span`
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
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
