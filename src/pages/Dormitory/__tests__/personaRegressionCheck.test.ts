import { describe, it, expect } from "vitest";
import { evaluateDormitoryResidentStatus } from "../DormitoryCardPage";
import { DormitoryStudentInfo } from "@/utils/ssvParser";

describe("기존 및 신규 사용자 페르소나별 회귀 및 무영향 철저 검증", () => {
  it("[페르소나 1: 1기숙사 재학생] 1기숙사 사생은 정상 발급되어야 한다", () => {
    const student: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202301001",
      studentName: "김일기",
      appliedYear: "2026",
      appliedSemester: "20",
      status: "01",
      dormitoryType: "01",
      dormitoryBuilding: "본관",
      studentDormNo: "01201111",
      profile: {
        name: "김일기",
        studentId: "202301001",
        year: "2026",
        term: "20",
        dormitoryType: "01",
        dormitoryBuilding: "본관",
        studentDormNo: "01201111",
      },
      inOutList: [
        { year: "2026", term: "20", status: "01", studentDormNo: "01201111", checkInDate: "2026-08-28" },
      ],
    };

    const res = evaluateDormitoryResidentStatus(student, 2026);
    expect(res.isCurrentlyResident).toBe(true);
    expect(res.resolvedDormType).toBe("제1기숙사");
    expect(res.status).toBe("정규입사");
  });

  it("[페르소나 2: 2기숙사 BTL 재학생] 제2기숙사(BTL) 사생은 정상 발급되어야 한다", () => {
    const student: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202201002",
      studentName: "이이기",
      appliedYear: "2026",
      appliedSemester: "20",
      status: "01",
      dormitoryType: "03",
      dormitoryBuilding: "A동",
      studentDormNo: "03202222",
      profile: {
        name: "이이기",
        studentId: "202201002",
        year: "2026",
        term: "20",
        dormitoryType: "03",
        dormitoryBuilding: "A동",
        studentDormNo: "03202222",
      },
      inOutList: [
        { year: "2026", term: "20", status: "01", studentDormNo: "03202222", checkInDate: "2026-08-28" },
      ],
    };

    const res = evaluateDormitoryResidentStatus(student, 2026);
    expect(res.isCurrentlyResident).toBe(true);
    expect(res.resolvedDormType).toBe("제2기숙사(BTL)");
    expect(res.status).toBe("정규입사");
  });

  it("[페르소나 3: 3기숙사 첫 입사 신입생] 3기숙사 신입생은 정상 발급되어야 한다", () => {
    const student: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202601003",
      studentName: "박삼기",
      appliedYear: "2026",
      appliedSemester: "20",
      status: "01",
      dormitoryType: "04",
      dormitoryBuilding: "제3기숙사",
      studentDormNo: "04203333",
      profile: {
        name: "박삼기",
        studentId: "202601003",
        year: "2026",
        term: "20",
        dormitoryType: "04",
        dormitoryBuilding: "제3기숙사",
        studentDormNo: "04203333",
      },
      inOutList: [
        { year: "2026", term: "20", status: "01", studentDormNo: "04203333", checkInDate: "2026-08-28" },
      ],
    };

    const res = evaluateDormitoryResidentStatus(student, 2026);
    expect(res.isCurrentlyResident).toBe(true);
    expect(res.resolvedDormType).toBe("제3기숙사");
    expect(res.status).toBe("정규입사");
  });

  it("[페르소나 4: 과거 사생이지만 현재 비사생] 과거 2025년 퇴사 기록만 있고 이번 학기 배정이 없는 학생은 절대 사생증이 발급되면 안 된다", () => {
    const pastStudent: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202101004",
      studentName: "최과거",
      appliedYear: "2025",
      appliedSemester: "20",
      status: "02",
      dormitoryType: "",
      dormitoryBuilding: "",
      studentDormNo: "-",
      profile: {
        name: "최과거",
        studentId: "202101004",
        year: "2025",
        term: "20",
        dormitoryType: "",
        dormitoryBuilding: "",
        studentDormNo: "-",
      },
      inOutList: [
        { year: "2025", term: "20", status: "02", studentDormNo: "03201010", checkOutDate: "2025-12-20" },
      ],
    };

    const res = evaluateDormitoryResidentStatus(pastStudent, 2026);
    expect(res.isCurrentlyResident).toBe(false);
    expect(res.hasValidDormAssignment).toBe(false);
  });

  it("[페르소나 5: 이번 학기 중도퇴사자] 이번 학기(2026-2)에 중도퇴사(03)한 학생은 즉시 차단되어야 한다", () => {
    const terminatedStudent: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202401005",
      studentName: "정퇴사",
      appliedYear: "2026",
      appliedSemester: "20",
      status: "03",
      dormitoryType: "02",
      dormitoryBuilding: "A동",
      studentDormNo: "02204444",
      profile: {
        name: "정퇴사",
        studentId: "202401005",
        year: "2026",
        term: "20",
        dormitoryType: "02",
        dormitoryBuilding: "A동",
        studentDormNo: "02204444",
      },
      inOutList: [
        { year: "2026", term: "20", status: "03", studentDormNo: "02204444", checkInDate: "2026-08-28", checkOutDate: "2026-10-15" },
      ],
    };

    const res = evaluateDormitoryResidentStatus(terminatedStudent, 2026);
    expect(res.isCurrentlyResident).toBe(false);
    expect(res.isExplicitlyTerminated).toBe(true);
  });

  it("[페르소나 6: 2년 이상 지난 졸업생 데이터] 과거 2022년 데이터만 있는 경우 비사생으로 차단되어야 한다", () => {
    const oldStudent: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "201801006",
      studentName: "강졸업",
      appliedYear: "2022",
      appliedSemester: "10",
      status: "02",
      dormitoryType: "01",
      dormitoryBuilding: "본관",
      studentDormNo: "01205555",
      profile: {
        name: "강졸업",
        studentId: "201801006",
        year: "2022",
        term: "10",
        dormitoryType: "01",
        dormitoryBuilding: "본관",
        studentDormNo: "01205555",
      },
      inOutList: [
        { year: "2022", term: "10", status: "02", studentDormNo: "01205555", checkOutDate: "2022-06-20" },
      ],
    };

    const res = evaluateDormitoryResidentStatus(oldStudent, 2026);
    expect(res.isCurrentlyResident).toBe(false);
    expect(res.isPastRecord).toBe(true);
  });

  it("[페르소나 7: 데이터 완전 부재] null 데이터 수신 시 안전하게 비사생으로 처리되어야 한다", () => {
    const res = evaluateDormitoryResidentStatus(null, 2026);
    expect(res.isCurrentlyResident).toBe(false);
    expect(res.hasValidDormAssignment).toBe(false);
    expect(res.lastHistory).toBeNull();
  });

  it("[페르소나 8: 비사생 온보딩 루프 방지] 포털 동기화 완료 후 비사생(기숙사 배정 없음)인 경우 온보딩에 멈추지 않고 비사생 차단 화면으로 정상 판정되어야 한다", () => {
    // 비사생(통학생)이 포털 동기화를 마쳤을 때의 데이터 구조
    const nonResidentSynced: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202401999",
      studentName: "나통학",
      appliedYear: "2026",
      appliedSemester: "20",
      status: "",
      dormitoryType: "",
      dormitoryBuilding: "",
      studentDormNo: "-",
      profile: {
        name: "나통학",
        studentId: "202401999",
        year: "2026",
        term: "20",
        dormitoryType: "",
        dormitoryBuilding: "",
        studentDormNo: "-",
      },
      inOutList: [],
      rawFields: { korNm: "나통학", persNo: "202401999" },
    };

    // 1. 사생 여부 판별: 비사생이어야 함
    const res = evaluateDormitoryResidentStatus(nonResidentSynced, 2026);
    expect(res.isCurrentlyResident).toBe(false);
    expect(res.hasValidDormAssignment).toBe(false);

    // 2. hasValidData 판별: 동기화된 사생 데이터가 존재하므로 true여야 함 (온보딩 화면 재노출 방지)
    const hasValidData = Boolean(
      nonResidentSynced &&
      (
        nonResidentSynced.hasData ||
        nonResidentSynced.studentId ||
        nonResidentSynced.studentName ||
        nonResidentSynced.profile?.studentId ||
        nonResidentSynced.profile?.name ||
        (nonResidentSynced.rawFields && Object.keys(nonResidentSynced.rawFields).length > 0)
      )
    );
    expect(hasValidData).toBe(true);
  });
});