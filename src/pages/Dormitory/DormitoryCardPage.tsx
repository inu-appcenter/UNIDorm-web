import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { ChevronRight, RotateCw, Clock } from "lucide-react";
import PortalSyncProgressModal from "@/components/portal/PortalSyncProgressModal";
import { isDormitorySemesterExpired } from "@/utils/semesterGuard";
import PortalSyncOnboarding from "@/components/portal/PortalSyncOnboarding";
import {
  setScreenCapturePrevented,
  isMobileAppEnvironment,
  checkPortalAccountLinked,
  fetchDormitoryStudentInfoFromApp,
  resolveCurrentStudentId,
} from "@/apis/mobileAgentBridge";
import CapsuleButton from "@/components/common/CapsuleButton";
import Skeleton from "@/components/common/Skeleton";
import DormitoryBadge from "@/components/common/DormitoryBadge";
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

const MOCK_PREVIEW_PROFILE = MOCK_PREVIEW_DORM_INFO.profile!;

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

export type NonResidentReasonType = "UNASSIGNED" | "TERMINATED" | "PAST_RECORD" | "UNKNOWN";

export interface NonResidentReasonDetail {
  type: NonResidentReasonType;
  badgeLabel: string;
  badgeStatus: "01" | "02" | "default";
  title: string;
  description: string;
  statusSummary: string;
}

export function resolveNonResidentReasonDetail(
  evaluation: ResidentEvaluationResult
): NonResidentReasonDetail {
  const { isPastRecord, isExplicitlyTerminated, hasValidDormAssignment, lastHistory } = evaluation;

  // 1) 과거 학기 기록만 남아 있는 경우 (상위는 '배정 내역 없음', 세부 사유로 이전 거주 안내)
  if (isPastRecord) {
    const formattedTerm = lastHistory
      ? `${lastHistory.year ? `${lastHistory.year}학년도 ` : ""}${formatSemesterTerm(lastHistory.term)}`
      : "이전 학기";
    return {
      type: "PAST_RECORD",
      badgeLabel: "이전 학기 거주",
      badgeStatus: "02",
      title: "이번 학기 기숙사 배정 내역이 없어요",
      description: `학교 포털에 ${formattedTerm} 거주 기록만 남아 있어 이번 학기 사생증을 발급할 수 없어요.`,
      statusSummary: `${formattedTerm} 거주 후 퇴사`,
    };
  }

  // 2) 이번 학기 퇴사 처리된 경우
  if (isExplicitlyTerminated) {
    const termType = evaluation.rawStatus === "03" ? "중도퇴사" : "정규퇴사";
    return {
      type: "TERMINATED",
      badgeLabel: termType,
      badgeStatus: "02",
      title: "기숙사 퇴사 처리가 완료되었어요",
      description: "이번 학기 퇴사 기록이 확인되어 모바일 사생증 이용 권한이 종료되었어요.",
      statusSummary: `${termType} 완료`,
    };
  }

  // 3) 이번 학기 배정 정보가 아예 없는 경우
  if (!hasValidDormAssignment) {
    return {
      type: "UNASSIGNED",
      badgeLabel: "배정 정보 없음",
      badgeStatus: "default",
      title: "이번 학기 기숙사 배정 내역이 없어요",
      description: "학교 포털에 호실 배정이나 사생 번호가 등록되지 않은 상태예요.",
      statusSummary: "배정 정보 없음",
    };
  }

  return {
    type: "UNKNOWN",
    badgeLabel: "비사생",
    badgeStatus: "default",
    title: "현재 입사 중인 사생이 아니에요",
    description: "이번 학기 기숙사에 정규 입사한 사생만 모바일 사생증을 이용할 수 있어요.",
    statusSummary: "사생 정보 미확인",
  };
}

export default function MobileDormitoryCardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get("mode");

  const [isForceOnboarding, setIsForceOnboarding] = useState<boolean>(() => {
    return modeParam === "issue" || modeParam === "renew";
  });

  useEffect(() => {
    if (modeParam === "issue" || modeParam === "renew") {
      setIsForceOnboarding(true);
    }
  }, [modeParam]);

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [dormInfo, setDormInfo] = useState<DormitoryStudentInfo | null>(null);
  const [fallbackAcademic, setFallbackAcademic] = useState<any | null>(null);
  const [lastSyncTimeText, setLastSyncTimeText] = useState<string>("");

  const updateLastSyncTime = useCallback((timestamp?: number | string | null) => {
    try {
      let date: Date | null = null;
      if (timestamp) {
        date = typeof timestamp === "number" ? new Date(timestamp) : new Date(timestamp);
      } else {
        const stored = localStorage.getItem("portal_dormitory_last_updated");
        if (stored) {
          date = new Date(stored);
        }
      }
      if (date && !isNaN(date.getTime())) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        setLastSyncTimeText(`${y}.${m}.${d} ${hh}:${mm}`);
      }
    } catch {
      // ignore
    }
  }, []);

  const isPreviewMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "true";

  const [previewSimulatedStatus, setPreviewSimulatedStatus] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("status");
    }
    return null;
  });

  const fetchCached = useCallback(async () => {
    setIsInitialLoading(true);
    if (isPreviewMode) {
      if (previewSimulatedStatus === "terminated") {
        setDormInfo({
          ...MOCK_PREVIEW_DORM_INFO,
          status: "02",
          inOutList: [
            {
              year: String(new Date().getFullYear()),
              term: "20",
              status: "02",
              dormitoryType: "02",
              studentDormNo: "24-2-0402-A",
              checkInDate: "",
              checkOutDate: "2026.10.15",
              rawFields: {},
            },
          ],
        });
      } else if (previewSimulatedStatus === "past_record") {
        setDormInfo({
          ...MOCK_PREVIEW_DORM_INFO,
          status: "02",
          studentDormNo: "",
          roomNumber: "",
          bedNumber: "",
          dormitoryBuilding: "",
          profile: {
            ...MOCK_PREVIEW_PROFILE,
            year: "2024",
            term: "1학기",
            studentDormNo: "",
          },
          inOutList: [
            {
              year: "2024",
              term: "10",
              status: "02",
              dormitoryType: "01",
              studentDormNo: "",
              checkInDate: "",
              checkOutDate: "2024.06.21",
              rawFields: {},
            },
          ],
        });
      } else if (previewSimulatedStatus === "unassigned" || previewSimulatedStatus === "non_resident") {
        setDormInfo({
          ...MOCK_PREVIEW_DORM_INFO,
          status: "",
          studentDormNo: "",
          roomNumber: "",
          bedNumber: "",
          dormitoryType: "",
          dormitoryBuilding: "",
          profile: {
            ...MOCK_PREVIEW_PROFILE,
            studentDormNo: "",
            dormitoryType: "",
            dormitoryBuilding: "",
          },
          inOutList: [],
        });
      } else {
        setDormInfo(MOCK_PREVIEW_DORM_INFO);
      }
      updateLastSyncTime(Date.now());
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

        // 비사생 캐시인데 24시간 TTL이 만료된 경우, 오래된 비사생 화면 대신 온보딩 화면을 우선 유도
        if (cachedResult?.isExpired) {
          const evalRes = evaluateDormitoryResidentStatus(restored);
          if (!evalRes.isCurrentlyResident) {
            setIsForceOnboarding(true);
          }
        }
      } else {
        // 사생 정보 캐시가 없으면 학적 정보만으로 사생 정보를 채우지 않고 null 유지 (온보딩 유도)
        setDormInfo(null);
      }
      if (cachedResult?.savedAt) {
        updateLastSyncTime(cachedResult.savedAt);
      } else {
        updateLastSyncTime();
      }
    } catch (e) {
      console.error("사생정보 로드 실패", e);
    } finally {
      setIsInitialLoading(false);
    }
  }, [isPreviewMode, updateLastSyncTime]);

  useEffect(() => {
    void fetchCached();
  }, [fetchCached]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (isPreviewMode) {
        // 프리뷰 환경 실시간 시뮬레이션: 1.2초간 동기화 수행
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const now = new Date();
        updateLastSyncTime(now.getTime());
        if (previewSimulatedStatus === "expired") {
          setPreviewSimulatedStatus(null);
        }
        return;
      }
      if (isMobileAppEnvironment()) {
        const accountStatus = await checkPortalAccountLinked().catch(() => ({
          linked: false,
          studentId: undefined,
        }));
        if (accountStatus.linked) {
          const studentId = accountStatus.studentId || resolveCurrentStudentId();
          const res = await fetchDormitoryStudentInfoFromApp({ stuno: studentId });
          if (res.success && res.data) {
            const nowIso = new Date().toISOString();
            await secureStorage.setCacheWithTtl(
              STORAGE_KEY_DORMITORY_DATA,
              res.data,
              24 * 60 * 60 * 1000
            );
            localStorage.setItem("portal_dormitory_last_updated", nowIso);
            updateLastSyncTime(nowIso);
          }
        }
      }
      await fetchCached();
    } catch (e) {
      console.error("사생증 정보 새로고침 실패", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchCached, isPreviewMode, isRefreshing, previewSimulatedStatus, updateLastSyncTime]);

  useSetHeader({
    title: "모바일 사생증",
  });

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
  const residentEvaluation = evaluateDormitoryResidentStatus(dormInfo);
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
  } = residentEvaluation;

  const isSemesterExpired =
    !isPreviewMode
      ? isDormitorySemesterExpired({
          dormYear: year,
          dormTerm: term,
        })
      : previewSimulatedStatus === "expired";

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

  // 발급 화면(PortalSyncOnboarding) 표출 조건:
  // 1. 포털 캐시 데이터가 아예 없는 경우 (!hasValidData)
  // 2. 홈 발급 유도 모달 등에서 발급/갱신을 시도하러 들어왔거나(isForceOnboarding),
  //    현재 활성 사생이 아니거나 학기가 만료된 경우
  const shouldShowOnboarding =
    !hasValidData ||
    (isForceOnboarding && (!isCurrentlyResident || isSemesterExpired));

  // 1. 페이지 진입 트래킹
  useEffect(() => {
    mixpanelTrack.dormitoryCardPageViewed();
  }, []);

  // 2. 발급 상태 결과 트래킹 (온보딩 노출 / 비사생 차단 / 발급 성공)
  useEffect(() => {
    if (isInitialLoading) return;

    // 온보딩(발급) 화면이 표시 중인 경우에는 비사생 차단 이벤트를 전송하지 않음 (트래킹 누수 방지)
    if (shouldShowOnboarding) {
      if (hasTrackedOutcomeRef.current !== "onboarding") {
        hasTrackedOutcomeRef.current = "onboarding";
        mixpanelTrack.dormitoryCardOnboardingViewed();
      }
      return;
    }

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
    shouldShowOnboarding,
    isCurrentlyResident,
    isPastRecord,
    isExplicitlyTerminated,
    hasValidDormAssignment,
    resolvedDormType,
    year,
    term,
  ]);

  if (isInitialLoading) {
    return (
      <PageContainer as="main">
        <CardWrapper as="section">
          <Skeleton
            width="100%"
            height="100%"
            style={{
              maxWidth: 360,
              maxHeight: 560,
              borderRadius: 24,
              minHeight: 460,
            }}
          />
        </CardWrapper>
      </PageContainer>
    );
  }

  if (!isInitialLoading && shouldShowOnboarding) {
    return (
      <PageContainer as="main">
        <PortalSyncOnboarding
          onSuccess={async () => {
            setIsForceOnboarding(false);
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.delete("mode");
                return next;
              },
              { replace: true }
            );
            await fetchCached();
          }}
        />
      </PageContainer>
    );
  }

  // 학기가 만료된 경우 만료 안내 화면 표출
  if (!isInitialLoading && hasValidData && isSemesterExpired) {
    return (
      <PageContainer as="main" $isScrollable>
        <NonResidentWrapper>
          <NonResidentCard as="section">
            <NonResidentTitle>사생증 이용 기간이 만료되었어요</NonResidentTitle>
            <NonResidentDesc>
              새로운 학기가 시작되었어요. 최신 사생 정보로 갱신해 주세요.
            </NonResidentDesc>

            <HistorySummaryBox>
              <HistorySummaryHeader>
                <HistorySummaryTitle>만료된 사생증 정보</HistorySummaryTitle>
                <HistoryStatusBadge $status="02">만료됨</HistoryStatusBadge>
              </HistorySummaryHeader>
              <HistorySummaryDetail>
                <HistoryItem>
                  <span className="label">발급 학기</span>
                  <span className="value">
                    {year ? `${year}학년도 ` : ""}
                    {formatSemesterTerm(term) || "-"}
                  </span>
                </HistoryItem>
                {resolvedDormType && resolvedDormType !== "-" && (
                  <HistoryItem>
                    <span className="label">기숙사</span>
                    <span className="value">{resolvedDormType}</span>
                  </HistoryItem>
                )}
                {roomNumber && (
                  <HistoryItem>
                    <span className="label">호실</span>
                    <span className="value">
                      {roomNumber}호 {bedNumber ? `(${bedNumber})` : ""}
                    </span>
                  </HistoryItem>
                )}
              </HistorySummaryDetail>
            </HistorySummaryBox>

            <ButtonGroupColumn>
              <CapsuleButton
                variant="primary"
                fullWidth
                onClick={() => {
                  mixpanelTrack.dormitoryCardEntryClicked("만료사생증_갱신하기");
                  setIsForceOnboarding(true);
                }}
              >
                최신 사생증으로 갱신하기
              </CapsuleButton>

              <CapsuleButton
                variant="secondary"
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
            새 학기 입사 처리가 완료된 경우 [최신 사생증으로 갱신하기]를 누르면 새 학기 사생증이 발급돼요.
          </FootnoteNotice>
        </NonResidentWrapper>
      </PageContainer>
    );
  }

  // 현재 기숙사생이 아니거나 과거 퇴사자 데이터인 경우 안내 화면 표출
  if (!isInitialLoading && !isCurrentlyResident) {
    const reasonDetail = resolveNonResidentReasonDetail(residentEvaluation);

    return (
      <PageContainer as="main" $isScrollable>
        <NonResidentWrapper>
          <NonResidentCard as="section">
            <NonResidentTitle>{reasonDetail.title}</NonResidentTitle>
            <NonResidentDesc>{reasonDetail.description}</NonResidentDesc>

            <HistorySummaryBox>
              <HistorySummaryHeader>
                <HistorySummaryTitle>포털 확인 정보</HistorySummaryTitle>
                <HistoryStatusBadge $status={reasonDetail.badgeStatus}>
                  {reasonDetail.badgeLabel}
                </HistoryStatusBadge>
              </HistorySummaryHeader>
              <HistorySummaryDetail>
                <HistoryItem>
                  <span className="label">판정 사유</span>
                  <span className="value">{reasonDetail.statusSummary}</span>
                </HistoryItem>
                {lastHistory?.year && (
                  <HistoryItem>
                    <span className="label">최근 거주 학기</span>
                    <span className="value">
                      {lastHistory.year}학년도 {formatSemesterTerm(lastHistory.term)}
                    </span>
                  </HistoryItem>
                )}
                {lastHistory?.dormitoryType && (
                  <HistoryItem>
                    <span className="label">기숙사</span>
                    <DormitoryBadge
                      dormType={mapDormitoryType(lastHistory.dormitoryType)}
                      variant="subtle"
                      size="sm"
                    />
                  </HistoryItem>
                )}
                {lastHistory?.checkOutDate && (
                  <HistoryItem>
                    <span className="label">퇴사 일자</span>
                    <span className="value">{lastHistory.checkOutDate}</span>
                  </HistoryItem>
                )}
              </HistorySummaryDetail>
            </HistorySummaryBox>

            <ActionGuideBox>
              <GuideStep>
                <StepBadge>1</StepBadge>
                <StepText>학교 포털(ERP) 사생정보조회에서 이번 학기 호실 배정과 입사 상태가 정상인지 먼저 확인해 주세요.</StepText>
              </GuideStep>
              <GuideStep>
                <StepBadge>2</StepBadge>
                <StepText>
                  포털에서는 정상 입사로 나오는데 사생증이 발급되지 않는다면,{" "}
                  <InquiryLink
                    href="https://forms.gle/PGkiDutmmT8gzddF7"
                    target="_blank"
                    rel="noreferrer"
                  >
                    마이페이지 1:1 문의
                  </InquiryLink>
                  를 통해 유니돔 팀으로 문의해 주세요.
                </StepText>
              </GuideStep>
            </ActionGuideBox>

            <ButtonGroupColumn>
              <CapsuleButton
                variant="primary"
                fullWidth
                onClick={() => {
                  mixpanelTrack.dormitoryCardEntryClicked("비사생_다시발급하기");
                  setIsForceOnboarding(true);
                }}
              >
                사생증 다시 발급하기
              </CapsuleButton>

              <CapsuleButton
                variant="secondary"
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
            방금 입사 처리가 되었거나 호실 배정이 변경되었다면 [사생증 다시 발급하기] 또는 [새로고침]을 눌러 최신 정보를 확인해 주세요.
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
        <SyncInfoBar>
          <SyncTimeWrapper>
            <Clock size={12} color="var(--content-tertiary, #8B95A1)" />
            <span>최근 동기화 {lastSyncTimeText || "확인 중..."}</span>
          </SyncTimeWrapper>
          <SyncInlineButton
            type="button"
            disabled={isRefreshing}
            onClick={handleRefresh}
            aria-label="사생증 정보 새로고침"
          >
            <RotateCw size={12} className={isRefreshing ? "spin-icon" : ""} />
            <span>{isRefreshing ? "동기화 중..." : "새로고침"}</span>
          </SyncInlineButton>
        </SyncInfoBar>
      </CardWrapper>

      <PortalSyncProgressModal isOpen={isRefreshing} />

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

const spinKeyframes = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SyncInfoBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 360px;
  margin-top: 10px;
  padding: 6px 12px;
  background: var(--surface-secondary, #f2f4f6);
  border-radius: 14px;
  box-sizing: border-box;
`;

const SyncTimeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--content-secondary, #4e5968);
  letter-spacing: -0.2px;
`;

const SyncInlineButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--border-subtle, #e5e8eb);
  background: var(--surface-primary, #ffffff);
  color: var(--interactive-primary, #3182f6);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.15s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: #ffffff;
    filter: brightness(0.98);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .spin-icon {
    animation: ${spinKeyframes} 0.8s linear infinite;
  }
`;

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
  background-color: ${(props) =>
    props.$status === "01"
      ? "var(--brand-subtle, #e8f3ff)"
      : props.$status === "02"
      ? "#fee8e8"
      : "#e5e8eb"};
  color: ${(props) =>
    props.$status === "01"
      ? "var(--brand-primary, #3182f6)"
      : props.$status === "02"
      ? "var(--status-error, #f04452)"
      : "#4e5968"};
`;

const ActionGuideBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-divider, #e5e8eb);
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 24px;
  text-align: left;
`;

const GuideStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const StepBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--brand-subtle, #e8f3ff);
  color: var(--brand-primary, #3182f6);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
`;

const StepText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary, #4e5968);
  word-break: keep-all;
`;

const InquiryLink = styled.a`
  color: var(--brand-primary, #3182f6);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;

  &:hover {
    filter: brightness(0.9);
  }
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

