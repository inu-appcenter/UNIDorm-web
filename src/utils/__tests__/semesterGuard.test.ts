import { describe, it, expect } from "vitest";
import {
  normalizeSemesterCode,
  isDormitorySemesterExpired,
  getCurrentAcademicCycleKey,
} from "../semesterGuard";

describe("semesterGuard (기숙사 학사일정 및 거주 기반 학기 만료 가드)", () => {
  describe("1. normalizeSemesterCode (학기 표현 정규화)", () => {
    it("1학기 변형 포맷들을 '10'으로 정확히 정규화한다", () => {
      expect(normalizeSemesterCode("10")).toBe("10");
      expect(normalizeSemesterCode(10)).toBe("10");
      expect(normalizeSemesterCode("1")).toBe("10");
      expect(normalizeSemesterCode(1)).toBe("10");
      expect(normalizeSemesterCode("1학기")).toBe("10");
      expect(normalizeSemesterCode("2026년 1학기")).toBe("10");
      expect(normalizeSemesterCode("FIRST")).toBe("10");
      expect(normalizeSemesterCode("first_semester")).toBe("10");
      expect(normalizeSemesterCode("  10  ")).toBe("10");
    });

    it("2학기 변형 포맷들을 '20'으로 정확히 정규화한다", () => {
      expect(normalizeSemesterCode("20")).toBe("20");
      expect(normalizeSemesterCode(20)).toBe("20");
      expect(normalizeSemesterCode("2")).toBe("20");
      expect(normalizeSemesterCode(2)).toBe("20");
      expect(normalizeSemesterCode("2학기")).toBe("20");
      expect(normalizeSemesterCode("SECOND")).toBe("20");
      expect(normalizeSemesterCode("second_semester")).toBe("20");
    });

    it("여름학기(계절) 변형 포맷들을 '30'으로 정확히 정규화한다", () => {
      expect(normalizeSemesterCode("30")).toBe("30");
      expect(normalizeSemesterCode(30)).toBe("30");
      expect(normalizeSemesterCode("3")).toBe("30");
      expect(normalizeSemesterCode(3)).toBe("30");
      expect(normalizeSemesterCode("여름학기")).toBe("30");
      expect(normalizeSemesterCode("여름")).toBe("30");
      expect(normalizeSemesterCode("SUMMER_VACATION")).toBe("30");
    });

    it("겨울학기(계절) 변형 포맷들을 '40'으로 정확히 정규화한다", () => {
      expect(normalizeSemesterCode("40")).toBe("40");
      expect(normalizeSemesterCode(40)).toBe("40");
      expect(normalizeSemesterCode("4")).toBe("40");
      expect(normalizeSemesterCode(4)).toBe("40");
      expect(normalizeSemesterCode("겨울학기")).toBe("40");
      expect(normalizeSemesterCode("겨울")).toBe("40");
      expect(normalizeSemesterCode("WINTER_VACATION")).toBe("40");
    });

    it("알 수 없는 이상 데이터나 빈 값은 null을 반환하여 안전 실패(Safe Fail) 처리한다", () => {
      expect(normalizeSemesterCode(null)).toBeNull();
      expect(normalizeSemesterCode(undefined)).toBeNull();
      expect(normalizeSemesterCode("")).toBeNull();
      expect(normalizeSemesterCode("   ")).toBeNull();
      expect(normalizeSemesterCode("알수없음")).toBeNull();
      expect(normalizeSemesterCode("SPECIAL_TERM")).toBeNull();
    });
  });

  describe("2. isDormitorySemesterExpired (학기 거주 유효기간 및 오잠금 방지 검증)", () => {
    // 2-1. 1학기 사생증 (당해 8월 25일까지 유효, 방학 연장 거주자 보호)
    it("1학기 사생증은 3월 학기 중 유효하다", () => {
      const expired = isDormitorySemesterExpired({
        dormYear: 2026,
        dormTerm: "10",
        currentDate: new Date("2026-03-15T12:00:00"),
      });
      expect(expired).toBe(false);
    });

    it("1학기 사생증은 룸메이트 여름모집 기간인 5월에도 절대 오잠금되지 않는다", () => {
      const expired = isDormitorySemesterExpired({
        dormYear: "2026",
        dormTerm: "1학기",
        currentDate: new Date("2026-05-10T09:00:00"),
      });
      expect(expired).toBe(false);
    });

    it("1학기 사생증은 6월 종강 시점에도 유효하다", () => {
      const expired = isDormitorySemesterExpired({
        dormYear: "2026",
        dormTerm: "FIRST",
        currentDate: new Date("2026-06-20T18:00:00"),
      });
      expect(expired).toBe(false);
    });

    it("1학기 사생증은 방학 연장(계속입사) 거주자를 위해 7월 및 8월 25일까지 정상 유효하다", () => {
      // 7월 방학 중
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "10",
          currentDate: new Date("2026-07-20T12:00:00"),
        })
      ).toBe(false);

      // 8월 25일 (마지막 날)
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "10",
          currentDate: new Date("2026-08-25T23:59:00"),
        })
      ).toBe(false);
    });

    it("1학기 사생증은 2학기 개강 시점인 8월 26일부터 정확하게 만료 잠금된다", () => {
      // 8월 26일
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "10",
          currentDate: new Date("2026-08-26T00:01:00"),
        })
      ).toBe(true);

      // 9월 1일 (2학기 개강)
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "10",
          currentDate: new Date("2026-09-01T10:00:00"),
        })
      ).toBe(true);
    });

    // 2-2. 여름학기 사생증 (단독 계절학기 입사자)
    it("여름학기 사생증은 7월과 8월 25일까지 정상 유효하다", () => {
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "30",
          currentDate: new Date("2026-07-10T12:00:00"),
        })
      ).toBe(false);

      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "여름학기",
          currentDate: new Date("2026-08-25T15:00:00"),
        })
      ).toBe(false);
    });

    it("여름학기 사생증은 8월 26일부터 2학기 시작으로 인해 만료 잠금된다", () => {
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "30",
          currentDate: new Date("2026-08-26T09:00:00"),
        })
      ).toBe(true);
    });

    // 2-3. 2학기 사생증 (익년 2월 20일까지 유효, 겨울방학 연장 거주자 보호)
    it("2학기 사생증은 9월, 11월, 12월 학기 중 정상 유효하다", () => {
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "20",
          currentDate: new Date("2026-09-10T12:00:00"),
        })
      ).toBe(false);

      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "2학기",
          currentDate: new Date("2026-11-20T12:00:00"),
        })
      ).toBe(false);
    });

    it("2학기 사생증은 겨울방학 연장 거주자를 위해 익년 1월 및 2월 20일까지 정상 유효하다", () => {
      // 익년 1월
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "20",
          currentDate: new Date("2027-01-15T12:00:00"),
        })
      ).toBe(false);

      // 익년 2월 20일
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "20",
          currentDate: new Date("2027-02-20T23:50:00"),
        })
      ).toBe(false);
    });

    it("2학기 사생증은 새 1학기 개강 시점인 익년 2월 21일부터 정확하게 만료 잠금된다", () => {
      // 2월 21일
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "20",
          currentDate: new Date("2027-02-21T08:00:00"),
        })
      ).toBe(true);

      // 3월 2일 (1학기 개강)
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "20",
          currentDate: new Date("2027-03-02T10:00:00"),
        })
      ).toBe(true);
    });

    // 2-4. 겨울학기 사생증 (단독 계절학기 입사자)
    it("겨울학기 사생증은 1월과 2월 20일까지 정상 유효하고 2월 21일부터 만료된다", () => {
      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "40",
          currentDate: new Date("2027-01-10T12:00:00"),
        })
      ).toBe(false);

      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: "겨울학기",
          currentDate: new Date("2027-02-21T09:00:00"),
        })
      ).toBe(true);
    });

    // 2-5. 과거 연도 및 이상값 Fail-Open 방어 검증
    it("2년 이상 지난 과거 연도 데이터는 무조건 만료 잠금된다", () => {
      expect(
        isDormitorySemesterExpired({
          dormYear: 2024,
          dormTerm: "10",
          currentDate: new Date("2026-03-01T12:00:00"),
        })
      ).toBe(true);
    });

    it("연도나 학기 정보가 누락되거나 비정상인 경우 안전 우선(Fail-Open)으로 사생증을 유지한다", () => {
      expect(
        isDormitorySemesterExpired({
          dormYear: null,
          dormTerm: "10",
        })
      ).toBe(false);

      expect(
        isDormitorySemesterExpired({
          dormYear: 2026,
          dormTerm: null,
        })
      ).toBe(false);

      expect(
        isDormitorySemesterExpired({
          dormYear: "INVALID",
          dormTerm: "INVALID",
        })
      ).toBe(false);
    });
  });

  describe("getCurrentAcademicCycleKey - 현재 날짜 기준 학기 주기 키 계산", () => {
    it("1월 1일부터 8월 25일까지는 1학기 주기 키(YYYY-10)를 반환한다", () => {
      expect(getCurrentAcademicCycleKey(new Date("2026-03-01T12:00:00"))).toBe("2026-10");
      expect(getCurrentAcademicCycleKey(new Date("2026-08-25T23:59:00"))).toBe("2026-10");
    });

    it("8월 26일부터 12월 31일까지는 2학기 주기 키(YYYY-20)를 반환한다", () => {
      expect(getCurrentAcademicCycleKey(new Date("2026-08-26T00:01:00"))).toBe("2026-20");
      expect(getCurrentAcademicCycleKey(new Date("2026-10-26T12:00:00"))).toBe("2026-20");
      expect(getCurrentAcademicCycleKey(new Date("2026-12-31T23:59:00"))).toBe("2026-20");
    });
  });
});
