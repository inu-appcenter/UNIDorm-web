import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useSetHeader } from "@/hooks/useSetHeader";
import { mixpanelTrack } from "@/utils/mixpanel";
import {
  DormitoryStudentInfo,
  DormitoryInOutItem,
  parseDormitoryStudentInfo,
} from "@/utils/ssvParser";
import { secureStorage } from "@/utils/secureStorage";
import { MobileDormitoryCard } from "@/components/portal/MobileDormitoryCard";
import { MOBILE_PAGE_GUTTER } from "@/styles/unidormResponsive";
import { PATHS } from "@/constants/paths";
import { ChevronRight, Building2, RotateCw } from "lucide-react";
import PortalSyncOnboarding from "@/components/portal/PortalSyncOnboarding";
import {
  setScreenCapturePrevented,
  isMobileAppEnvironment,
  checkPortalAccountLinked,
  fetchDormitoryStudentInfoFromApp,
  resolveCurrentStudentId,
} from "@/apis/mobileAgentBridge";
import CapsuleButton from "@/components/common/CapsuleButton";
import { guardAppOnly } from "@/utils/guard";
import { isLatestUnidormApp } from "@/utils/getMobilePlatform";

const STORAGE_KEY_DORMITORY_DATA = "portal_dormitory_student_info";

const MOCK_PREVIEW_DORM_INFO: DormitoryStudentInfo = {
  hasData: true,
  studentName: "김유니",
  studentId: "202301234",
  department: "컴퓨터공학부",
  departmentName: "컴퓨터공학부",
  dormitoryType: "02",
  dormitoryBuilding: "제2기숙사 B동",
  studentDormNo: "24-2-0402-A",
  roomNumber: "402",
  bedNumber: "A",
  status: "01",
  profile: {
    studentId: "202301234",
    name: "김유니",
    englishName: "KIM UNIDORM",
    gender: "남",
    nationality: "대한민국",
    department: "컴퓨터공학부",
    grade: "3학년",
    dormitoryType: "02",
    dormitoryBuilding: "제2기숙사 B동",
    studentDormNo: "24-2-0402-A",
    phoneNumber: "010-1234-5678",
    email: "unidorm@inu.ac.kr",
    zipCode: "22012",
    address: "인천광역시 연수구 아카데미로 119",
    detailedAddress: "기숙사",
    meritPoints: "3",
    demeritPoints: "0",
    nonOffsetDemeritPoints: "0",
    year: String(new Date().getFullYear()),
    term: "1학기",
    rawFields: {},
  },
  addressList: [],
  rewardList: [],
  inOutList: [
    {
      year: String(new Date().getFullYear()),
      term: "10",
      status: "01",
      dormitoryType: "02",
      studentDormNo: "24-2-0402-A",
      checkInDate: `${new Date().getFullYear()}-03-01`,
      checkOutDate: "",
      rawFields: {},
    },
  ],
  applyList: [],
  paymentList: [],
  utilityList: [],
  pledge: null,
  rawDatasets: {},
};

function toImageSrc(base64?: string): string | null {
  if (!base64 || typeof base64 !== "string") return null;
  const clean = base64.replace(/\s/g, "");
  if (!clean) return null;
  if (clean.startsWith("data:")) return clean;
  if (clean.startsWith("Qk")) return `data:image/bmp;base64,${clean}`;
  if (clean.startsWith("/9j/")) return `data:image/jpeg;base64,${clean}`;
  if (clean.startsWith("iVBOR")) return `data:image/png;base64,${clean}`;
  return `data:image/bmp;base64,${clean}`;
}

function mapDormitoryType(code?: string): string {
  if (!code) return "";
  const trimmed = code.trim();
  switch (trimmed) {
    case "01":
      return "제1기숙사";
    case "02":
      return "제2기숙사";
    case "03":
      return "제2기숙사(BTL)";
    case "04":
      return "제3기숙사";
    case "05":
      return "제3기숙사(BTL)";
    default:
      return trimmed;
  }
}

function mapGrade(val?: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (trimmed.endsWith("학년")) return trimmed;
  if (/^\d+$/.test(trimmed)) return `${trimmed}학년`;
  return trimmed;
}

function mapInOutStatus(code?: string): string {
  if (!code) return "";
  const trimmed = code.trim();
  switch (trimmed) {
    case "01":
      return "정규입사";
    case "02":
      return "정규퇴사";
    case "03":
      return "중도퇴사";
    default:
      return trimmed;
  }
}

function formatSemesterTerm(term?: string): string {
  if (!term) return "";
  const trimmed = term.trim();
  if (trimmed === "10" || trimmed === "1") return "1학기";
  if (trimmed === "20" || trimmed === "2") return "2학기";
  if (trimmed === "30" || trimmed === "3") return "여름학기";
  if (trimmed === "40" || trimmed === "4") return "겨울학기";
  return trimmed.endsWith("학기") ? trimmed : `${trimmed}학기`;
}

export function normalizeSemesterTerm(term?: string): string {
  if (!term) return "";
  const trimmed = term.trim();
  if (trimmed === "10" || trimmed === "1" || trimmed.includes("1학기")) return "10";
  if (trimmed === "20" || trimmed === "2" || trimmed.includes("2학기")) return "20";
  if (trimmed === "30" || trimmed === "3" || trimmed.includes("여름")) return "30";
  if (trimmed === "40" || trimmed === "4" || trimmed.includes("겨울")) return "40";
  return trimmed.replace(/학기/g, "");
}
export interface ResidentEvaluationResult {
  isCurrentlyResident: boolean;
  isAdmittedStatus: boolean;
  hasValidDormAssignment: boolean;
  isPastRecord: boolean;
  isExplicitlyTerminated: boolean;
  year: string;
  term: string;
  status: string;
  rawStatus: string;
  resolvedDormType: string;
  resolvedDormBuilding: string;
  studentDormNo: string;
  roomNumber: string;
  bedNumber: string;
  lastHistory: DormitoryInOutItem | null;
}

export function evaluateDormitoryResidentStatus(
  dormInfo: DormitoryStudentInfo | null,
  overrideCurrentYear?: number
): ResidentEvaluationResult {
  const profile = dormInfo?.profile;
  const rawFields = dormInfo?.rawFields;

  const inOutList = Array.isArray(dormInfo?.inOutList) ? dormInfo.inOutList : [];

  const year = profile?.year || dormInfo?.appliedYear || rawFields?.yy || inOutList[0]?.year || "";
  const term = profile?.term || dormInfo?.appliedSemester || rawFields?.tmGbn || inOutList[0]?.term || "";

  // 학기 정규화 (20 vs 2학기, 10 vs 1학기 등)
  const normalizedYear = (year || "").trim();
  const normalizedCurrentTerm = normalizeSemesterTerm(term);

  // 기본 사생정보의 당해 학기(year, term)와 정확히 일치하는 입퇴사 레코드 탐색
  const currentSemesterInOut = inOutList.find(
    (io) =>
      io.year &&
      normalizedYear &&
      io.year.trim() === normalizedYear &&
      io.term &&
      normalizedCurrentTerm &&
      normalizeSemesterTerm(io.term) === normalizedCurrentTerm
  );

  const rawStatus =
    currentSemesterInOut?.status ||
    dormInfo?.status ||
    profile?.rawFields?.dormLeavdormGbn ||
    rawFields?.dormLeavdormGbn ||
    "";
  const status = rawStatus ? mapInOutStatus(rawStatus) : "-";

  const rawDormGbn =
    profile?.dormitoryType ||
    dormInfo?.dormitoryType ||
    currentSemesterInOut?.dormitoryType ||
    rawFields?.dormGbn ||
    inOutList[0]?.dormitoryType ||
    "";
  const mappedDormName = mapDormitoryType(rawDormGbn);
  const rawDormBd =
    profile?.dormitoryBuilding ||
    dormInfo?.dormitoryBuilding ||
    rawFields?.dormBdNm ||
    rawFields?.dormBdCd ||
    rawFields?.dmtyNm ||
    rawFields?.domNm ||
    "";

  const resolvedDormType =
    mappedDormName ||
    (rawDormBd.includes("A동") || rawDormBd.includes("B동") ? "제2기숙사" : "") ||
    (rawDormBd.includes("1기숙사") || rawDormBd.includes("본관") ? "제1기숙사" : "") ||
    (rawDormBd.includes("2기숙사") ? "제2기숙사" : "") ||
    (rawDormBd.includes("3기숙사") ? "제3기숙사" : "") ||
    (rawDormBd ? rawDormBd : "") ||
    "-";
  const resolvedDormBuilding = rawDormBd || "";

  const studentDormNo =
    profile?.studentDormNo ||
    dormInfo?.studentDormNo ||
    currentSemesterInOut?.studentDormNo ||
    rawFields?.domstuNo ||
    rawFields?.domStuNo ||
    inOutList[0]?.studentDormNo ||
    "-";

  const roomNumber = dormInfo?.roomNumber || rawFields?.roomNo || rawFields?.dormRoomNo || "";
  const bedNumber = dormInfo?.bedNumber || rawFields?.bedNo || rawFields?.dormBedNo || "";

  // 현재 활성 사생(정규입사) 여부 3중 교차 검증
  // 1. 연도 유효성: 현재 연도 기준 2년 이상 지난 과거 학기 데이터 차단
  const currentYearNum = overrideCurrentYear ?? new Date().getFullYear();
  const dataYearNum = parseInt(year, 10);
  const isPastRecord = Boolean(dataYearNum && dataYearNum < currentYearNum - 1);

  // 2. 당해 학기 기숙사 유효 배정 정보(사생번호, 기숙사 구분) 확인
  const hasValidDormAssignment = Boolean(
    resolvedDormType && resolvedDormType !== "-" &&
    studentDormNo && studentDormNo !== "-"
  );

  // 3. 입퇴사 상태 검증: 현재 학기에 명시적으로 퇴사(02 정규퇴사, 03 중도퇴사)된 경우 즉시 차단
  const isExplicitlyTerminated = Boolean(
    rawStatus === "02" ||
    rawStatus === "정규퇴사" ||
    rawStatus === "03" ||
    rawStatus === "중도퇴사" ||
    currentSemesterInOut?.status === "02" ||
    currentSemesterInOut?.status === "03"
  );

  const isAdmittedStatus =
    !isExplicitlyTerminated &&
    (rawStatus === "01" || rawStatus === "정규입사" || hasValidDormAssignment);

  // 최종 활성 사생 여부
  const isCurrentlyResident = isAdmittedStatus && hasValidDormAssignment && !isPastRecord && !isExplicitlyTerminated;

  // 가장 최근 과거 입퇴사 기록 (비사생 안내 카드 표시용: 정렬된 최신순 [0])
  const lastHistory = inOutList[0] || null;

  return {
    isCurrentlyResident,
    isAdmittedStatus,
    hasValidDormAssignment,
    isPastRecord,
    isExplicitlyTerminated,
    year,
    term,
    status,
    rawStatus,
    resolvedDormType,
    resolvedDormBuilding,
    studentDormNo,
    roomNumber,
    bedNumber,
    lastHistory,
  };
}

export default function MobileDormitoryCardPage() {
  const navigate = useNavigate();

  useSetHeader({
    title: "모바일 사생증",
  });

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [dormInfo, setDormInfo] = useState<DormitoryStudentInfo | null>(null);
  const [fallbackAcademic, setFallbackAcademic] = useState<any | null>(null);

  const isPreviewMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "true";

  const fetchCached = useCallback(async () => {
    setIsInitialLoading(true);
    if (isPreviewMode) {
      setDormInfo(MOCK_PREVIEW_DORM_INFO);
      setIsInitialLoading(false);
      return;
    }
    try {
      const cachedResult = await secureStorage.getCacheWithTtl<unknown>(STORAGE_KEY_DORMITORY_DATA);
      const cached = cachedResult?.data;
      const academicCached = await secureStorage.getItem<unknown>("portal_student_info");
      let academicParsed: any = null;
      if (academicCached) {
        try {
          academicParsed = parseDormitoryStudentInfo(academicCached);
        } catch (err) {
          void err;
        }
      }

      if (academicParsed) {
        setFallbackAcademic(academicParsed);
      }

      if (cached) {
        const restored = parseDormitoryStudentInfo(cached);
        const hasValidRf = Boolean(restored.rawFields && Object.keys(restored.rawFields).length > 0);
        const academicDept =
          academicParsed?.profile?.department ||
          academicParsed?.departmentName ||
          academicParsed?.department ||
          "";

        if ((!restored.studentName || !hasValidRf) && academicParsed) {
          const mergedProfile = {
            ...(academicParsed.profile || {}),
            ...(restored.profile || {}),
            department: restored.profile?.department || academicDept,
          };
          setDormInfo({
            ...academicParsed,
            ...restored,
            studentName: restored.studentName || academicParsed.studentName,
            studentId: restored.studentId || academicParsed.studentId,
            department: restored.department || academicDept,
            departmentName: restored.departmentName || academicDept,
            profile: mergedProfile,
            rawFields: hasValidRf ? restored.rawFields : academicParsed.rawFields,
          });
        } else {
          if (academicParsed && (!restored.profile?.department || !restored.department)) {
            const enrichedProfile = restored.profile
              ? {
                  ...restored.profile,
                  department: restored.profile.department || academicDept,
                }
              : restored.profile;
            setDormInfo({
              ...restored,
              profile: enrichedProfile,
              department: restored.department || academicDept,
              departmentName: restored.departmentName || academicDept,
            });
          } else {
            setDormInfo(restored);
          }
        }
      } else {
        // 사생 정보 캐시가 없으면 학적 정보만으로 사생 정보를 채우지 않고 null 유지 (온보딩 유도)
        setDormInfo(null);
      }
    } catch (e) {
      console.error("사생정보 로드 실패", e);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCached();
  }, [fetchCached]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (isMobileAppEnvironment()) {
        const accountStatus = await checkPortalAccountLinked().catch(() => ({
          linked: false,
          studentId: undefined,
        }));
        if (accountStatus.linked) {
          const studentId = accountStatus.studentId || resolveCurrentStudentId();
          const res = await fetchDormitoryStudentInfoFromApp({ stuno: studentId });
          if (res.success && res.data) {
            await secureStorage.setCacheWithTtl(
              STORAGE_KEY_DORMITORY_DATA,
              res.data,
              24 * 60 * 60 * 1000
            );
          }
        }
      }
      await fetchCached();
    } catch (e) {
      console.error("사생증 정보 새로고침 실패", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchCached, isRefreshing]);

  // 우리 앱 환경이 아니거나 구버전 앱인 경우 스토어 설치/업데이트 유도
  useEffect(() => {
    if (isPreviewMode) return;
    if (!isLatestUnidormApp()) {
      guardAppOnly({
        onCancelNavigateBack: true,
        navigate,
      });
    }
  }, [navigate, isPreviewMode]);

  // 사생증 화면 캡처 및 녹화 방지 브릿지 연동
  // 활성 사생증 카드가 표시될 때만 FLAG_SECURE를 켜고, 비사생 안내 화면이거나 화면 이탈 시 즉시 해제
  const {
    isCurrentlyResident,
    isPastRecord,
    isExplicitlyTerminated,
    hasValidDormAssignment,
    year,
    term,
    status,
    rawStatus,
    resolvedDormType,
    resolvedDormBuilding,
    studentDormNo,
    roomNumber,
    bedNumber,
    lastHistory,
  } = evaluateDormitoryResidentStatus(dormInfo);

  const profile = dormInfo?.profile;
  const rawFields = dormInfo?.rawFields;

  const hasTrackedOutcomeRef = useRef<string | null>(null);

  useEffect(() => {
    if (isCurrentlyResident) {
      setScreenCapturePrevented(true);
    } else {
      setScreenCapturePrevented(false);
    }

    const handleRelease = () => {
      setScreenCapturePrevented(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setScreenCapturePrevented(false);
      } else if (document.visibilityState === "visible" && isCurrentlyResident) {
        setScreenCapturePrevented(true);
      }
    };

    window.addEventListener("pagehide", handleRelease);
    window.addEventListener("beforeunload", handleRelease);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      handleRelease();
      window.removeEventListener("pagehide", handleRelease);
      window.removeEventListener("beforeunload", handleRelease);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isCurrentlyResident]);

  const studentName =
    dormInfo?.studentName ||
    profile?.name ||
    rawFields?.korNm ||
    rawFields?.nm ||
    fallbackAcademic?.studentName ||
    fallbackAcademic?.profile?.name ||
    fallbackAcademic?.rawFields?.korNm ||
    fallbackAcademic?.rawFields?.nm ||
    "-";

  const englishName =
    profile?.englishName ||
    rawFields?.engNm ||
    fallbackAcademic?.profile?.englishName ||
    fallbackAcademic?.rawFields?.engNm ||
    "";

  const studentId =
    profile?.studentId ||
    dormInfo?.studentId ||
    rawFields?.persNo ||
    rawFields?.stuno ||
    fallbackAcademic?.studentId ||
    fallbackAcademic?.profile?.studentId ||
    fallbackAcademic?.rawFields?.persNo ||
    fallbackAcademic?.rawFields?.stuno ||
    "-";

  const department =
    dormInfo?.department ||
    dormInfo?.departmentName ||
    profile?.department ||
    rawFields?.deptNm ||
    rawFields?.deptKorNm ||
    rawFields?.hgNm ||
    fallbackAcademic?.department ||
    fallbackAcademic?.departmentName ||
    fallbackAcademic?.profile?.department ||
    fallbackAcademic?.rawFields?.deptNm ||
    fallbackAcademic?.rawFields?.deptKorNm ||
    fallbackAcademic?.rawFields?.hgNm ||
    fallbackAcademic?.rawFields?.sustNm ||
    fallbackAcademic?.rawFields?.dpmjNm ||
    "-";

  const rawGrade =
    profile?.grade ||
    rawFields?.hySeqGbn ||
    fallbackAcademic?.profile?.grade ||
    fallbackAcademic?.grade ||
    fallbackAcademic?.rawFields?.hySeqGbn ||
    "";
  const grade = mapGrade(rawGrade) || "-";

  const photoSrc = toImageSrc(
    dormInfo?.photoBase64 ||
    profile?.photoBase64 ||
    rawFields?.phtFile ||
    fallbackAcademic?.photoBase64 ||
    fallbackAcademic?.profile?.photoBase64 ||
    fallbackAcademic?.rawFields?.phtFile2 ||
    fallbackAcademic?.rawFields?.phtFile1 ||
    fallbackAcademic?.rawFields?.phtFile
  );

  // 포털에서 사생 정보가 한 번이라도 동기화되어 캐시에 존재하는지 확인
  // (사생 정보가 없으면 온보딩 화면으로 유도, 동기화 후 비사생이면 비사생 차단 화면으로 정상 전환)
  const hasValidData = Boolean(
    dormInfo &&
    (
      dormInfo.hasData ||
      dormInfo.studentId ||
      dormInfo.studentName ||
      dormInfo.profile?.studentId ||
      dormInfo.profile?.name ||
      (dormInfo.rawFields && Object.keys(dormInfo.rawFields).length > 0)
    )
  );

  // 1. 페이지 진입 트래킹
  useEffect(() => {
    mixpanelTrack.dormitoryCardPageViewed();
  }, []);

  // 2. 발급 상태 결과 트래킹 (온보딩 노출 / 비사생 차단 / 발급 성공)
  useEffect(() => {
    if (isInitialLoading) return;

    if (!hasValidData) {
      if (hasTrackedOutcomeRef.current !== "onboarding") {
        hasTrackedOutcomeRef.current = "onboarding";
        mixpanelTrack.dormitoryCardOnboardingViewed();
      }
      return;
    }

    if (!isCurrentlyResident) {
      localStorage.setItem("unidorm_dorm_card_issue_status", "FAILED");
      if (hasTrackedOutcomeRef.current !== "non_resident") {
        hasTrackedOutcomeRef.current = "non_resident";
        const reason = isPastRecord
          ? "과거학기"
          : isExplicitlyTerminated
          ? "퇴사"
          : !hasValidDormAssignment
          ? "미배정"
          : "기타";
        const cacheStatus = dormInfo
          ? "DORM_CACHED"
          : fallbackAcademic
          ? "ACADEMIC_ONLY"
          : "NO_CACHE";
        mixpanelTrack.dormitoryCardNonResidentBlocked({
          reason,
          debug_dormGbn: rawFields?.dormGbn || profile?.dormitoryType || "",
          debug_dormBdNm: rawFields?.dormBdNm || profile?.dormitoryBuilding || "",
          debug_hasDomstuNo: Boolean(studentDormNo && studentDormNo !== "-"),
          debug_rawStatus: rawStatus,
          debug_year: year,
          debug_term: term,
          debug_mainRowsCount: dormInfo?.rawDatasets?.["DS_DMTY209"]?.length ?? 0,
          debug_inOutCount: Array.isArray(dormInfo?.inOutList) ? dormInfo.inOutList.length : 0,
          debug_cacheStatus: cacheStatus,
        });
      }
      return;
    }

    if (isCurrentlyResident) {
      localStorage.setItem("unidorm_dorm_card_issue_status", "SUCCESS");
      if (hasTrackedOutcomeRef.current !== "success") {
        hasTrackedOutcomeRef.current = "success";
        mixpanelTrack.dormitoryCardIssueSuccess({
          dormitoryType: resolvedDormType,
          year,
          term,
        });
      }
    }
  }, [
    isInitialLoading,
    hasValidData,
    isCurrentlyResident,
    isPastRecord,
    isExplicitlyTerminated,
    hasValidDormAssignment,
    resolvedDormType,
    year,
    term,
  ]);

  if (!isInitialLoading && !hasValidData) {
    return (
      <PageContainer as="main" $isScrollable>
        <PortalSyncOnboarding onSuccess={fetchCached} />
      </PageContainer>
    );
  }

  // 현재 기숙사생이 아니거나 과거 퇴사자 데이터인 경우 안내 화면 표출
  if (!isInitialLoading && !isCurrentlyResident) {
    return (
      <PageContainer as="main" $isScrollable>
        <NonResidentWrapper>
          <NonResidentCard as="section">
            <IconCircle>
              <Building2 size={32} color="var(--interactive-primary, #3182F6)" strokeWidth={1.8} />
            </IconCircle>

            <NonResidentTitle>현재 입사 중인 사생이 아니에요</NonResidentTitle>
            <NonResidentDesc>
              이번 학기 기숙사에 정규 입사한 사생만 모바일 사생증을 이용할 수 있어요.
            </NonResidentDesc>

            {lastHistory && (
              <HistorySummaryBox>
                <HistorySummaryHeader>
                  <HistorySummaryTitle>최근 입퇴사 기록</HistorySummaryTitle>
                  <HistoryStatusBadge $status={lastHistory.status}>
                    {mapInOutStatus(lastHistory.status) || "기록 있음"}
                  </HistoryStatusBadge>
                </HistorySummaryHeader>
                <HistorySummaryDetail>
                  <HistoryItem>
                    <span className="label">학기</span>
                    <span className="value">
                      {lastHistory.year ? `${lastHistory.year}학년도 ` : ""}
                      {formatSemesterTerm(lastHistory.term) || "-"}
                    </span>
                  </HistoryItem>
                  {lastHistory.dormitoryType && (
                    <HistoryItem>
                      <span className="label">기숙사</span>
                      <span className="value">{mapDormitoryType(lastHistory.dormitoryType)}</span>
                    </HistoryItem>
                  )}
                  {lastHistory.checkOutDate && (
                    <HistoryItem>
                      <span className="label">퇴사일</span>
                      <span className="value">{lastHistory.checkOutDate}</span>
                    </HistoryItem>
                  )}
                </HistorySummaryDetail>
              </HistorySummaryBox>
            )}

            <ButtonGroupColumn>
              <CapsuleButton
                variant="primary"
                fullWidth
                disabled={isRefreshing}
                onClick={handleRefresh}
              >
                <RefreshIconWrapper $isSpinning={isRefreshing}>
                  <RotateCw size={16} />
                </RefreshIconWrapper>
                <span>{isRefreshing ? "기숙사 정보 동기화 중..." : "새로고침"}</span>
              </CapsuleButton>

              <CapsuleButton
                variant="secondary"
                fullWidth
                onClick={() => {
                  mixpanelTrack.dormitoryCardNonResidentHomeClicked();
                  navigate(PATHS.HOME);
                }}
              >
                홈으로 돌아가기
              </CapsuleButton>
            </ButtonGroupColumn>
          </NonResidentCard>

          <FootnoteNotice>
            방금 입사 처리가 되었거나 호실 배정이 변경되었다면 [새로고침]을 눌러 최신 정보를 확인해 주세요.
          </FootnoteNotice>
        </NonResidentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer as="main">
      <CardWrapper as="section">
        {isPreviewMode && (
          <PreviewBadge>PC 브라우저 개발 미리보기 모드 (?preview=true)</PreviewBadge>
        )}
        <MobileDormitoryCard
          fullscreen
          studentName={studentName}
          englishName={englishName}
          studentId={studentId}
          department={department}
          grade={grade}
          photoSrc={photoSrc}
          dormitoryType={resolvedDormType}
          dormitoryBuilding={resolvedDormBuilding}
          studentDormNo={studentDormNo}
          roomNumber={roomNumber}
          bedNumber={bedNumber}
          year={year}
          term={term}
          status={status}
        />
      </CardWrapper>

      <BottomButtonWrapper>
        <DormitoryInfoButton
          type="button"
          onClick={() => {
            mixpanelTrack.dormitoryCardInfoButtonClicked("사생증화면");
            navigate(PATHS.DORMITORY_INFO);
          }}
        >
          <span>사생정보조회(학생)</span>
          <ChevronRight size={18} color="var(--interactive-primary, #3182F6)" />
        </DormitoryInfoButton>
      </BottomButtonWrapper>
    </PageContainer>
  );
}

const PreviewBadge = styled.div`
  background: var(--surface-secondary, #F2F4F6);
  color: var(--content-secondary, #4E5968);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  margin-bottom: 8px;
  text-align: center;
  align-self: center;
`;

const PageContainer = styled.div<{ $isScrollable?: boolean }>`
  width: 100%;
  max-width: 440px;
  flex: 1;
  height: 100%;
  max-height: ${(props) =>
    props.$isScrollable
      ? "none"
      : "calc(100dvh - 70px - var(--safe-area-top, 0px) - var(--safe-area-bottom, 0px))"};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 8px ${MOBILE_PAGE_GUTTER} calc(12px + var(--safe-area-bottom, 0px));
  box-sizing: border-box;
  overflow-y: ${(props) => (props.$isScrollable ? "auto" : "hidden")};
  overflow-x: hidden;
  min-height: 0;

  @media (min-width: 768px) {
    max-height: none;
    min-height: 600px;
    padding: 20px 0 calc(20px + var(--safe-area-bottom, 0px));
  }
`;

const CardWrapper = styled.section`
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
`;

const BottomButtonWrapper = styled.div`
  width: 100%;
  padding-top: 10px;
  flex-shrink: 0;
`;

const DormitoryInfoButton = styled.button`
  width: 100%;
  height: 52px;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease, transform 0.15s ease;

  &:hover {
    background: #f9fafb;
  }

  &:active {
    transform: scale(0.99);
    background: #f2f4f6;
  }
`;

const NonResidentWrapper = styled.div`
  width: 100%;
  max-width: 420px;
  margin: auto auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 0 24px;
  box-sizing: border-box;
`;

const NonResidentCard = styled.div`
  width: 100%;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: var(--radius-xl, 24px);
  padding: 36px 24px 28px;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
`;

const IconCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--blue-50, #e8f3ff);
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NonResidentTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
  margin: 0 0 8px;
  line-height: 1.4;
  letter-spacing: -0.3px;
`;

const NonResidentDesc = styled.p`
  font-size: 15px;
  font-weight: 400;
  color: var(--text-secondary, #4e5968);
  margin: 0 0 24px;
  line-height: 1.5;
  word-break: keep-all;
`;

const HistorySummaryBox = styled.div`
  background: var(--bg-muted, #f2f4f6);
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 24px;
  text-align: left;
`;

const HistorySummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const HistorySummaryTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #4e5968);
`;

const HistoryStatusBadge = styled.span<{ $status?: string }>`
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  background-color: #e5e8eb;
  color: #4e5968;
`;

const HistorySummaryDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;

  .label {
    color: var(--text-tertiary, #8b95a1);
  }

  .value {
    color: var(--text-primary, #191f28);
    font-weight: 600;
  }
`;

const ButtonGroupColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const FootnoteNotice = styled.p`
  font-size: 13px;
  color: var(--text-tertiary, #8b95a1);
  margin: 16px 0 0;
  text-align: center;
  line-height: 1.5;
  word-break: keep-all;
`;

const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const RefreshIconWrapper = styled.span<{ $isSpinning?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;

  svg {
    animation: ${(props) => (props.$isSpinning ? spinAnimation : "none")} 1s linear infinite;
  }
`;

