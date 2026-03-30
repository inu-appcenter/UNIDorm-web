import React, { useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { signupFreshman } from "@/apis/members";
import StyledInput from "@/components/common/StyledInput.tsx";
import SquareButton from "@/components/common/SquareButton.tsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import { PATHS } from "@/constants/paths";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import {
  AuthButtonWrapper,
  AuthDescription,
  AuthErrorMessage,
  AuthFormWrapper,
  AuthInputGroup,
} from "@/styles/auth";

const freshmanIdRegex = /^[a-zA-Z0-9]{5,}$/;
const freshmanPasswordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{5,}$/;

export default function FreshmanSignupPage() {
  const navigate = useNavigate();
  const { setTokenInfo } = useUserStore();

  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidId = freshmanIdRegex.test(studentNumber);
  const isValidPassword = freshmanPasswordRegex.test(password);
  const isPasswordConfirmed =
    passwordConfirm.length > 0 && password === passwordConfirm;
  const isSubmittable =
    isValidId && isValidPassword && isPasswordConfirmed && !isLoading;

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSubmittable) return;

    const confirmed = window.confirm(
      [
        `임시 계정 아이디: ${studentNumber}`,
        "계정 찾기가 지원되지 않으니 아이디와 비밀번호를 꼭 기억해 주세요.",
        "이 정보로 신입생 임시 계정을 생성할까요?",
      ].join("\n"),
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await signupFreshman(studentNumber, password);
      setTokenInfo(response.data);
      alert("신입생 회원가입이 완료되었습니다. 바로 로그인됩니다.");
      navigate(PATHS.HOME);
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 409) {
        alert("이미 등록된 아이디입니다. 다른 아이디로 다시 시도해 주세요.");
      } else if (status === 400) {
        alert("입력값을 다시 확인해 주세요.");
      } else {
        alert("회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: "신입생 회원가입" });

  return (
    <AuthFormWrapper onSubmit={handleSignup}>
      {isLoading && <LoadingSpinner overlay message="회원가입 중..." />}

      <div>
        <AuthDescription>
          포털 계정이 아직 없다면 신입생 임시 계정을 먼저 만들어 주세요.
          <br />
          가입이 완료되면 자동으로 로그인됩니다.
          <br />
          추후 포털 계정이 발급되면, 포털 계정과 통합 안내를 드릴 예정입니다.
        </AuthDescription>

        <AuthInputGroup>
          <h3>아이디</h3>
          <StyledInput
            placeholder="영문 또는 영문+숫자 5자 이상"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
          {studentNumber.length > 0 && !isValidId && (
            <AuthErrorMessage>
              영문 또는 숫자를 포함하여 5자 이상 입력해 주세요.
            </AuthErrorMessage>
          )}
        </AuthInputGroup>

        <AuthInputGroup>
          <h3>비밀번호</h3>
          <StyledInput
            type="password"
            placeholder="영문과 숫자를 포함해 5자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && !isValidPassword && (
            <AuthErrorMessage>
              영문과 숫자를 함께 포함해 5자 이상 입력해 주세요.
            </AuthErrorMessage>
          )}
        </AuthInputGroup>

        <AuthInputGroup>
          <h3>비밀번호 확인</h3>
          <StyledInput
            type="password"
            placeholder="비밀번호를 한 번 더 입력해 주세요."
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
          {passwordConfirm.length > 0 && !isPasswordConfirmed && (
            <AuthErrorMessage>
              비밀번호가 일치하지 않습니다. 다시 확인해 주세요.
            </AuthErrorMessage>
          )}
        </AuthInputGroup>
      </div>

      <AuthButtonWrapper>
        <SquareButton
          text="회원가입하고 시작하기"
          type="submit"
          disabled={!isSubmittable}
        />
      </AuthButtonWrapper>
    </AuthFormWrapper>
  );
}
