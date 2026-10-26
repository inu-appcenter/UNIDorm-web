import { describe, it, expect } from "vitest";
import { evaluateDormitoryResidentStatus, normalizeSemesterTerm } from "../DormitoryCardPage";
import { DormitoryStudentInfo } from "@/utils/ssvParser";

describe("DormitoryCardPage - 활성 사생 3중 교차 검증 로직 정밀 테스트", () => {
  it("[제보 실사례] 과거 이력 10건(2021년 퇴사 포함)을 가진 2026년 2학기 거주 학생은 정상 사생으로 판별되어야 한다", () => {
    // 제보 학생 실제 데이터 구조 모의
    const mockStudentInfo: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202101504",
      studentName: "이성빈",
      appliedYear: "2026",
      appliedSemester: "20",
      status: "01",
      dormitoryType: "03",
      dormitoryBuilding: "B동",
      studentDormNo: "03205052",
      roomNumber: "505",
      bedNumber: "2",
      profile: {
        name: "이성빈",
        studentId: "202101504",
        department: "컴퓨터공학부",
        grade: "4",
        year: "2026",
        term: "20",
        dormitoryType: "03",
        dormitoryBuilding: "B동",
        studentDormNo: "03205052",
      },
      // 최신순으로 정규화된 10개 학기 입퇴사 이력
      inOutList: [
        { year: "2026", term: "20", status: "01", studentDormNo: "03205052", checkInDate: "2026-08-28" },
        { year: "2026", term: "10", status: "02", studentDormNo: "03201011", checkInDate: "2026-02-28", checkOutDate: "2026-06-20" },
        { year: "2025", term: "20", status: "02", studentDormNo: "02203022", checkInDate: "2025-08-28", checkOutDate: "2025-12-20" },
        { year: "2025", term: "10", status: "02", studentDormNo: "02202033", checkInDate: "2025-02-28", checkOutDate: "2025-06-20" },
        { year: "2024", term: "20", status: "02", studentDormNo: "02201044", checkInDate: "2024-08-28", checkOutDate: "2024-12-20" },
        { year: "2024", term: "10", status: "02", studentDormNo: "02205055", checkInDate: "2024-02-28", checkOutDate: "2024-06-20" },
        { year: "2023", term: "20", status: "02", studentDormNo: "01206066", checkInDate: "2023-08-28", checkOutDate: "2023-12-20" },
        { year: "2023", term: "10", status: "02", studentDormNo: "01207077", checkInDate: "2023-02-28", checkOutDate: "2023-06-20" },
        { year: "2022", term: "20", status: "02", studentDormNo: "01208088", checkInDate: "2022-08-28", checkOutDate: "2022-12-20" },
        // 10번째 행: 1학년 첫 학기 퇴사 기록
        { year: "2021", term: "10", status: "02", studentDormNo: "01209099", checkInDate: "2021-02-28", checkOutDate: "2021-04-27" },
      ],
    };

    const result = evaluateDormitoryResidentStatus(mockStudentInfo, 2026);

    // 핵심 판별 결과: 반드시 true (활성 사생)여야 함
    expect(result.isCurrentlyResident).toBe(true);
    expect(result.isAdmittedStatus).toBe(true);
    expect(result.hasValidDormAssignment).toBe(true);
    expect(result.isPastRecord).toBe(false);
    expect(result.isExplicitlyTerminated).toBe(false);

    // 상세 표시 정보 검증
    expect(result.status).toBe("정규입사");
    expect(result.resolvedDormType).toBe("제2기숙사(BTL)");
    expect(result.resolvedDormBuilding).toBe("B동");
    expect(result.studentDormNo).toBe("03205052");
    expect(result.year).toBe("2026");
    expect(result.term).toBe("20");
  });

  it("[첫 입사자] 이력이 1건만 존재하는 2026년 2학기 신입/첫 사생은 정상 발급되어야 한다", () => {
    const mockNewStudent: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202601111",
      studentName: "김신입",
      appliedYear: "2026",
      appliedSemester: "20",
      status: "01",
      dormitoryType: "01",
      dormitoryBuilding: "본관",
      studentDormNo: "01201011",
      profile: {
        name: "김신입",
        studentId: "202601111",
        year: "2026",
        term: "20",
        dormitoryType: "01",
        dormitoryBuilding: "본관",
        studentDormNo: "01201011",
      },
      inOutList: [
        { year: "2026", term: "20", status: "01", studentDormNo: "01201011", checkInDate: "2026-08-28" },
      ],
    };

    const result = evaluateDormitoryResidentStatus(mockNewStudent, 2026);
    expect(result.isCurrentlyResident).toBe(true);
    expect(result.resolvedDormType).toBe("제1기숙사");
    expect(result.studentDormNo).toBe("01201011");
  });

  it("[중도퇴사자] 현재 학기에 명시적으로 중도퇴사(03)한 경우 비사생으로 즉시 차단되어야 한다", () => {
    const mockTerminatedStudent: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202301222",
      studentName: "박퇴사",
      appliedYear: "2026",
      appliedSemester: "20",
      status: "03",
      dormitoryType: "02",
      dormitoryBuilding: "A동",
      studentDormNo: "02202022",
      profile: {
        name: "박퇴사",
        studentId: "202301222",
        year: "2026",
        term: "20",
        dormitoryType: "02",
        dormitoryBuilding: "A동",
        studentDormNo: "02202022",
      },
      inOutList: [
        { year: "2026", term: "20", status: "03", studentDormNo: "02202022", checkInDate: "2026-08-28", checkOutDate: "2026-10-05" },
      ],
    };

    const result = evaluateDormitoryResidentStatus(mockTerminatedStudent, 2026);
    expect(result.isCurrentlyResident).toBe(false);
    expect(result.isExplicitlyTerminated).toBe(true);
    expect(result.lastHistory?.status).toBe("03");
  });

  it("[다음 학기 미입사자] 다음 학기(2027-1)에 기숙사에 살지 않는 경우 사생으로 오인 발급되지 않아야 한다", () => {
    // 2027년 1학기가 되었으나 기숙사 신청을 안 해 배정 정보가 없는 학생
    const mockNonResidentNextSemester: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202101504",
      studentName: "이성빈",
      appliedYear: "2027",
      appliedSemester: "10",
      status: "",
      dormitoryType: "",
      dormitoryBuilding: "",
      studentDormNo: "-",
      profile: {
        name: "이성빈",
        studentId: "202101504",
        year: "2027",
        term: "10",
        dormitoryType: "",
        dormitoryBuilding: "",
        studentDormNo: "-",
      },
      // 과거 2026-2 입사 기록이 남아있더라도 당해 학기 배정이 없으므로 차단되어야 함
      inOutList: [
        { year: "2026", term: "20", status: "01", studentDormNo: "03205052", checkInDate: "2026-08-28" },
      ],
    };

    const result = evaluateDormitoryResidentStatus(mockNonResidentNextSemester, 2027);
    expect(result.isCurrentlyResident).toBe(false);
    expect(result.hasValidDormAssignment).toBe(false);
  });

  it("[2년 이상 과거 기록] 2년 이상 지난 과거 학기(2021년) 데이터만 있는 경우 비사생으로 차단되어야 한다", () => {
    const mockOldRecord: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "201801333",
      studentName: "최졸업",
      appliedYear: "2021",
      appliedSemester: "10",
      status: "02",
      dormitoryType: "01",
      studentDormNo: "01201099",
      profile: {
        name: "최졸업",
        studentId: "201801333",
        year: "2021",
        term: "10",
        dormitoryType: "01",
        studentDormNo: "01201099",
      },
      inOutList: [
        { year: "2021", term: "10", status: "02", studentDormNo: "01201099", checkOutDate: "2021-06-20" },
      ],
    };

    const result = evaluateDormitoryResidentStatus(mockOldRecord, 2026);
    expect(result.isCurrentlyResident).toBe(false);
    expect(result.isPastRecord).toBe(true);
  });

  it("[데이터 부재] dormInfo가 null인 경우 안전하게 비사생으로 처리되어야 한다", () => {
    const result = evaluateDormitoryResidentStatus(null, 2026);
    expect(result.isCurrentlyResident).toBe(false);
    expect(result.hasValidDormAssignment).toBe(false);
    expect(result.lastHistory).toBeNull();
  });
  it("[학기 정규화 검증] 20, 2학기, 2 등 다양한 학기 표기가 동일한 학기 코드로 정규화되어야 한다", () => {
    expect(normalizeSemesterTerm("20")).toBe("20");
    expect(normalizeSemesterTerm("2학기")).toBe("20");
    expect(normalizeSemesterTerm("2")).toBe("20");
    expect(normalizeSemesterTerm("10")).toBe("10");
    expect(normalizeSemesterTerm("1학기")).toBe("10");
    expect(normalizeSemesterTerm("1")).toBe("10");
    expect(normalizeSemesterTerm("30")).toBe("30");
    expect(normalizeSemesterTerm("여름학기")).toBe("30");
    expect(normalizeSemesterTerm("40")).toBe("40");
    expect(normalizeSemesterTerm("겨울학기")).toBe("40");
    expect(normalizeSemesterTerm("")).toBe("");
  });

  it("[학기 불일치 방어] 메인 학기가 '2학기'이고 inOutList가 '20'인 경우에도 정상 정규입사로 교차 매칭되어야 한다", () => {
    const mockMismatchTermStudent: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202600522",
      studentName: "이정규",
      appliedYear: "2026",
      appliedSemester: "2학기",
      status: "",
      dormitoryType: "03",
      dormitoryBuilding: "B동",
      studentDormNo: "03205052",
      profile: {
        name: "이정규",
        studentId: "202600522",
        year: "2026",
        term: "2학기",
        dormitoryType: "03",
        dormitoryBuilding: "B동",
        studentDormNo: "03205052",
      },
      inOutList: [
        { year: "2026", term: "20", status: "01", studentDormNo: "03205052", checkInDate: "2026-08-28" },
        { year: "2026", term: "10", status: "02", studentDormNo: "03201011", checkOutDate: "2026-06-20" },
      ],
    };

    const result = evaluateDormitoryResidentStatus(mockMismatchTermStudent, 2026);
    expect(result.isCurrentlyResident).toBe(true);
    expect(result.status).toBe("정규입사");
    expect(result.isExplicitlyTerminated).toBe(false);
  });

  it("[특수 건물명/BTL 확장] 포털 건물명이 생활관 또는 C동 등으로 와도 사생번호가 유효하면 정상 발급되어야 한다", () => {
    const mockSpecialBuildingStudent: DormitoryStudentInfo = {
      hasData: true,
      rawDatasets: {},
      studentId: "202662337",
      studentName: "글로벌학생",
      appliedYear: "2026",
      appliedSemester: "20",
      status: "01",
      dormitoryType: "",
      dormitoryBuilding: "생활관 C동",
      studentDormNo: "04201001",
      profile: {
        name: "글로벌학생",
        studentId: "202662337",
        year: "2026",
        term: "20",
        dormitoryType: "",
        dormitoryBuilding: "생활관 C동",
        studentDormNo: "04201001",
      },
      inOutList: [
        { year: "2026", term: "20", status: "01", studentDormNo: "04201001" },
      ],
    };

    const result = evaluateDormitoryResidentStatus(mockSpecialBuildingStudent, 2026);
    expect(result.isCurrentlyResident).toBe(true);
    expect(result.hasValidDormAssignment).toBe(true);
    expect(result.resolvedDormType).toBe("생활관 C동");
  });
});