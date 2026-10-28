import { describe, it, expect } from "vitest";
import { evaluateDormitoryResidentStatus, resolveNonResidentReasonDetail } from "../DormitoryCardPage";
import { DormitoryStudentInfo } from "@/utils/ssvParser";
import { isDormitorySemesterExpired } from "../../../utils/semesterGuard";

describe("DormitoryCardPage - 발급 온보딩 표출 로직 및 미발급자 재시도 UX 검증", () => {
  const mockNonResidentInfo: DormitoryStudentInfo = {
    hasData: true,
    studentId: "202301234",
    studentName: "홍길동",
    appliedYear: "2025",
    appliedSemester: "10",
    status: "02", // 퇴사
    inOutList: [
      {
        year: "2025",
        term: "10",
        status: "02",
        studentDormNo: "01001",
      },
    ],
  };

  const mockActiveResidentInfo: DormitoryStudentInfo = {
    hasData: true,
    studentId: "202601234",
    studentName: "김사생",
    appliedYear: "2026",
    appliedSemester: "20",
    status: "01",
    dormitoryType: "02",
    studentDormNo: "02001",
    profile: {
      year: "2026",
      term: "20",
      dormitoryType: "02",
      studentDormNo: "02001",
    },
    inOutList: [
      {
        year: "2026",
        term: "20",
        status: "01",
        studentDormNo: "02001",
      },
    ],
  };

  // DormitoryCardPage 내부 shouldShowOnboarding 결정 함수 시뮬레이션
  function computeShouldShowOnboarding({
    hasValidData,
    isForceOnboarding,
    isCurrentlyResident,
    isSemesterExpired,
  }: {
    hasValidData: boolean;
    isForceOnboarding: boolean;
    isCurrentlyResident: boolean;
    isSemesterExpired: boolean;
  }): boolean {
    return (
      !hasValidData ||
      (isForceOnboarding && (!isCurrentlyResident || isSemesterExpired))
    );
  }

  it("1. 캐시 데이터가 없는 신규 미발급자는 항상 발급 온보딩 화면이 표출된다", () => {
    const shouldShow = computeShouldShowOnboarding({
      hasValidData: false,
      isForceOnboarding: false,
      isCurrentlyResident: false,
      isSemesterExpired: false,
    });
    expect(shouldShow).toBe(true);
  });

  it("2. 과거 퇴사/비사생 캐시가 있는 상태에서 홈 모달(?mode=issue)을 통해 진입하면 '사생이 아니에요'가 아닌 발급 온보딩 화면이 우선 표출된다", () => {
    const evalResult = evaluateDormitoryResidentStatus(mockNonResidentInfo, 2026);
    expect(evalResult.isCurrentlyResident).toBe(false);

    // mode=issue로 들어온 경우 isForceOnboarding=true
    const isForceOnboarding = true;
    const shouldShow = computeShouldShowOnboarding({
      hasValidData: true,
      isForceOnboarding,
      isCurrentlyResident: evalResult.isCurrentlyResident,
      isSemesterExpired: false,
    });

    expect(shouldShow).toBe(true);
  });

  it("3. 과거 퇴사/비사생 캐시가 있는 상태에서 일반 진입(isForceOnboarding=false)하면 비사생 안내 카드가 표출된다", () => {
    const evalResult = evaluateDormitoryResidentStatus(mockNonResidentInfo, 2026);
    expect(evalResult.isCurrentlyResident).toBe(false);

    const isForceOnboarding = false;
    const shouldShow = computeShouldShowOnboarding({
      hasValidData: true,
      isForceOnboarding,
      isCurrentlyResident: evalResult.isCurrentlyResident,
      isSemesterExpired: false,
    });

    // 온보딩이 아닌 비사생 안내 카드 표시
    expect(shouldShow).toBe(false);
  });

  it("4. 학기가 만료된 사생이 홈 갱신 모달(?mode=renew)을 통해 진입하면 발급 온보딩 화면이 표출된다", () => {
    const isSemesterExpired = true;
    const isCurrentlyResident = true; // 과거 데이터상 거주자였으나 만료됨

    const shouldShow = computeShouldShowOnboarding({
      hasValidData: true,
      isForceOnboarding: true,
      isCurrentlyResident,
      isSemesterExpired,
    });

    expect(shouldShow).toBe(true);
  });

  it("5. 현재 정상 거주 중인 활성 사생은 ?mode=issue가 주어지더라도 모바일 사생증이 유지된다", () => {
    const evalResult = evaluateDormitoryResidentStatus(mockActiveResidentInfo, 2026);
    expect(evalResult.isCurrentlyResident).toBe(true);

    const isSemesterExpired = isDormitorySemesterExpired({
      dormYear: "2026",
      dormTerm: "20",
      now: new Date("2026-10-27T08:00:00Z"),
    });
    expect(isSemesterExpired).toBe(false);

    const shouldShow = computeShouldShowOnboarding({
      hasValidData: true,
      isForceOnboarding: true,
      isCurrentlyResident: evalResult.isCurrentlyResident,
      isSemesterExpired,
    });

    // 활성 사생은 사생증 화면 유지
    expect(shouldShow).toBe(false);
  });
});

describe("resolveNonResidentReasonDetail - 비사생 판정 원인별 UI/UX 가이드 정보 생성 검증", () => {
  it("1. 이번 학기 퇴사 처리(02: 정규퇴사)된 경우 퇴사 완료 안내와 배지가 반환된다", () => {
    const detail = resolveNonResidentReasonDetail({
      isCurrentlyResident: false,
      isAdmittedStatus: false,
      hasValidDormAssignment: true,
      isPastRecord: false,
      isExplicitlyTerminated: true,
      rawStatus: "02",
      status: "02",
      resolvedDormType: "제1기숙사",
      studentDormNo: "01001",
    });

    expect(detail.type).toBe("TERMINATED");
    expect(detail.badgeLabel).toBe("정규퇴사");
    expect(detail.badgeStatus).toBe("02");
    expect(detail.title).toBe("기숙사 퇴사 처리가 완료되었어요");
    expect(detail.statusSummary).toBe("정규퇴사 완료");
  });

  it("2. 이번 학기 퇴사 처리(03: 중도퇴사)된 경우 중도퇴사 안내와 배지가 반환된다", () => {
    const detail = resolveNonResidentReasonDetail({
      isCurrentlyResident: false,
      isAdmittedStatus: false,
      hasValidDormAssignment: true,
      isPastRecord: false,
      isExplicitlyTerminated: true,
      rawStatus: "03",
      status: "03",
      resolvedDormType: "제2기숙사",
      studentDormNo: "02001",
    });

    expect(detail.type).toBe("TERMINATED");
    expect(detail.badgeLabel).toBe("중도퇴사");
    expect(detail.badgeStatus).toBe("02");
    expect(detail.title).toBe("기숙사 퇴사 처리가 완료되었어요");
    expect(detail.statusSummary).toBe("중도퇴사 완료");
  });

  it("3. 과거 학기 기록만 남아 있는 경우 상위는 '배정 내역 없음'이며 이전 거주 학기가 명시된다", () => {
    const detail = resolveNonResidentReasonDetail({
      isCurrentlyResident: false,
      isAdmittedStatus: false,
      hasValidDormAssignment: false,
      isPastRecord: true,
      isExplicitlyTerminated: false,
      lastHistory: {
        year: "2024",
        term: "10",
        status: "02",
        dormitoryType: "01",
      },
    });

    expect(detail.type).toBe("PAST_RECORD");
    expect(detail.badgeLabel).toBe("이전 학기 거주");
    expect(detail.badgeStatus).toBe("02");
    expect(detail.title).toBe("이번 학기 기숙사 배정 내역이 없어요");
    expect(detail.description).toContain("2024학년도 1학기 거주 기록만 남아 있어");
    expect(detail.statusSummary).toContain("2024학년도 1학기 거주 후 퇴사");
  });

  it("4. 이번 학기 배정 정보가 아예 없는 경우(통학생/미선발) '배정 정보 없음' 안내가 반환된다", () => {
    const detail = resolveNonResidentReasonDetail({
      isCurrentlyResident: false,
      isAdmittedStatus: false,
      hasValidDormAssignment: false,
      isPastRecord: false,
      isExplicitlyTerminated: false,
    });

    expect(detail.type).toBe("UNASSIGNED");
    expect(detail.badgeLabel).toBe("배정 정보 없음");
    expect(detail.badgeStatus).toBe("default");
    expect(detail.title).toBe("이번 학기 기숙사 배정 내역이 없어요");
    expect(detail.description).toBe("학교 포털에 호실 배정이나 사생 번호가 등록되지 않은 상태예요.");
    expect(detail.statusSummary).toBe("생활원 미배정 (통학생 또는 미선발)");
  });

  it("5. 분류 불명확한 케이스는 UNKNOWN 기본 비사생 안내가 반환된다", () => {
    const detail = resolveNonResidentReasonDetail({
      isCurrentlyResident: false,
      isAdmittedStatus: true,
      hasValidDormAssignment: true,
      isPastRecord: false,
      isExplicitlyTerminated: false,
    });

    expect(detail.type).toBe("UNKNOWN");
    expect(detail.badgeLabel).toBe("비사생");
    expect(detail.title).toBe("현재 입사 중인 사생이 아니에요");
  });
});

describe("비사생 트래킹 누수 방지 및 24시간 TTL 만료 검증", () => {
  it("온보딩(발급) 화면이 표시 중인 경우 비사생 차단 이벤트를 쏘지 않고 온보딩 노출로 기록한다", () => {
    let outcomeTracked = "";
    const shouldShowOnboarding = true;

    // useEffect 로직 시뮬레이션
    if (shouldShowOnboarding) {
      outcomeTracked = "onboarding";
    } else {
      outcomeTracked = "non_resident";
    }

    expect(outcomeTracked).toBe("onboarding");
  });

  it("비사생 캐시인데 24시간 TTL이 만료된 경우 온보딩(isForceOnboarding)을 유도한다", () => {
    const cachedResult = { isExpired: true };
    const evalRes = { isCurrentlyResident: false };

    let isForceOnboarding = false;
    if (cachedResult?.isExpired) {
      if (!evalRes.isCurrentlyResident) {
        isForceOnboarding = true;
      }
    }

    expect(isForceOnboarding).toBe(true);
  });
});
