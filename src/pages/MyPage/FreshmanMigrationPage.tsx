import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/constants/paths";
import StyledInput from "../../components/common/StyledInput.tsx";
import SquareButton from "../../components/common/SquareButton.tsx";
import React, { useState } from "react";
import { putInuStudent } from "@/apis/members";
import useUserStore from "../../stores/useUserStore.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

export default function FreshmanMigrationPage() {
  const { t } = useTranslation("mypage");
  const navigate = useNavigate();
  const { setTokenInfo } = useUserStore();

  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 학번은 숫자만 9자리 (인천대 기준 보통 8~9자리)
  const studentNumberRegex = /^[0-9]{8,10}$/;

  const isValidStudentNumber = studentNumberRegex.test(studentNumber);
  const isValidPw = password.length > 0;

  const handleMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidStudentNumber || !isValidPw) return;

    if (
      !window.confirm(
        t("migration.confirmMessage", { studentNumber }),
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await putInuStudent(studentNumber, password);
      if (response.status === 200) {
        setTokenInfo(response.data);

        alert(t("migration.success"));
        navigate(PATHS.HOME, { replace: true });
      } else {
        alert(t("migration.failed"));
      }
    } catch (error) {
      alert(t("migration.error"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: t("migration.title") });

  return (
    <FormWrapper onSubmit={handleMigration}>
      {isLoading && <LoadingSpinner overlay message={t("migration.loading")} />}

      <div>
        <span className="description" style={{ whiteSpace: "pre-line" }}>
          {t("migration.description")}
        </span>

        <InputGroup>
          <h3>{t("migration.studentIdLabel")}</h3>
          <StyledInput
            placeholder={t("migration.studentIdPlaceholder")}
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
          {studentNumber.length > 0 && !isValidStudentNumber && (
            <ErrorMessage>{t("migration.studentIdError")}</ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <h3>{t("migration.passwordLabel")}</h3>
          <StyledInput
            type="password"
            placeholder={t("migration.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputGroup>
      </div>

      <ButtonWrapper>
        <SquareButton
          text={t("migration.submit")}
          type="submit"
          disabled={!isValidStudentNumber || !isValidPw || isLoading}
        />
      </ButtonWrapper>
    </FormWrapper>
  );
}

const FormWrapper = styled.form`
  padding: 20px 16px calc(100px + var(--safe-area-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  .description {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 24px;
    display: block;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  h3 {
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
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
  padding: 16px 16px calc(16px + var(--safe-area-bottom, 0px));
  background: white;
  border-top: 1px solid #eee;
  z-index: 10;
`;
