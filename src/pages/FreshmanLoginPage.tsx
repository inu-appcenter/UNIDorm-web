import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { loginFreshman } from "@/apis/members";
import StyledInput from "@/components/common/StyledInput.tsx";
import SquareButton from "@/components/common/SquareButton.tsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import { FRESHMAN_MIGRATION_FEATURE_FLAG_KEY } from "@/constants/featureFlags";
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
  const { t } = useTranslation("mypage");
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
          ? t("freshmanLogin.successWithMigration")
          : t("freshmanLogin.success"),
      );
      navigate(PATHS.HOME, { replace: true });
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 401) {
        alert(t("freshmanLogin.errors.wrongPassword"));
      } else if (status === 404) {
        alert(t("freshmanLogin.errors.notFound"));
      } else if (status === 400) {
        alert(t("freshmanLogin.errors.invalidInput"));
      } else {
        alert(t("freshmanLogin.errors.failed"));
      }

      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: t("freshmanLogin.title") });

  return (
    <AuthFormWrapper onSubmit={handleLogin}>
      {isLoading && <LoadingSpinner overlay message={t("freshmanLogin.loading")} />}

      <div>
        <AuthDescription>
          {t("freshmanLogin.description")}
          {isFreshmanMigrationEnabled && (
            <>
              <br />
              {t("freshmanLogin.migrationHint")}
            </>
          )}
        </AuthDescription>

        <AuthInputGroup>
          <h3>{t("freshmanLogin.idLabel")}</h3>
          <StyledInput
            placeholder={t("freshmanLogin.idPlaceholder")}
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
          {studentNumber.length > 0 && !isValidId && (
            <AuthErrorMessage>{t("freshmanLogin.idError")}</AuthErrorMessage>
          )}
        </AuthInputGroup>

        <AuthInputGroup>
          <h3>{t("freshmanLogin.passwordLabel")}</h3>
          <StyledInput
            type="password"
            placeholder={t("freshmanLogin.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && !isValidPassword && (
            <AuthErrorMessage>
              {t("freshmanLogin.passwordError")}
            </AuthErrorMessage>
          )}
        </AuthInputGroup>
      </div>

      <AuthButtonWrapper>
        <SquareButton
          text={t("freshmanLogin.submit")}
          type="submit"
          disabled={!isSubmittable}
        />
      </AuthButtonWrapper>
    </AuthFormWrapper>
  );
}
