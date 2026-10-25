import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { X, ShieldCheck, Lock, User } from "lucide-react";
import { savePortalAccount, isMobileAppEnvironment } from "@/apis/mobileAgentBridge";
import CapsuleButton from "@/components/common/CapsuleButton";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PortalAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStudentId("");
      setPassword("");
      setErrorMessage("");
      setLoadingMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      setErrorMessage("학번과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (!isMobileAppEnvironment()) {
      setErrorMessage("포털 계정 연동은 유니돔 모바일 앱 환경에서만 지원됩니다.");
      return;
    }

    setLoading(true);
    setLoadingMessage("기기 보안 영역에 저장 중...");
    setErrorMessage("");

    try {
      const res = await savePortalAccount(studentId.trim(), password.trim());
      if (res.success) {
        localStorage.setItem("portal_student_id", studentId.trim());
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.errorMessage || "계정 연동에 실패했습니다.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>포털 계정 1회 연동</Title>
          <CloseButton onClick={onClose} type="button">
            <X size={20} color="var(--text-tertiary)" />
          </CloseButton>
        </Header>

        <SecurityNotice>
          <ShieldCheck size={18} color="var(--text-success)" />
          <SecurityNoticeText>
            <strong>안심하세요!</strong> 인천대 포털, LMS, 도서관은 동일한 학번/비밀번호를 사용합니다. 1회만 등록하시면 기기 보안 영역(KeyStore)에만 암호화 보관되며, 포털 학적·LMS 과제·도서관 좌석이 한 번에 자동 연동됩니다.
          </SecurityNoticeText>
        </SecurityNotice>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputLabel>포털 학번</InputLabel>
            <InputWrap>
              <User size={16} color="var(--text-tertiary)" />
              <Input
                type="text"
                placeholder="예: 202101234"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={loading}
              />
            </InputWrap>
          </InputGroup>

          <InputGroup>
            <InputLabel>포털 비밀번호</InputLabel>
            <InputWrap>
              <Lock size={16} color="var(--text-tertiary)" />
              <Input
                type="password"
                placeholder="포털 비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </InputWrap>
          </InputGroup>

          {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

          <CapsuleButton
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
            style={{ marginTop: 6 }}
          >
            {loading ? (loadingMessage || "기기에 안전하게 저장 중...") : "계정 연동 완료"}
          </CapsuleButton>
        </Form>
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: var(--bg-base);
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SecurityNotice = styled.div`
  background: rgb(232, 248, 240);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const SecurityNoticeText = styled.p`
  font-size: 11.5px;
  color: var(--text-success);
  line-height: 1.45;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InputLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-700);
`;

const InputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-muted);
  border-radius: 10px;
  padding: 0 12px;
  height: 44px;
`;

const Input = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;

  &::placeholder {
    color: var(--text-disabled);
  }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: var(--text-error);
`;


