import { describe, it, expect } from "vitest";
import { evaluateDormitoryResidentStatus } from "../DormitoryCardPage";
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
