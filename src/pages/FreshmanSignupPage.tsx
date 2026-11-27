import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("mypage");
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
      t("freshmanSignup.confirmMessage", { id: studentNumber }),
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      const response = await signupFreshman(studentNumber, password);
      setTokenInfo(response.data);
      alert(t("freshmanSignup.success"));
      navigate(PATHS.HOME);
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 409) {
        alert(t("freshmanSignup.errors.conflict"));
      } else if (status === 400) {
        alert(t("freshmanSignup.errors.invalidInput"));
      } else {
        alert(t("freshmanSignup.errors.failed"));
      }

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: t("freshmanSignup.title") });

  return (
    <AuthFormWrapper onSubmit={handleSignup}>
      {isLoading && <LoadingSpinner overlay message={t("freshmanSignup.loading")} />}

      <div>
        <AuthDescription>
          {t("freshmanSignup.description1")}
          <br />
          {t("freshmanSignup.description2")}
          <br />
          {t("freshmanSignup.description3")}
        </AuthDescription>

        <AuthInputGroup>
          <h3>{t("freshmanSignup.idLabel")}</h3>
          <StyledInput
            placeholder={t("freshmanSignup.idPlaceholder")}
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
          {studentNumber.length > 0 && !isValidId && (
            <AuthErrorMessage>{t("freshmanSignup.idError")}</AuthErrorMessage>
          )}
        </AuthInputGroup>

        <AuthInputGroup>
          <h3>{t("freshmanSignup.passwordLabel")}</h3>
          <StyledInput
            type="password"
            placeholder={t("freshmanSignup.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && !isValidPassword && (
            <AuthErrorMessage>
              {t("freshmanSignup.passwordError")}
            </AuthErrorMessage>
          )}
        </AuthInputGroup>

        <AuthInputGroup>
          <h3>{t("freshmanSignup.passwordConfirmLabel")}</h3>
          <StyledInput
            type="password"
            placeholder={t("freshmanSignup.passwordConfirmPlaceholder")}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
          {passwordConfirm.length > 0 && !isPasswordConfirmed && (
            <AuthErrorMessage>
              {t("freshmanSignup.passwordConfirmError")}
            </AuthErrorMessage>
          )}
        </AuthInputGroup>
      </div>

      <AuthButtonWrapper>
        <SquareButton
          text={t("freshmanSignup.submit")}
          type="submit"
          disabled={!isSubmittable}
        />
      </AuthButtonWrapper>
    </AuthFormWrapper>
  );
}
