import React, { useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { loginFreshman } from "@/apis/members";
import StyledInput from "@/components/common/StyledInput.tsx";
import SquareButton from "@/components/common/SquareButton.tsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {
  FRESHMAN_MIGRATION_FEATURE_FLAG_KEY,
  FRESHMAN_SIGNUP_FEATURE_FLAG_KEY,
} from "@/constants/featureFlags";
import { PATHS } from "@/constants/paths";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
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

export default function FreshmanLoginPage() {
  const navigate = useNavigate();
  const { setTokenInfo } = useUserStore();

  const { flag: isFreshmanMigrationEnabled } = useFeatureFlag(
    FRESHMAN_MIGRATION_FEATURE_FLAG_KEY,
  );

  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidId = freshmanIdRegex.test(studentNumber);
  const isValidPassword = freshmanPasswordRegex.test(password);
  const isSubmittable = isValidId && isValidPassword && !isLoading;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSubmittable) return;

    try {
      setIsLoading(true);
      const response = await loginFreshman(studentNumber, password);
      setTokenInfo(response.data);

      alert(
        isFreshmanMigrationEnabled
          ? "신입생 임시 계정으로 로그인했어요.\n\n홈 화면 배너에서 포털 계정 통합을 진행해 주세요."
          : "신입생 임시 계정으로 로그인했어요.",
      );
      navigate(PATHS.HOME);
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 401) {
        alert("비밀번호가 일치하지 않습니다.");
      } else if (status === 404) {
        alert("등록되지 않은 신입생 계정입니다.");
      } else if (status === 400) {
        alert("입력값을 다시 확인해 주세요.");
      } else {
        alert("로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: "신입생 임시계정 로그인" });

  return (
    <AuthFormWrapper onSubmit={handleLogin}>
      {isLoading && <LoadingSpinner overlay message="로그인 중..." />}

      <div>
        <AuthDescription>
          회원가입으로 만든 신입생 임시 계정으로 로그인할 수 있어요.
          {isFreshmanMigrationEnabled && (
            <>
              <br />
              임시 계정 로그인 후 홈 화면 배너에서 계정 통합을 진행해 주세요.
            </>
          )}
        </AuthDescription>

        <AuthInputGroup>
          <h3>임시 계정 아이디</h3>
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
      </div>

      <AuthButtonWrapper>
        <SquareButton
          text="신입생 임시계정 로그인"
          type="submit"
          disabled={!isSubmittable}
        />
      </AuthButtonWrapper>
    </AuthFormWrapper>
  );
}
