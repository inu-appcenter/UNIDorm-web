import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { login, loginFreshman } from "@/apis/members";
import { savePortalAccount, isPortalAgentAvailable } from "@/apis/mobileAgentBridge";
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
import {
  AuthButtonWrapper,
  AuthDescription,
  AuthFormWrapper,
  AuthInputGroup,
  AuthLinkRow,
} from "@/styles/auth";

export default function LoginPage() {
  const { t } = useTranslation("mypage");
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
        if (isPortalAgentAvailable()) {
          try {
            await savePortalAccount(studentNumber.trim(), password.trim());
            localStorage.setItem("portal_student_id", studentNumber.trim());
          } catch (e) {
            console.error("포털 계정 자동 연동 실패", e);
          }
        }
        //mixpanelTrack.loginCompleted("포털 계정");
        navigate(PATHS.HOME, { replace: true });
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
      //mixpanelTrack.loginCompleted("신입생 임시 계정");
      navigate(PATHS.HOME, { replace: true });
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 401) {
        alert(t("login.errors.wrongPassword"));
      } else if (status === 404) {
        alert(
          isFreshmanLoginEnabled
            ? t("login.errors.notFoundWithFreshman")
            : t("login.errors.invalidCredentials"),
        );
      } else if (status === 400) {
        alert(t("login.errors.invalidCredentials"));
      } else {
        alert(t("login.errors.failed"));
      }

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: t("login.title") });

  return (
    <AuthFormWrapper onSubmit={handleLogin}>
      {isLoading && <LoadingSpinner overlay message={t("login.loading")} />}

      <div>
        <AuthDescription>
          {t("login.description")}
          <br />
          {isFreshmanLoginEnabled ? t("login.freshmanHint") : null}
        </AuthDescription>

        <AuthInputGroup>
          <h3>{t("login.idLabel")}</h3>
          <StyledInput
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
        </AuthInputGroup>

        <AuthInputGroup>
          <h3>{t("login.passwordLabel")}</h3>
          <StyledInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AuthInputGroup>
      </div>

      <AuthButtonWrapper>
        <SquareButton
          text={t("login.submit")}
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
            <span>{t("login.noPortalAccount")}</span>
            <button
              type="button"
              onClick={() => navigate(PATHS.FRESHMAN_SIGNUP)}
            >
              {t("login.goFreshmanSignup")}
            </button>
          </AuthLinkRow>
        )}
      </AuthButtonWrapper>
    </AuthFormWrapper>
  );
}
