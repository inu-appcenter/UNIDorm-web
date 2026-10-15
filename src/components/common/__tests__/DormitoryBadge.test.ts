import { describe, it, expect } from "vitest";
import { parseDormitoryKind } from "../DormitoryBadge";

describe("parseDormitoryKind", () => {
  it("1기숙사 계열 문자열을 올바르게 분류한다", () => {
    expect(parseDormitoryKind("1기숙사")).toBe("1기숙사");
    expect(parseDormitoryKind("제1기숙사")).toBe("1기숙사");
    expect(parseDormitoryKind("제1")).toBe("1기숙사");
  });

  it("2기숙사 계열 문자열(동, BTL 등)을 올바르게 분류한다", () => {
    expect(parseDormitoryKind("2기숙사")).toBe("2기숙사");
    expect(parseDormitoryKind("제2기숙사")).toBe("2기숙사");
    expect(parseDormitoryKind("제2기숙사 A동")).toBe("2기숙사");
    expect(parseDormitoryKind("제2기숙사 B동")).toBe("2기숙사");
    expect(parseDormitoryKind("제2기숙사(BTL)")).toBe("2기숙사");
    expect(parseDormitoryKind("02")).toBe("2기숙사");
    expect(parseDormitoryKind("03")).toBe("2기숙사");
  });

  it("3기숙사 계열 문자열을 올바르게 분류한다", () => {
    expect(parseDormitoryKind("3기숙사")).toBe("3기숙사");
    expect(parseDormitoryKind("제3기숙사")).toBe("3기숙사");
    expect(parseDormitoryKind("제3기숙사(BTL)")).toBe("3기숙사");
    expect(parseDormitoryKind("04")).toBe("3기숙사");
    expect(parseDormitoryKind("05")).toBe("3기숙사");
  });

  it("빈 값이나 매칭되지 않는 문자열은 other로 반환한다", () => {
    expect(parseDormitoryKind("")).toBe("other");
    expect(parseDormitoryKind(undefined)).toBe("other");
    expect(parseDormitoryKind("-")).toBe("other");
  });
});
