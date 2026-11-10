import { describe, it, expect } from "vitest";
import { extractDormitoryFormAutoFill } from "../complainDormitoryAdapter";

describe("Complain Dormitory AutoFill Adapter", () => {
  it("실제 포털 ERP 원본 데이터(2기숙사 B동 03205052)를 완벽하게 민원 폼 규격으로 변환해야 한다", () => {
    const rawData = {
      rawFields: {
        dormGbn: "03",
        dormBdNm: "B동",
        dormBdCd: "2",
        domstuNo: "03205052",
      },
    };

    const result = extractDormitoryFormAutoFill(rawData);

    expect(result.dormitoryIndex).toBe(1); // 2기숙사
    expect(result.dormitoryBlockIndex).toBe(1); // B동
    expect(result.floor).toBe("5층");
    expect(result.room).toBe("5호");
    expect(result.bed).toBe("2번");
  });

  it("1기숙사 A동 4층 3호 1번 사생번호(01104031)를 정상 변환해야 한다", () => {
    const data = {
      rawFields: {
        dormGbn: "01",
        dormBdNm: "A동",
        dormBdCd: "1",
        domstuNo: "01104031",
      },
    };

    const result = extractDormitoryFormAutoFill(data);

    expect(result.dormitoryIndex).toBe(0); // 1기숙사
    expect(result.dormitoryBlockIndex).toBe(0); // A동
    expect(result.floor).toBe("4층");
    expect(result.room).toBe("3호");
    expect(result.bed).toBe("1번");
  });

  it("3기숙사 A동 12층 8호 2번 사생번호(05112082)를 정상 변환해야 한다", () => {
    const data = {
      rawFields: {
        dormGbn: "05",
        dormBdNm: "제3기숙사 A동",
        dormBdCd: "1",
        domstuNo: "05112082",
      },
    };

    const result = extractDormitoryFormAutoFill(data);

    expect(result.dormitoryIndex).toBe(2); // 3기숙사
    expect(result.dormitoryBlockIndex).toBe(0); // A동
    expect(result.floor).toBe("12층");
    expect(result.room).toBe("8호");
    expect(result.bed).toBe("2번");
  });

  it("하이픈 분리 사생번호(24-2-0402-A) 포맷도 정상 변환해야 한다", () => {
    const data = {
      dormitoryType: "제2기숙사",
      dormitoryBuilding: "B동",
      studentDormNo: "24-2-0402-A",
    };

    const result = extractDormitoryFormAutoFill(data);

    expect(result.dormitoryIndex).toBe(1); // 2기숙사
    expect(result.dormitoryBlockIndex).toBe(1); // B동
    expect(result.floor).toBe("4층");
    expect(result.room).toBe("2호");
    expect(result.bed).toBe("1번");
  });

  it("기숙사 층수 한도(2기숙사 B동은 최대 15층)를 벗어난 경우 비정상 값은 빈 문자열로 걸러내야 한다", () => {
    const data = {
      rawFields: {
        dormGbn: "03",
        dormBdNm: "B동",
        domstuNo: "03218052", // 18층 (2기숙사 B동 max는 15층)
      },
    };

    const result = extractDormitoryFormAutoFill(data);

    expect(result.dormitoryIndex).toBe(1);
    expect(result.dormitoryBlockIndex).toBe(1);
    expect(result.floor).toBe(""); // 한도 초과로 비워짐
    expect(result.room).toBe("5호");
    expect(result.bed).toBe("2번");
  });

  it("사생 정보가 null이거나 빈 객체인 경우 안전하게 빈 결과를 반환해야 한다", () => {
    const resultNull = extractDormitoryFormAutoFill(null);
    expect(resultNull.dormitoryIndex).toBeNull();
    expect(resultNull.dormitoryBlockIndex).toBeNull();
    expect(resultNull.floor).toBe("");
    expect(resultNull.room).toBe("");
    expect(resultNull.bed).toBe("");

    const resultEmpty = extractDormitoryFormAutoFill({});
    expect(resultEmpty.dormitoryIndex).toBeNull();
    expect(resultEmpty.dormitoryBlockIndex).toBeNull();
    expect(resultEmpty.floor).toBe("");
    expect(resultEmpty.room).toBe("");
    expect(resultEmpty.bed).toBe("");
  });
});
