import styled from "styled-components";
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
        `입력하신 학번(${studentNumber})으로 계정 통합을 진행할까요?
통합 후에는 기존 임시 아이디로는 로그인이 불가하며, 학교 포털 계정으로 로그인해야 합니다.`,
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await putInuStudent(studentNumber, password);
      if (response.status === 200) {
        const tokenInfo = response.data;
        // 새로운 토큰으로 업데이트 (보통 계정 통합 후 세션 갱신이 필요할 수 있음)
        localStorage.setItem("accessToken", tokenInfo.accessToken);
        localStorage.setItem("refreshToken", tokenInfo.refreshToken);
        localStorage.setItem("role", tokenInfo.role);
        setTokenInfo(tokenInfo);

        alert("계정 통합이 완료되었습니다. 새로운 계정으로 다시 로그인해주세요.");
        navigate(PATHS.LOGIN);
      } else {
        alert("계정 통합에 실패했습니다. 학번과 포털 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      alert("계정 통합 중 오류가 발생했습니다. 학번과 포털 비밀번호를 확인해주세요.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useSetHeader({ title: "학번 계정 통합" });

  return (
    <FormWrapper onSubmit={handleMigration}>
      {isLoading && <LoadingSpinner overlay message="처리 중..." />}

      <div>
        <span className="description">
          신입생 임시 계정을 학교 포털 계정(학번)으로 통합합니다. <br />
          통합 후에는 기존에 작성한 게시글, 설정 등이 유지되며 <br />
          로그인 시에는 통합된 학번 계정을 사용해야 합니다.
        </span>

        <InputGroup>
          <h3>학교 학번</h3>
          <StyledInput
            placeholder="부여받은 학번을 입력해주세요."
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
          {studentNumber.length > 0 && !isValidStudentNumber && (
            <ErrorMessage>
              올바른 학번 형식을 입력해주세요. (8~10자리 숫자)
            </ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <h3>포털 비밀번호</h3>
          <StyledInput
            type="password"
            placeholder="학교 포털 비밀번호를 입력해주세요."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputGroup>
      </div>

      <ButtonWrapper>
        <SquareButton
          text="계정 통합하기"
          type="submit"
          disabled={!isValidStudentNumber || !isValidPw || isLoading}
        />
      </ButtonWrapper>
    </FormWrapper>
  );
}

const FormWrapper = styled.form`
  padding: 20px 16px;
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
  padding: 16px;
  background: white;
  border-top: 1px solid #eee;
  z-index: 10;
`;
