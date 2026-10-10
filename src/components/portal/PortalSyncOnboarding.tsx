import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  ShieldCheck,
  User,
  Lock,
  ChevronRight,
  RotateCcw,
  Smartphone,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  checkPortalAccountLinked,
  savePortalAccount,
  fetchDormitoryStudentInfoFromApp,
  fetchAcademicInfoFromApp,
  resolveCurrentStudentId,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { secureStorage } from "@/utils/secureStorage";
import { colors } from "@/styles/tokens";
import { openIntipAppOrStore } from "@/utils/portalAppLauncher";

interface PortalSyncOnboardingProps {
  onSuccess: () => void;
}

export default function PortalSyncOnboarding({
  onSuccess,
}: PortalSyncOnboardingProps) {
  const [isCheckingLinked, setIsCheckingLinked] = useState<boolean>(true);
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [savedStudentId, setSavedStudentId] = useState<string>("");

  // 폼 입력 상태
  const [studentIdInput, setStudentIdInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isRelinkMode, setIsRelinkMode] = useState<boolean>(false);

  // 로딩 & 에러 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 기기 키스토어 연동 상태 초기 확인
  const checkStatus = useCallback(async () => {
    setIsCheckingLinked(true);
    try {
      if (isMobileAppEnvironment()) {
        const res = await checkPortalAccountLinked().catch(() => ({
          linked: false,
          studentId: undefined,
        }));
        const linked = Boolean(res?.linked);
        setIsLinked(linked);
        const resolvedId =
          res?.studentId ||
          localStorage.getItem("portal_student_id") ||
          resolveCurrentStudentId();
        if (resolvedId) {
          setSavedStudentId(resolvedId);
        }
      } else {
        setIsLinked(false);
      }
    } finally {
      setIsCheckingLinked(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // 포털 데이터 동기화 실행 (기기 로컬 처리)
  const executeSync = async (targetStudentId: string) => {
    setIsLoading(true);
    setErrorMessage("");
    setLoadingMessage("기기에서 안전하게 기숙사 정보를 가져오고 있어요...");

    try {
      // 1. 사생정보 조회
      const dormRes = await fetchDormitoryStudentInfoFromApp({
        stuno: targetStudentId,
      });

      if (!dormRes.success || !dormRes.data) {
        const msg =
          dormRes.errorMessage ||
          "포털에서 기숙사 정보를 가져오지 못했어요. 잠시 후 다시 시도해주세요.";
        throw new Error(msg);
      }

      let finalDormData = dormRes.data;

      // 2. 사진이나 추가 학적이 필요한 경우 학적 정보도 동기화
      setLoadingMessage("학적 및 증명사진을 확인하고 있어요...");
      try {
        const academicRes = await fetchAcademicInfoFromApp(false);
        if (academicRes.success && academicRes.data) {
          await secureStorage.setItem("portal_student_info", academicRes.data);
          const rf = academicRes.data.rawFields || {};
          const photo =
            (academicRes.data as { photoBase64?: string }).photoBase64 ||
            rf.phtFile2 ||
            rf.phtFile1 ||
            rf.phtFile;

          if (
            photo &&
            !finalDormData.photoBase64 &&
            !finalDormData.profile?.photoBase64
          ) {
            finalDormData = {
              ...finalDormData,
              photoBase64: photo,
              profile: finalDormData.profile
                ? { ...finalDormData.profile, photoBase64: photo }
                : finalDormData.profile,
            };
          }
        }
      } catch (acErr) {
        console.warn("학적 추가 동기화 실패 (무시하고 계속)", acErr);
      }

      // 3. 로컬 보안 스토리지에 저장
      const nowIso = new Date().toISOString();
      const sanitizedDormData = {
        ...finalDormData,
        rawDatasets: {},
        rawFields: undefined,
      };
      await secureStorage.setItem(
        "portal_dormitory_student_info",
        sanitizedDormData,
      );
      localStorage.setItem("portal_dormitory_last_updated", nowIso);

      // 성공 콜백 호출
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "정보를 가져오는 중 오류가 발생했어요.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // 1) 이미 저장된 계정으로 바로 가져오기
  const handleSyncWithSavedAccount = async () => {
    const studentId = savedStudentId || resolveCurrentStudentId();
    if (!studentId) {
      setIsRelinkMode(true);
      return;
    }
    await executeSync(studentId);
  };

  // 2) 신규 또는 재입력 계정 등록 후 가져오기
  const handleSubmitNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim() || !passwordInput.trim()) {
      setErrorMessage("학번과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (!isMobileAppEnvironment()) {
      setErrorMessage("포털 연동은 유니돔 모바일 앱 환경에서만 지원돼요.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("기기 보안 영역(KeyStore)에 저장 중...");
    setErrorMessage("");

    try {
      const saveRes = await savePortalAccount(
        studentIdInput.trim(),
        passwordInput.trim(),
      );

      if (!saveRes.success) {
        throw new Error(saveRes.errorMessage || "계정 등록에 실패했어요.");
      }

      localStorage.setItem("portal_student_id", studentIdInput.trim());
      setSavedStudentId(studentIdInput.trim());
      setIsLinked(true);
      setIsRelinkMode(false);

      // 저장 성공 후 즉시 사생정보 동기화 실행
      await executeSync(studentIdInput.trim());
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "계정 저장 중 오류가 발생했어요.";
      setErrorMessage(msg);
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  if (isCheckingLinked) {
    return (
      <Container>
        <LoadingCenterBox>
          <Loader2 size={32} className="spin" color="#3182F6" />
          <LoadingText>연동 상태를 확인하고 있어요...</LoadingText>
        </LoadingCenterBox>
      </Container>
    );
  }

  // 모바일 앱 환경이 아닌 경우
  if (!isMobileAppEnvironment()) {
    return (
      <Container>
        <HeaderSection>
          <Title>유니돔 앱에서{"\n"}이용할 수 있어요</Title>
          <Subtitle>
            모바일 사생증 및 포털 연동은 기기 보안 저장소(KeyStore)를 이용하므로 유니돔 앱 환경에서만 안전하게 지원돼요.
          </Subtitle>
        </HeaderSection>

        <SecurityCard>
          <ShieldCheck size={22} color="#04B05C" />
          <SecurityTextGroup>
            <SecurityTitle>기기에서만 안전하게 처리돼요</SecurityTitle>
            <SecurityDesc>
              가져오는 작업은 이 기기에서만 수행되며 외부 서버로 전송되지 않아요.
            </SecurityDesc>
          </SecurityTextGroup>
        </SecurityCard>

        <PrimaryButton type="button" onClick={openIntipAppOrStore}>
          유니돔 앱으로 열기
        </PrimaryButton>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderSection>
        <Title>
          포털 사이트에서{"\n"}정보를 가져와야 해요
        </Title>
        <Subtitle>
          모바일 사생증 발급을 위해 인천대학교 포털에서 사생 정보를 안전하게 불러올게요.
        </Subtitle>
      </HeaderSection>

      {/* 기기 로컬 처리 및 외부 전송 배제 안심 보안 안내 */}
      <SecurityCard>
        <ShieldCheck size={22} color="#3182F6" />
        <SecurityTextGroup>
          <SecurityTitle>가져오는 작업은 이 기기에서만 수행돼요</SecurityTitle>
          <SecurityDesc>
            포털 아이디와 비밀번호, 사생 정보는 외부 서버로 전송되지 않으며 이 기기의 보안 영역(KeyStore)에만 암호화 보관돼요.
          </SecurityDesc>
        </SecurityTextGroup>
      </SecurityCard>

      {/* 상태별 화면: 저장된 계정이 있는 경우 */}
      {isLinked && !isRelinkMode ? (
        <CardSection>
          <SavedAccountBox>
            <AccountInfoRow>
              <User size={18} color="#4E5968" />
              <AccountLabel>등록된 포털 학번</AccountLabel>
              <AccountStudentId>{savedStudentId || "학번 연동됨"}</AccountStudentId>
            </AccountInfoRow>
            <AccountSubHint>
              이미 기기에 안전하게 등록되어 있어 바로 정보를 가져올 수 있어요.
            </AccountSubHint>
          </SavedAccountBox>

          {errorMessage && (
            <ErrorBox role="alert">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </ErrorBox>
          )}

          <ActionGroup>
            <PrimaryButton
              type="button"
              onClick={handleSyncWithSavedAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin" style={{ marginRight: 8 }} />
                  {loadingMessage || "정보를 가져오는 중..."}
                </>
              ) : (
                "사생증 정보 가져오기"
              )}
            </PrimaryButton>

            {!isLoading && (
              <SecondaryTextButton
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  setIsRelinkMode(true);
                }}
              >
                다른 포털 계정으로 입력하기
              </SecondaryTextButton>
            )}
          </ActionGroup>
        </CardSection>
      ) : (
        /* 상태별 화면: 계정이 없거나 다른 계정 입력 모드인 경우 */
        <CardSection>
          <Form onSubmit={handleSubmitNewAccount}>
            <InputGroup>
              <InputLabel htmlFor="portal-student-id">포털 학번</InputLabel>
              <InputWrap>
                <User size={18} color="#8B95A1" />
                <StyledInput
                  id="portal-student-id"
                  type="text"
                  inputMode="numeric"
                  placeholder="예: 202600000"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  disabled={isLoading}
                />
              </InputWrap>
            </InputGroup>

            <InputGroup>
              <InputLabel htmlFor="portal-password">포털 비밀번호</InputLabel>
              <InputWrap>
                <Lock size={18} color="#8B95A1" />
                <StyledInput
                  id="portal-password"
                  type="password"
                  placeholder="포털 비밀번호 입력"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={isLoading}
                />
              </InputWrap>
            </InputGroup>

            {errorMessage && (
              <ErrorBox role="alert">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </ErrorBox>
            )}

            <ActionGroup>
              <PrimaryButton
                type="submit"
                disabled={
                  isLoading || !studentIdInput.trim() || !passwordInput.trim()
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spin" style={{ marginRight: 8 }} />
                    {loadingMessage || "정보를 가져오는 중..."}
                  </>
                ) : (
                  "정보 가져오기"
                )}
              </PrimaryButton>

              {isLinked && !isLoading && (
                <SecondaryTextButton
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    setIsRelinkMode(false);
                  }}
                >
                  기존에 등록된 계정 사용하기
                </SecondaryTextButton>
              )}
            </ActionGroup>
          </Form>
        </CardSection>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingCenterBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 280px;
`;

const LoadingText = styled.p`
  font-size: 15px;
  font-weight: 500;
  color: #4e5968;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  line-height: 1.35;
  color: #191f28;
  white-space: pre-line;
  letter-spacing: -0.4px;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 15px;
  line-height: 1.5;
  color: #4e5968;
  margin: 0;
`;

const SecurityCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  background: #f2f4f6;
  border-radius: 16px;
  box-sizing: border-box;
`;

const SecurityTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const SecurityTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #191f28;
`;

const SecurityDesc = styled.span`
  font-size: 13px;
  line-height: 1.45;
  color: #4e5968;
`;

const CardSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 4px;
`;

const SavedAccountBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  box-sizing: border-box;
`;

const AccountInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AccountLabel = styled.span`
  font-size: 14px;
  color: #4e5968;
`;

const AccountStudentId = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #191f28;
  margin-left: auto;
`;

const AccountSubHint = styled.p`
  font-size: 13px;
  color: #8b95a1;
  margin: 0;
  line-height: 1.4;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InputLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #4e5968;
`;

const InputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  height: 52px;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: #3182f6;
    box-shadow: 0 0 0 1px #3182f6;
  }
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #191f28;
  outline: none;

  &::placeholder {
    color: #b0b8c1;
  }

  &:disabled {
    color: #8b95a1;
  }
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fff0f0;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #f04452;
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  height: 54px;
  border-radius: 16px;
  background: #3182f6;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: background-color 0.15s ease, transform 0.15s ease;

  &:hover:not(:disabled) {
    background: #1b64da;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
    background: #1b64da;
  }

  &:disabled {
    background: #e5e8eb;
    color: #b0b8c1;
    cursor: not-allowed;
  }
`;

const SecondaryTextButton = styled.button`
  background: none;
  border: none;
  color: #4e5968;
  font-size: 14px;
  font-weight: 600;
  padding: 10px;
  cursor: pointer;
  text-align: center;
  transition: color 0.15s ease;

  &:hover {
    color: #191f28;
  }

  &:active {
    opacity: 0.7;
  }
`;
