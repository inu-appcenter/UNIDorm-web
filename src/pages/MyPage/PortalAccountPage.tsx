import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import {
  checkPortalAccountLinked,
  savePortalAccount,
  deletePortalAccount,
  fetchAcademicInfoFromApp,
  isPortalAgentAvailable,
} from "@/apis/mobileAgentBridge";
import { guardPortalAgent } from "@/utils/guard";
import { StudentInfo } from "@/types/portal";
import { secureStorage } from "@/utils/secureStorage";
import { adaptAcademicInfoToStudentInfo } from "@/apis/portalAdapter";
import { PATHS } from "@/constants/paths";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/unidormResponsive";
import CapsuleButton from "@/components/common/CapsuleButton";
import { mixpanelTrack } from "@/utils/mixpanel";
import Modal from "@/components/portal/PortalConfirmModal";
import Skeleton from "@/components/common/Skeleton";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  GraduationCap,
  FileText,
  RotateCcw,
  Trash2,
  ChevronRight,
  AlertCircle,
  Smartphone,
  Globe,
  RefreshCw,
} from "lucide-react";

export default function MobilePortalAccountPage() {
  const { t } = useTranslation(["mypage", "common"]);
  const navigate = useNavigate();
  const { userInfo } = useUserStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [studentInfo, setStudentInfo] = useState<Partial<StudentInfo> | null>(null);

  // 포털 실제 접속 테스트 상태
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [connectionError, setConnectionError] = useState<string>("");

  // 등록/재등록 폼 상태
  const [studentIdInput, setStudentIdInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRelinkMode, setIsRelinkMode] = useState<boolean>(false);

  // 모달 상태
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useSetHeader({
    title: t("mypage:portalAccount.title"),
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. 보안 스토리지에 캐시된 학적 정보 확인 (Fast-Path)
      const savedInfo = await secureStorage.getItem<StudentInfo>("portal_student_info");
      if (savedInfo) {
        setStudentInfo(savedInfo);
      }

      // 2. 로컬 포털 에이전트(모바일 앱 또는 PC 크롬 확장) 환경이면 계정 등록 여부 확인
      if (isPortalAgentAvailable()) {
        const res = await checkPortalAccountLinked().catch(() => ({ linked: false, studentId: undefined }));
        const isLinkedBool = Boolean(res?.linked);
        setIsLinked(isLinkedBool);

        const sid = res?.studentId || localStorage.getItem("portal_student_id");
        if (isLinkedBool && sid && !savedInfo?.studentId) {
          setStudentInfo((prev) => ({
            ...prev,
            studentId: sid,
            koreanName: prev?.koreanName || userInfo?.name || t("mypage:portalAccount.defaultStudentName"),
            departmentName: prev?.departmentName || "",
            enrollmentStatusName: prev?.enrollmentStatusName || "",
          }));
        }
      } else {
        setIsLinked(false);
      }
    } finally {
      // 포털 전체 스크래핑을 대기하지 않고 즉시 화면 표시
      setIsLoading(false);
    }
  }, [userInfo]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // 포털 실제 접속 여부 테스트 핸들러
  const handleTestConnection = async () => {
    if (!guardPortalAgent({ navigate })) return;

    setConnectionStatus("testing");
    setConnectionError("");

    try {
      const academicRes = await fetchAcademicInfoFromApp(true);
      if (academicRes.success && academicRes.data) {
        const student = adaptAcademicInfoToStudentInfo(academicRes.data);
        setStudentInfo(student);
        await secureStorage.setItem("portal_student_info", student);
        localStorage.setItem("portal_info_last_updated", new Date().toISOString());
        setConnectionStatus("success");
        showToast(t("mypage:portalAccount.testSuccess"));
      } else {
        setConnectionStatus("error");
        const errMsg = academicRes.errorMessage || t("mypage:portalAccount.testLoginFail");
        setConnectionError(errMsg);
        showToast(t("mypage:portalAccount.testFail", { message: errMsg }));
      }
    } catch (err: any) {
      setConnectionStatus("error");
      const errMsg = err?.message || t("mypage:portalAccount.networkError");
      setConnectionError(errMsg);
      showToast(errMsg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim() || !passwordInput.trim()) {
      setErrorMessage(t("mypage:portalAccount.missingCredentials"));
      return;
    }

    if (!guardPortalAgent({ navigate })) {
      setErrorMessage(t("mypage:portalAccount.appOnlyError"));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const saveRes = await savePortalAccount(studentIdInput.trim(), passwordInput.trim());
      if (saveRes.success) {
        localStorage.setItem("portal_student_id", studentIdInput.trim());
        setIsLinked(true);
        setIsRelinkMode(false);
        setStudentIdInput("");
        setPasswordInput("");
        showToast(t("mypage:portalAccount.saveSuccess"));

        // 등록 후 바로 연결 상태도 검증 진행
        handleTestConnection();
      } else {
        setErrorMessage(saveRes.errorMessage || t("mypage:portalAccount.saveFail"));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t("mypage:portalAccount.genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinkModalOpen(false);
    try {
      if (isPortalAgentAvailable()) {
        await deletePortalAccount().catch(() => {});
      }
      secureStorage.clearAllPortalCaches();
      setStudentInfo(null);
      setIsLinked(false);
      setIsRelinkMode(false);
      showToast(t("mypage:portalAccount.unlinkSuccess"));
    } catch (e: any) {
      alert(e?.message || t("mypage:portalAccount.unlinkError"));
    }
  };

  return (
    <PageWrapper as="main">
      {toastMessage && (
        <ToastBanner role="status">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </ToastBanner>
      )}

      {isLoading ? (
        <ContentContainer>
          <Skeleton width="100%" height="160px" style={{ borderRadius: "16px" }} />
          <Skeleton width="100%" height="220px" style={{ borderRadius: "16px" }} />
        </ContentContainer>
      ) : !isPortalAgentAvailable() ? (
        /* 0. 모바일 앱 환경 아닐 때 안내 화면 */
        <ContentContainer>
          <NotAppCard>
            <Smartphone size={36} color="var(--interactive-primary)" />
            <NotAppTitle>{t("mypage:portalAccount.notAppTitle")}</NotAppTitle>
            <NotAppDesc>
              {t("mypage:portalAccount.notAppDesc")}
            </NotAppDesc>

            <UsageGuideBox>
              <UsageGuideTitle>{t("mypage:portalAccount.usageGuideTitle")}</UsageGuideTitle>
              <UsageGuideList>
                <li>{t("mypage:portalAccount.feature1")}</li>
                <li>{t("mypage:portalAccount.feature2")}</li>
                <li>{t("mypage:portalAccount.feature3")}</li>
              </UsageGuideList>
            </UsageGuideBox>

            <CapsuleButton
              variant="brand"
              onClick={() => guardPortalAgent({ navigate })}
              style={{ width: "100%", marginTop: "8px" }}
            >
              {t("mypage:portalAccount.openInstallApp")}
            </CapsuleButton>

            <FootnoteText>{t("mypage:portalAccount.appFootnote")}</FootnoteText>
          </NotAppCard>
        </ContentContainer>
      ) : isLinked && !isRelinkMode ? (
        /* 1. 연동 완료 상태 화면 */
        <ContentContainer>
          <StatusCard as="section">
            <StatusHeader>
              <StatusBadge>
                <CheckCircle2 size={15} />
                <span>{t("mypage:portalAccount.linkedBadge")}</span>
              </StatusBadge>
              <SecurityTag>
                <ShieldCheck size={14} />
                <span>{t("mypage:portalAccount.keystoreLabel")}</span>
              </SecurityTag>
            </StatusHeader>

            <AccountInfoSection>
              <StudentTitle>
                {t("mypage:portalAccount.linkedTitle", {
                  name: studentInfo?.koreanName || userInfo.name || t("mypage:portalAccount.defaultStudentName"),
                })}
              </StudentTitle>
              <StudentDetailGrid>
                <DetailItem>
                  <span className="label">{t("mypage:portalAccount.studentIdLabel")}</span>
                  <span className="value">{studentInfo?.studentId || t("mypage:portalAccount.registeredFallback")}</span>
                </DetailItem>
                {studentInfo?.departmentName && (
                  <DetailItem>
                    <span className="label">{t("mypage:portalAccount.departmentLabel")}</span>
                    <span className="value">{studentInfo.departmentName}</span>
                  </DetailItem>
                )}
                {studentInfo?.enrollmentStatusName && (
                  <DetailItem>
                    <span className="label">{t("mypage:portalAccount.enrollmentStatusLabel")}</span>
                    <span className="value">{studentInfo.enrollmentStatusName}</span>
                  </DetailItem>
                )}
              </StudentDetailGrid>
            </AccountInfoSection>

            {/* 포털 실제 연결 상태 확인 섹션 */}
            <ConnectionBox $status={connectionStatus}>
              <ConnectionHeader>
                <ConnectionTitleRow>
                  <Globe size={15} color="var(--interactive-primary)" />
                  <span className="title">{t("mypage:portalAccount.connectionTitle")}</span>
                </ConnectionTitleRow>
                <ConnectionStatusBadge $status={connectionStatus}>
                  {connectionStatus === "idle" && <span>{t("mypage:portalAccount.statusIdle")}</span>}
                  {connectionStatus === "testing" && <span>{t("mypage:portalAccount.statusTesting")}</span>}
                  {connectionStatus === "success" && <span>{t("mypage:portalAccount.statusSuccess")}</span>}
                  {connectionStatus === "error" && <span>{t("mypage:portalAccount.statusError")}</span>}
                </ConnectionStatusBadge>
              </ConnectionHeader>

              <ConnectionDesc>
                {connectionStatus === "idle" && t("mypage:portalAccount.idleDesc")}
                {connectionStatus === "testing" && t("mypage:portalAccount.testingMessage")}
                {connectionStatus === "success" && t("mypage:portalAccount.testOkMessage")}
                {connectionStatus === "error" &&
                  (connectionError || t("mypage:portalAccount.testLoginFail"))}
              </ConnectionDesc>

              <ConnectionBtnWrapper>
                <CapsuleButton
                  variant={connectionStatus === "success" ? "secondary" : "brand"}
                  onClick={handleTestConnection}
                  disabled={connectionStatus === "testing"}
                  loading={connectionStatus === "testing"}
                  fullWidth
                >
                  <RefreshCw size={13} className={connectionStatus === "testing" ? "spin" : ""} style={{ marginRight: 6 }} />
                  {connectionStatus === "testing" ? t("mypage:portalAccount.testButtonLoading") : t("mypage:portalAccount.testButton")}
                </CapsuleButton>
              </ConnectionBtnWrapper>
            </ConnectionBox>

            <ActionButtonsRow>
              <SubActionBtn onClick={() => setIsRelinkMode(true)}>
                <RotateCcw size={14} />
                <span>{t("mypage:portalAccount.relink")}</span>
              </SubActionBtn>
              <DangerActionBtn onClick={() => setIsUnlinkModalOpen(true)}>
                <Trash2 size={14} />
                <span>{t("mypage:portalAccount.unlink")}</span>
              </DangerActionBtn>
            </ActionButtonsRow>
          </StatusCard>

          {/* 원클릭 연동 서비스 안내 */}
          <SectionHeaderRow>
            <SectionTitle>{t("mypage:portalAccount.autoSyncTitle")}</SectionTitle>
          </SectionHeaderRow>
          <ServiceListCard as="section">
            <ServiceItem onClick={() => navigate(PATHS.DORMITORY_INFO)} role="button" tabIndex={0}>
              <ServiceLeft>
                <ServiceIcon $color="var(--interactive-primary)" $bg="var(--blue-50)">
                  <FileText size={18} color="var(--interactive-primary)" />
                </ServiceIcon>
                <ServiceText>
                  <strong>{t("mypage:portalAccount.dormInfoTitle")}</strong>
                  <span>{t("mypage:portalAccount.dormInfoDesc")}</span>
                </ServiceText>
              </ServiceLeft>
              <ChevronRight size={18} color="var(--text-disabled)" />
            </ServiceItem>

            <ServiceDivider />

            <ServiceItem
              onClick={() => {
                mixpanelTrack.dormitoryCardEntryClicked("마이페이지");
                navigate(PATHS.DORMITORY_CARD);
              }}
              role="button"
              tabIndex={0}
            >
              <ServiceLeft>
                <ServiceIcon $color="var(--green-500)" $bg="var(--bg-subtle)">
                  <GraduationCap size={18} color="var(--green-500)" />
                </ServiceIcon>
                <ServiceText>
                  <strong>{t("mypage:portalAccount.dormCardTitle")}</strong>
                  <span>{t("mypage:portalAccount.dormCardDesc")}</span>
                </ServiceText>
              </ServiceLeft>
              <ChevronRight size={18} color="var(--text-disabled)" />
            </ServiceItem>
          </ServiceListCard>

          <FootnoteText>{t("mypage:portalAccount.securityFootnote")}</FootnoteText>
        </ContentContainer>
      ) : (
        /* 2. 미연동 또는 재등록 폼 화면 */
        <ContentContainer>
          <HeroCard as="section">
            <HeroTitle>
              {isRelinkMode ? t("mypage:portalAccount.relinkTitle") : t("mypage:portalAccount.linkTitle")}
            </HeroTitle>
            <HeroSubtitle>
              {t("mypage:portalAccount.linkDesc")}
            </HeroSubtitle>

            <UsageGuideBox>
              <UsageGuideTitle>{t("mypage:portalAccount.usageGuideTitle")}</UsageGuideTitle>
              <UsageGuideList>
                <li>{t("mypage:portalAccount.feature1")}</li>
                <li>{t("mypage:portalAccount.feature2Alt")}</li>
                <li>{t("mypage:portalAccount.feature3")}</li>
              </UsageGuideList>
            </UsageGuideBox>
          </HeroCard>

          {/* 토스 스타일 안심 안내 배너 */}
          <SecurityNoticeCard>
            <SecurityNoticeIcon>
              <ShieldCheck size={20} color="var(--interactive-primary)" />
            </SecurityNoticeIcon>
            <SecurityNoticeContent>
              <strong>{t("mypage:portalAccount.noServerTitle")}</strong>
              <p>
                {t("mypage:portalAccount.noServerDesc")}
              </p>
            </SecurityNoticeContent>
          </SecurityNoticeCard>

          <FormCard onSubmit={handleRegister}>
            <InputGroup>
              <InputLabel htmlFor="portal-student-id">{t("mypage:portalAccount.inputStudentId")}</InputLabel>
              <InputWrap>
                <User size={18} color="var(--text-tertiary)" />
                <StyledInput
                  id="portal-student-id"
                  type="text"
                  inputMode="numeric"
                  placeholder={t("mypage:portalAccount.inputStudentIdPlaceholder")}
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  disabled={isSubmitting}
                />
              </InputWrap>
            </InputGroup>

            <InputGroup>
              <InputLabel htmlFor="portal-password">{t("mypage:portalAccount.inputPassword")}</InputLabel>
              <InputWrap>
                <Lock size={18} color="var(--text-tertiary)" />
                <StyledInput
                  id="portal-password"
                  type="password"
                  placeholder={t("mypage:portalAccount.inputPasswordPlaceholder")}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={isSubmitting}
                />
              </InputWrap>
            </InputGroup>

            {errorMessage && (
              <ErrorBox role="alert">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </ErrorBox>
            )}

            <ButtonGroupWrapper>
              <CapsuleButton
                type="submit"
                variant="brand"
                fullWidth
                loading={isSubmitting}
                disabled={!studentIdInput.trim() || !passwordInput.trim()}
              >
                {isSubmitting ? t("mypage:portalAccount.submitting") : t("mypage:portalAccount.submitButton")}
              </CapsuleButton>

              {isRelinkMode && (
                <CancelTextBtn type="button" onClick={() => setIsRelinkMode(false)}>
                  {t("mypage:portalAccount.cancelRelink")}
                </CancelTextBtn>
              )}
            </ButtonGroupWrapper>
          </FormCard>

          <FootnoteText>{t("mypage:portalAccount.securityFootnote")}</FootnoteText>
        </ContentContainer>
      )}

      {/* 등록 해제 확인 모달 */}
      <Modal
        isOpen={isUnlinkModalOpen}
        onClose={() => setIsUnlinkModalOpen(false)}
        title={t("mypage:portalAccount.unlinkModalTitle")}
        description={t("mypage:portalAccount.unlinkModalDesc")}
        primaryButton={{
          text: t("mypage:portalAccount.unlink"),
          variant: "danger",
          onClick: handleUnlink,
        }}
        secondaryButton={{
          text: t("common:actions.cancel"),
          onClick: () => setIsUnlinkModalOpen(false),
        }}
      />
    </PageWrapper>
  );
}

// ================= STYLES =================

const PageWrapper = styled.main`
  width: 100%;
  min-height: 100svh;
  box-sizing: border-box;
  padding: 16px ${MOBILE_PAGE_GUTTER} calc(32px + var(--safe-area-bottom, 0px));

  @media ${DESKTOP_MEDIA} {
    max-width: 640px;
    margin: 0 auto;
    padding: 24px 20px calc(32px + var(--safe-area-bottom, 0px));
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const ToastBanner = styled.div`
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gray-900);
  color: var(--text-inverse);
  padding: 10px 18px;
  border-radius: var(--radius-full);
  font-size: 13.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 10000;
`;

const StatusCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--blue-50);
  color: var(--text-brand);
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 700;
`;

const SecurityTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 500;
`;

const AccountInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0 2px;
`;

const StudentTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
`;

const StudentDetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  padding: 12px 14px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .label {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--text-tertiary);
  }
  .value {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const ConnectionBox = styled.div<{ $status: "idle" | "testing" | "success" | "error" }>`
  background: ${({ $status }) =>
    $status === "success"
      ? "var(--blue-50)"
      : $status === "error"
      ? "var(--bg-error)"
      : "var(--bg-subtle)"};
  border: 1px solid
    ${({ $status }) =>
      $status === "success"
        ? "var(--border-brand-subtle)"
        : $status === "error"
        ? "var(--border-error-subtle)"
        : "var(--border-default)"};
  border-radius: var(--radius-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease-in-out;
`;

const ConnectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ConnectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  .title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const ConnectionStatusBadge = styled.div<{ $status: "idle" | "testing" | "success" | "error" }>`
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: ${({ $status }) =>
    $status === "success"
      ? "var(--blue-600)"
      : $status === "error"
      ? "var(--text-error)"
      : $status === "testing"
      ? "var(--interactive-primary)"
      : "var(--border-default)"};
  color: ${({ $status }) => ($status === "idle" ? "var(--text-secondary)" : "var(--text-inverse)")};
`;

const ConnectionDesc = styled.p`
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text-secondary);
`;

const ConnectionBtnWrapper = styled.div`
  margin-top: 2px;
`;

const ActionButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 2px;
`;

const SubActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 10px 0;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: var(--border-default);
  }
`;

const DangerActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg-error);
  color: var(--text-error);
  border: 1px solid var(--border-error-subtle);
  border-radius: var(--radius-md);
  padding: 10px 0;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    opacity: 0.8;
  }
`;

const SectionHeaderRow = styled.div`
  padding: 4px 4px 0;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--text-secondary);
`;

const ServiceListCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 6px 16px;
  display: flex;
  flex-direction: column;
`;

const ServiceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.7;
  }
`;

const ServiceLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ServiceIcon = styled.div<{ $color: string; $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ServiceText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }
  span {
    font-size: 12px;
    color: var(--text-tertiary);
  }
`;

const ServiceDivider = styled.div`
  height: 1px;
  background: var(--border-default);
  width: 100%;
`;

const FootnoteText = styled.p`
  margin: 12px 4px 0;
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.4;
`;

const NotAppCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 32px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
`;

const NotAppTitle = styled.h3`
  margin: 4px 0 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
`;

const NotAppDesc = styled.p`
  margin: 0 0 8px;
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 320px;
`;

const HeroCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeroTitle = styled.h2`
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
`;

const HeroSubtitle = styled.p`
  margin: 0;
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const UsageGuideBox = styled.div`
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
`;

const UsageGuideTitle = styled.div`
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary);
`;

const UsageGuideList = styled.ul`
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  li {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
  }
`;

const FormCard = styled.form`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InputLabel = styled.label`
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const InputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  padding: 0 14px;
  height: 48px;
  border: 1px solid var(--border-default);

  &:focus-within {
    border-color: var(--blue-600);
    background: var(--bg-base);
  }
`;

const StyledInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;

  &::placeholder {
    color: var(--text-disabled);
  }
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-error);
  background: var(--bg-error);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
`;

const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
`;

const CancelTextBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 0;

  &:hover {
    color: var(--text-secondary);
  }
`;

const SecurityNoticeCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--blue-50);
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 14px;
`;

const SecurityNoticeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(49, 130, 246, 0.12);
  flex-shrink: 0;
  margin-top: 1px;
`;

const SecurityNoticeContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 14px;
    font-weight: 700;
    color: var(--interactive-primary);
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: var(--text-secondary);
  }
`;

