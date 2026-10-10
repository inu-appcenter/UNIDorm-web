import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import {
  checkPortalAccountLinked,
  savePortalAccount,
  deletePortalAccount,
  fetchAcademicInfoFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { StudentInfo } from "@/types/portal";
import { secureStorage } from "@/utils/secureStorage";
import { adaptAcademicInfoToStudentInfo } from "@/apis/portalAdapter";
import { PATHS } from "@/constants/paths";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/intipResponsive";
import CapsuleButton from "@/components/common/CapsuleButton";
import Modal from "@/components/portal/PortalConfirmModal";
import Skeleton from "@/components/common/Skeleton";
import { openIntipAppOrStore } from "@/utils/portalAppLauncher";
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
    title: "포털 계정 관리",
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

      // 2. 모바일 앱 환경이면 기기 KeyStore에 계정 등록 여부만 빠르게 확인
      if (isMobileAppEnvironment()) {
        const res = await checkPortalAccountLinked().catch(() => ({ linked: false, studentId: undefined }));
        const isLinkedBool = Boolean(res?.linked);
        setIsLinked(isLinkedBool);

        // 학번이 반환되었고 아직 학번이 없다면 최소 정보 즉시 반영
        const sid = res?.studentId || localStorage.getItem('portal_student_id');
        if (isLinkedBool && sid && !savedInfo?.studentId) {
          setStudentInfo((prev) => ({
            ...prev,
            studentId: sid,
            koreanName: prev?.koreanName || userInfo?.name || "학우",
            departmentName: prev?.departmentName || "",
            enrollmentStatusName: prev?.enrollmentStatusName || "",
          }));
        }
      } else {
        setIsLinked(false);
      }
    } finally {
      // 포털 전체 스크래핑을 동기 대기하지 않고 즉시 화면 표시 (초고속 진입)
      setIsLoading(false);
    }
  }, [userInfo]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // 포털 실제 접속 여부 테스트 핸들러
  const handleTestConnection = async () => {
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
        showToast("포털 접속 성공: 최신 학적 정보가 확인되었어요.");
      } else {
        setConnectionStatus("error");
        const errMsg = academicRes.errorMessage || "포털 로그인에 실패했어요. 비밀번호를 확인해주세요.";
        setConnectionError(errMsg);
        showToast(`포털 접속 실패: ${errMsg}`);
      }
    } catch (err: any) {
      setConnectionStatus("error");
      const errMsg = err?.message || "네트워크 오류로 포털에 접속하지 못했습니다.";
      setConnectionError(errMsg);
      showToast(errMsg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim() || !passwordInput.trim()) {
      setErrorMessage("학번과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (!isMobileAppEnvironment()) {
      setErrorMessage("포털 계정 연동은 INTIP 모바일 앱 환경에서만 지원돼요.");
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
        showToast("포털 계정이 기기 보안 저장소에 등록되었어요.");

        // 등록 후 바로 연결 상태도 검증 진행
        handleTestConnection();
      } else {
        setErrorMessage(saveRes.errorMessage || "계정 등록에 실패했어요.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "오류가 발생했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinkModalOpen(false);
    try {
      if (isMobileAppEnvironment()) {
        await deletePortalAccount().catch(() => {});
      }
      secureStorage.removeItem("portal_student_info");
      localStorage.removeItem("portal_info_last_updated");
      setStudentInfo(null);
      setIsLinked(false);
      setIsRelinkMode(false);
      showToast("포털 계정 연동이 해제되었어요.");
    } catch (e: any) {
      alert(e?.message || "연동 해제 중 오류가 발생했어요.");
    }
  };

  return (
    <PageWrapper>
      {toastMessage && (
        <ToastBanner>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </ToastBanner>
      )}

      {isLoading ? (
        <ContentContainer>
          <Skeleton width="100%" height="160px" style={{ borderRadius: "20px" }} />
          <Skeleton width="100%" height="220px" style={{ borderRadius: "20px" }} />
        </ContentContainer>
      ) : !isMobileAppEnvironment() ? (
        /* ================= 0. 모바일 앱 환경 아닐 때 안내 화면 ================= */
        <ContentContainer>
          <NotAppCard>
            <Smartphone size={36} color="var(--interactive-primary)" />
            <NotAppTitle>INTIP 모바일 앱 전용 기능이에요</NotAppTitle>
            <NotAppDesc>
              포털 계정 연동은 기기 보안 저장소(KeyStore)를 이용하므로 INTIP 모바일 앱 환경에서만 등록하고 이용할 수 있어요.
            </NotAppDesc>

            <UsageGuideBox style={{ width: "100%", boxSizing: "border-box", textAlign: "left" }}>
              <UsageGuideTitle>연동 시 이용 가능한 기능</UsageGuideTitle>
              <UsageGuideList>
                <li>기숙사 사생정보 및 배정 호실, 외박, 상벌점 내역을 조회해요</li>
                <li>모바일 사생증 바코드 및 증명사진을 확인해요</li>
                <li>기본 학적 정보 (취득 학점, 성적, 학적 상태)를 연동해요</li>
              </UsageGuideList>
            </UsageGuideBox>

            <CapsuleButton
              variant="brand"
              style={{ marginTop: "16px", padding: "10px 20px", fontSize: "14px" }}
              onClick={() => openIntipAppOrStore("mypage/portal")}
            >
              앱 열기 및 설치
            </CapsuleButton>

            <FootnoteText style={{ marginTop: "16px" }}>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
          </NotAppCard>
        </ContentContainer>
      ) : isLinked && !isRelinkMode ? (
        /* ================= 1. 연동 완료 상태 화면 ================= */
        <ContentContainer>
          <StatusCard>
            <StatusHeader>
              <StatusBadge>
                <CheckCircle2 size={16} />
                <span>계정 등록됨</span>
              </StatusBadge>
              <SecurityTag>
                <ShieldCheck size={14} />
                <span>기기 보안 저장소 (KeyStore)</span>
              </SecurityTag>
            </StatusHeader>

            <AccountInfoSection>
              <StudentTitle>
                {studentInfo?.koreanName || userInfo.name || "학우"}님의 포털 계정
              </StudentTitle>
              <StudentDetailRow>
                <DetailItem>
                  <span className="label">학번</span>
                  <span className="value">{studentInfo?.studentId || "등록됨"}</span>
                </DetailItem>
                {studentInfo?.departmentName && (
                  <DetailItem>
                    <span className="label">소속</span>
                    <span className="value">{studentInfo.departmentName}</span>
                  </DetailItem>
                )}
                {studentInfo?.enrollmentStatusName && (
                  <DetailItem>
                    <span className="label">학적 상태</span>
                    <span className="value">{studentInfo.enrollmentStatusName}</span>
                  </DetailItem>
                )}
              </StudentDetailRow>
            </AccountInfoSection>

            {/* 포털 실제 연결 상태 확인 섹션 */}
            <ConnectionBox $status={connectionStatus}>
              <ConnectionHeader>
                <ConnectionTitleRow>
                  <Globe size={16} color="var(--interactive-primary)" />
                  <span className="title">포털 실제 연결 확인</span>
                </ConnectionTitleRow>
                <ConnectionStatusBadge $status={connectionStatus}>
                  {connectionStatus === "idle" && <span>연결 미확인</span>}
                  {connectionStatus === "testing" && <span>접속 테스트 중...</span>}
                  {connectionStatus === "success" && <span>✓ 포털 정상 연결</span>}
                  {connectionStatus === "error" && <span>✕ 접속 실패</span>}
                </ConnectionStatusBadge>
              </ConnectionHeader>

              <ConnectionDesc>
                {connectionStatus === "idle" &&
                  "아이디와 비밀번호가 이 기기에 안전하게 등록되어 있어요. 아래 버튼을 눌러 포털에 실제로 접속되는지 테스트할 수 있어요."}
                {connectionStatus === "testing" &&
                  "포털에 접속하여 로그인 및 최신 학적 정보를 확인하고 있어요. 잠시만 기다려주세요..."}
                {connectionStatus === "success" &&
                  "포털 시스템 로그인 및 학적 정보 연동이 정상 확인되었어요."}
                {connectionStatus === "error" &&
                  (connectionError || "포털 접속에 실패했습니다. 비밀번호를 다시 확인해주세요.")}
              </ConnectionDesc>

              <ConnectionBtnWrapper>
                <CapsuleButton
                  variant={connectionStatus === "success" ? "secondary" : "brand"}
                  onClick={handleTestConnection}
                  disabled={connectionStatus === "testing"}
                  loading={connectionStatus === "testing"}
                  style={{ width: "100%", padding: "10px 16px", fontSize: "14px" }}
                >
                  <RefreshCw size={14} className={connectionStatus === "testing" ? "spin" : ""} style={{ marginRight: 6 }} />
                  {connectionStatus === "testing" ? "포털 접속 확인 중..." : "포털 실제 접속 확인"}
                </CapsuleButton>
              </ConnectionBtnWrapper>
            </ConnectionBox>

            <ActionButtonsRow>
              <SubActionBtn onClick={() => setIsRelinkMode(true)}>
                <RotateCcw size={15} />
                <span>계정 재등록</span>
              </SubActionBtn>
              <DangerActionBtn onClick={() => setIsUnlinkModalOpen(true)}>
                <Trash2 size={15} />
                <span>등록 해제</span>
              </DangerActionBtn>
            </ActionButtonsRow>
          </StatusCard>

          {/* 원클릭 연동 서비스 안내 */}
          <SectionTitle>자동 연동 서비스</SectionTitle>
          <ServiceListCard>
            <ServiceItem onClick={() => navigate(PATHS.DORMITORY_INFO)}>
              <ServiceLeft>
                <ServiceIcon $color="var(--interactive-primary)" $bg="rgb(239, 246, 255)">
                  <FileText size={18} color="var(--interactive-primary)" />
                </ServiceIcon>
                <ServiceText>
                  <strong>사생정보조회 (학생)</strong>
                  <span>기숙사 배정 내역, 상벌점, 공공요금 및 외박 내역</span>
                </ServiceText>
              </ServiceLeft>
              <ChevronRight size={18} color="var(--button-inactive)" />
            </ServiceItem>

            <ServiceDivider />

            <ServiceItem onClick={() => navigate(PATHS.DORMITORY_CARD)}>
              <ServiceLeft>
                <ServiceIcon $color="var(--text-success)" $bg="rgb(240, 253, 244)">
                  <GraduationCap size={18} color="var(--text-success)" />
                </ServiceIcon>
                <ServiceText>
                  <strong>모바일 사생증</strong>
                  <span>실시간 모바일 사생증 및 바코드 출입 카드</span>
                </ServiceText>
              </ServiceLeft>
              <ChevronRight size={18} color="var(--button-inactive)" />
            </ServiceItem>
          </ServiceListCard>

          <FootnoteText>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
        </ContentContainer>
      ) : (
        /* ================= 2. 미연동 또는 재등록 폼 화면 ================= */
        <ContentContainer>
          <HeroCard>
            <HeroTitle>
              {isRelinkMode ? "포털 계정 다시 등록" : "포털 계정을 등록해 주세요"}
            </HeroTitle>
            <HeroSubtitle>
              인천대학교 포털 계정(학번/비밀번호)을 등록하면 학적·LMS·도서관 기능을 바로 이용할 수 있어요.
            </HeroSubtitle>

            <UsageGuideBox>
              <UsageGuideTitle>연동 시 이용 가능한 기능</UsageGuideTitle>
              <UsageGuideList>
                <li>기숙사 사생정보 및 배정 호실, 외박, 상벌점 내역을 조회해요</li>
                <li>모바일 사생증 바코드 및 증명사진을 확인해요</li>
                <li>기본 학적 정보 (취득 학점, 성적, 학적 상태)를 연동해요</li>
              </UsageGuideList>
            </UsageGuideBox>
          </HeroCard>

          <FormCard onSubmit={handleRegister}>
            <InputGroup>
              <InputLabel>포털 학번</InputLabel>
              <InputWrap>
                <User size={18} color="var(--gray-500)" />
                <StyledInput
                  type="text"
                  inputMode="numeric"
                  placeholder="예: 202600000"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  disabled={isSubmitting}
                />
              </InputWrap>
            </InputGroup>

            <InputGroup>
              <InputLabel>포털 비밀번호</InputLabel>
              <InputWrap>
                <Lock size={18} color="var(--gray-500)" />
                <StyledInput
                  type="password"
                  placeholder="포털 비밀번호 입력"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={isSubmitting}
                />
              </InputWrap>
            </InputGroup>

            {errorMessage && (
              <ErrorBox>
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
                {isSubmitting ? "기기 보안 영역에 저장 중..." : "포털 계정 연동하기"}
              </CapsuleButton>

              {isRelinkMode && (
                <CancelTextBtn type="button" onClick={() => setIsRelinkMode(false)}>
                  취소하고 돌아가기
                </CancelTextBtn>
              )}
            </ButtonGroupWrapper>
          </FormCard>

          <FootnoteText>이 폰에서 직접 작업이 수행되며, 계정 정보는 서버로 전송되지 않아요.</FootnoteText>
        </ContentContainer>
      )}

      {/* 등록 해제 확인 모달 */}
      <Modal
        isOpen={isUnlinkModalOpen}
        onClose={() => setIsUnlinkModalOpen(false)}
        title="포털 계정 연동을 해제할까요?"
        description="연동을 해제하면 이 폰에 저장된 로그인 정보와 학적 데이터가 삭제되고, 이러닝 및 도서관 자동 연동이 중단돼요."
        primaryButton={{
          text: "연동 해제",
          variant: "danger",
          onClick: handleUnlink,
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setIsUnlinkModalOpen(false),
        }}
      />
    </PageWrapper>
  );
}

// ================= STYLES =================

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100svh;
  box-sizing: border-box;
  background: var(--bg-subtle);
  padding: 16px ${MOBILE_PAGE_GUTTER}px 80px;

  @media ${DESKTOP_MEDIA} {
    max-width: 640px;
    margin: 0 auto;
    padding: 24px 0 80px;
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
  padding: 12px 20px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
`;

const StatusCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
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
  background: rgb(232, 248, 240);
  color: rgb(27, 99, 61);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
`;

const SecurityTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-tertiary);
  font-size: 11.5px;
  font-weight: 500;
`;

const AccountInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0 4px;
`;

const StudentTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
`;

const StudentDetailRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: var(--bg-muted);
  border-radius: 12px;
  padding: 12px 14px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
  }
  .value {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const ActionButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
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
  border-radius: 12px;
  padding: 10px 0;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: var(--border-default);
    transform: scale(0.98);
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
  border-radius: 12px;
  padding: 10px 0;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: var(--bg-error);
    transform: scale(0.98);
  }
`;

const ConnectionBox = styled.div<{ $status: "idle" | "testing" | "success" | "error" }>`
  background: ${({ $status }) =>
    $status === "success"
      ? "rgb(240, 253, 244)"
      : $status === "error"
      ? "rgb(254, 242, 242)"
      : "var(--bg-subtle)"};
  border: 1px solid
    ${({ $status }) =>
      $status === "success"
        ? "rgba(34, 197, 94, 0.3)"
        : $status === "error"
        ? "rgba(239, 68, 68, 0.3)"
        : "var(--border-default)"};
  border-radius: 16px;
  padding: 16px;
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
    font-size: 14.5px;
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const ConnectionStatusBadge = styled.div<{ $status: "idle" | "testing" | "success" | "error" }>`
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === "success"
      ? "var(--green-500, #22c55e)"
      : $status === "error"
      ? "var(--red-500, #ef4444)"
      : $status === "testing"
      ? "var(--blue-500, #3b82f6)"
      : "var(--gray-200)"};
  color: ${({ $status }) => ($status === "idle" ? "var(--text-secondary)" : "#ffffff")};
`;

const ConnectionDesc = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-tertiary);
`;

const ConnectionBtnWrapper = styled.div`
  margin-top: 4px;
`;

const SectionTitle = styled.h4`
  margin: 8px 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
`;

const ServiceListCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
`;

const ServiceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
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
  width: 38px;
  height: 38px;
  border-radius: 12px;
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
  margin: 14px 4px 0;
  font-size: 12.5px;
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.4;
`;

const NotAppCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 20px;
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
  border-radius: 20px;
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeroTitle = styled.h2`
  margin: 0;
  font-size: 20px;
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
  border-radius: 14px;
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
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
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
  border-radius: 12px;
  padding: 0 14px;
  height: 48px;
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
  border-radius: 8px;
`;

const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
`;

const CancelTextBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;

  &:hover {
    color: var(--text-secondary);
  }
`;
