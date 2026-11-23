import { describe, expect, it } from "vitest";
import {
  extractChoseong,
  isChoseongOnly,
  tokenizeKoreanQuery,
} from "../koreanGuideSearch";
import { searchGuideItems } from "../../constants/dormitoryGuide";

describe("koreanGuideSearch - 자연어·초성·의도 기반 검색 검증", () => {
  describe("extractChoseong & isChoseongOnly", () => {
    it("한글 문자열에서 초성을 추출하고 영문·숫자는 유지한다", () => {
      expect(extractChoseong("세탁기")).toBe("ㅅㅌㄱ");
      expect(extractChoseong("학식 메뉴")).toBe("ㅎㅅ ㅁㄴ");
      expect(extractChoseong("INTIP 인팁")).toBe("intip ㅇㅌ");
    });

    it("한글 자음으로만 구성된 토큰인지 판별한다", () => {
      expect(isChoseongOnly("ㅅㅌㄱ")).toBe(true);
      expect(isChoseongOnly("ㅎㅅ")).toBe(true);
      expect(isChoseongOnly("세탁기")).toBe(false);
      expect(isChoseongOnly("intip")).toBe(false);
    });
  });

  describe("tokenizeKoreanQuery", () => {
    it("구두점과 조사를 정제하고 불용어를 걸러낸다", () => {
      expect(tokenizeKoreanQuery("오늘 저녁 뭐 나와요?")).toEqual([
        "저녁",
        "나와",
      ]);
      expect(tokenizeKoreanQuery("세탁기는 어디에 있어요?")).toEqual([
        "세탁기",
      ]);
      expect(tokenizeKoreanQuery("기숙사")).toEqual(["기숙사"]);
    });
  });

  describe("자연어·초성·의도 랭킹 시나리오", () => {
    it("식단 관련 자연어 질문에서 INTIP 학식 메뉴를 1위로 반환한다", () => {
      const results = searchGuideItems("all", "오늘 저녁 뭐 나와요?");
      expect(results[0]?.id).toBe("intip-menu");
    });

    it("시설 고장 자연어 질문에서 기숙사에 맞는 시설 고장 항목을 1위로 반환한다", () => {
      expect(searchGuideItems("1기숙사", "에어컨이 안 시원해")[0]?.id).toBe(
        "facility-dorm1",
      );
      expect(searchGuideItems("2기숙사", "에어컨이 안 시원해")[0]?.id).toBe(
        "facility-dorm23",
      );
      expect(searchGuideItems("3기숙사", "변기가 막혔어")[0]?.id).toBe(
        "facility-dorm23",
      );
    });

    it("출입·통금 관련 자연어 질문에서 생활 수칙을 1위로 반환한다", () => {
      const results = searchGuideItems("all", "새벽 3시에 들어가도 돼?");
      expect(results[0]?.id).toBe("dorm-rules");
    });

    it("세탁 관련 자연어 질문에서 기숙사별 세탁 항목을 1위로 반환한다", () => {
      expect(searchGuideItems("1기숙사", "빨래 돌리고 싶어")[0]?.id).toBe(
        "laundry-metaclub",
      );
      expect(searchGuideItems("3기숙사", "빨래 돌리고 싶어")[0]?.id).toBe(
        "laundry-dorm3",
      );
    });

    it("편의시설 위치 질문에서 편의시설 현황을 1위로 반환한다", () => {
      const results = searchGuideItems("all", "헬스장 몇층이야?");
      expect(results[0]?.id).toBe("dorm-facilities");
    });

    it("초성 검색에서도 관련 항목을 찾는다", () => {
      expect(searchGuideItems("1기숙사", "ㅅㅌㄱ")[0]?.id).toBe(
        "laundry-metaclub",
      );
      expect(searchGuideItems("all", "ㅎㅅ")[0]?.id).toBe("intip-menu");
      expect(searchGuideItems("all", "ㅌㄱ").map((item) => item.id)).toContain(
        "dorm-rules",
      );
    });

    it("관련 없는 문장은 빈 배열을 반환한다", () => {
      expect(searchGuideItems("all", "화성 여행 로켓")).toEqual([]);
    });
  });
});
