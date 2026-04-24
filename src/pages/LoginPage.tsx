import React, { useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { login, loginFreshman } from "@/apis/members";
import StyledInput from "@/components/common/StyledInput.tsx";
import SquareButton from "@/components/common/SquareButton.tsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import {
  FRESHMAN_LOGIN_FEATURE_FLAG_KEY,
  FRESHMAN_SIGNUP_FEATURE_FLAG_KEY,
} from "@/constants/featureFlags";
import { PATHS } from "@/constants/paths";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import useUserStore from "@/stores/useUserStore";
import { mixpanelTrack } from "@/utils/mixpanel";
import {
  AuthButtonWrapper,
  AuthDescription,
  AuthFormWrapper,
  AuthInputGroup,
  AuthLinkRow,
} from "@/styles/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setTokenInfo } = useUserStore();
  const { flag: isFreshmanLoginEnabled } = useFeatureFlag(
    FRESHMAN_LOGIN_FEATURE_FLAG_KEY,
  );
  const { flag: isFreshmanSignupEnabled } = useFeatureFlag(
    FRESHMAN_SIGNUP_FEATURE_FLAG_KEY,
  );

  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isFilled = studentNumber.trim() !== "" && password.trim() !== "";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFilled) return;

    setIsLoading(true);
    try {
      let portalError: unknown;

      try {
        const response = await login(studentNumber, password);
        setTokenInfo(response.data);
        mixpanelTrack.loginCompleted("포털 계정");
        navigate(PATHS.HOME);
        return;
      } catch (error) {
        portalError = error;
        console.error(error);
      }

      if (!isFreshmanLoginEnabled) {
        throw portalError;
      }

      const freshmanResponse = await loginFreshman(studentNumber, password);
      setTokenInfo(freshmanResponse.data);
      mixpanelTrack.loginCompleted("신입생 임시 계정");
      navigate(PATHS.HOME);
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 401) {
        alert("비밀번호가 일치하지 않습니다.");
      } else if (status === 404) {
        alert(
          isFreshmanLoginEnabled
            ? "포털 계정 또는 신입생 임시 계정을 찾을 수 없습니다. 회원가입 여부를 확인해 주세요."
            : "아이디 또는 비밀번호를 확인해 주세요.",
        );
      } else if (status === 400) {
        alert("아이디 또는 비밀번호를 확인해 주세요.");
      } else {
        alert("로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: "로그인" });

  return (
    <AuthFormWrapper onSubmit={handleLogin}>
      {isLoading && <LoadingSpinner overlay message="로그인 중..." />}

      <div>
        <AuthDescription>
          인천대학교 포털 계정으로 로그인할 수 있어요.
          <br />
          {isFreshmanLoginEnabled
            ? "신입생 임시 계정이 있다면, 신입생 계정으로도 로그인할 수 있습니다."
            : null}
        </AuthDescription>

        <AuthInputGroup>
          <h3>아이디</h3>
          <StyledInput
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
        </AuthInputGroup>

        <AuthInputGroup>
          <h3>비밀번호</h3>
          <StyledInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AuthInputGroup>
      </div>

      <AuthButtonWrapper>
        <SquareButton
          text="로그인"
          type="submit"
          disabled={!isFilled || isLoading}
        />

        {/*{isFreshmanLoginEnabled && (*/}
        {/*  <AuthLinkRow>*/}
        {/*    <span>신입생 임시 계정이 이미 있으신가요?</span>*/}
        {/*    <button*/}
        {/*      type="button"*/}
        {/*      onClick={() => navigate(PATHS.FRESHMAN_LOGIN)}*/}
        {/*    >*/}
        {/*      신입생 로그인*/}
        {/*    </button>*/}
        {/*  </AuthLinkRow>*/}
        {/*)}*/}

        {isFreshmanSignupEnabled && (
          <AuthLinkRow>
            <span>포털 계정이 아직 발급되지 않으셨나요?</span>
            <button
              type="button"
              onClick={() => navigate(PATHS.FRESHMAN_SIGNUP)}
            >
              신입생 회원가입
            </button>
          </AuthLinkRow>
        )}
      </AuthButtonWrapper>
    </AuthFormWrapper>
  );
}
