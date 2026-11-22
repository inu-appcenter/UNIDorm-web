import { describe, expect, it } from "vitest";
import {
  DORMITORY_GUIDE_ITEMS,
  INTIP_STORE_LINKS,
  METACLUB_STORE_LINKS,
  filterGuideSections,
  getIframeGuideServiceById,
  resolveAppStoreUrl,
  resolveDormitoryFilter,
} from "../../../constants/dormitoryGuide";
import { PATHS } from "../../../constants/paths";

describe("dormitoryGuide - 기숙사 생활 안내 상수 및 유틸리티 검증", () => {
  describe("resolveDormitoryFilter", () => {
    it("1·2·3기숙사 문자열과 BTL 표기를 필터 값으로 정규화한다", () => {
      expect(resolveDormitoryFilter("1기숙사")).toBe("1기숙사");
      expect(resolveDormitoryFilter("제1기숙사")).toBe("1기숙사");
      expect(resolveDormitoryFilter(" 1기숙사 ")).toBe("1기숙사");
      expect(resolveDormitoryFilter("2기숙사")).toBe("2기숙사");
      expect(resolveDormitoryFilter("제2기숙사(BTL)")).toBe("2기숙사");
      expect(resolveDormitoryFilter("3기숙사")).toBe("3기숙사");
      expect(resolveDormitoryFilter("제3기숙사(BTL)")).toBe("3기숙사");
    });

    it("해당없음·빈 값·미매칭 문자열은 전체(all)를 반환한다", () => {
      expect(resolveDormitoryFilter("해당없음")).toBe("all");
      expect(resolveDormitoryFilter("")).toBe("all");
      expect(resolveDormitoryFilter(null)).toBe("all");
      expect(resolveDormitoryFilter(undefined)).toBe("all");
      expect(resolveDormitoryFilter("기숙사 미배정")).toBe("all");
    });
  });

  describe("filterGuideSections", () => {
    const flattenIds = (filter: Parameters<typeof filterGuideSections>[0]) =>
      filterGuideSections(filter).flatMap((section) =>
        section.items.map((item) => item.id),
      );

    it("전체 필터에서는 모든 기숙사 안내 항목과 빈 섹션 없는 카테고리를 반환한다", () => {
      const sections = filterGuideSections("all");
      expect(sections.every((s) => s.items.length > 0)).toBe(true);

      const ids = flattenIds("all");
      expect(ids).toHaveLength(DORMITORY_GUIDE_ITEMS.length);
      expect(ids).toContain("laundry-metaclub");
      expect(ids).toContain("laundry-dorm3");
      expect(ids).toContain("facility-dorm1");
      expect(ids).toContain("facility-dorm23");
      expect(ids).toContain("unidorm-complain");
      expect(ids).toContain("intip-menu");
      expect(ids).toContain("chatbuli");
    });

    it("1기숙사 필터에서는 메타클럽과 포털 시설 신청을 노출하고 2·3기숙사 전용 항목을 제외한다", () => {
      const ids = flattenIds("1기숙사");
      expect(ids).toContain("laundry-metaclub");
      expect(ids).toContain("facility-dorm1");
      expect(ids).toContain("unidorm-complain");
      expect(ids).toContain("chatbuli");

      expect(ids).not.toContain("laundry-dorm3");
      expect(ids).not.toContain("facility-dorm23");
      expect(ids).not.toContain("tel-dorm2");
      expect(ids).not.toContain("tel-dorm3");
    });

    it("2기숙사 필터에서는 메타클럽, 에듀맥 시설 신청, 2기숙사 관리사무실만 노출한다", () => {
      const ids = flattenIds("2기숙사");
      expect(ids).toContain("laundry-metaclub");
      expect(ids).toContain("facility-dorm23");
      expect(ids).toContain("tel-dorm2");
      expect(ids).toContain("unidorm-complain");

      expect(ids).not.toContain("laundry-dorm3");
      expect(ids).not.toContain("facility-dorm1");
      expect(ids).not.toContain("tel-dorm3");
    });

    it("3기숙사 필터에서는 앱 미지원 세탁실 안내, 에듀맥 시설 신청, 3기숙사 관리사무실을 노출한다", () => {
      const ids = flattenIds("3기숙사");
      expect(ids).toContain("laundry-dorm3");
      expect(ids).toContain("facility-dorm23");
      expect(ids).toContain("tel-dorm3");
      expect(ids).toContain("unidorm-complain");

      expect(ids).not.toContain("laundry-metaclub");
      expect(ids).not.toContain("facility-dorm1");
      expect(ids).not.toContain("tel-dorm2");
    });

    it("기타 생활 민원은 유니돔 민원 경로를, 챗불이는 aichat 타입을, INTIP 학식은 앱 링크를 가진다", () => {
      const complainItem = DORMITORY_GUIDE_ITEMS.find(
        (item) => item.id === "unidorm-complain",
      );
      expect(complainItem?.type).toBe("internal");
      expect(complainItem?.path).toBe(PATHS.COMPLAIN.ROOT);

      const chatItem = DORMITORY_GUIDE_ITEMS.find(
        (item) => item.id === "chatbuli",
      );
      expect(chatItem?.type).toBe("aichat");

      const intipItem = DORMITORY_GUIDE_ITEMS.find(
        (item) => item.id === "intip-menu",
      );
      expect(intipItem?.type).toBe("iframe");
      expect(intipItem?.url).toBe("https://intip.inuappcenter.kr/home/menu");
      expect(intipItem?.secondaryApp?.appLinks).toEqual(INTIP_STORE_LINKS);
    });
  });

  describe("getIframeGuideServiceById", () => {
    it("화이트리스트에 등록된 iframe 서비스 ID만 반환한다", () => {
      const allowedIds = [
        "intip-menu",
        "dorm-lecture",
        "dorm-rules",
        "dorm-facilities",
        "dorm-archive",
      ];

      for (const id of allowedIds) {
        const service = getIframeGuideServiceById(id);
        expect(service).not.toBeNull();
        expect(service?.type).toBe("iframe");
        expect(service?.url).toMatch(/^https:\/\//);
      }
    });

    it("iframe이 아닌 항목 ID나 임의의 URL·빈 문자열은 null을 반환한다", () => {
      expect(getIframeGuideServiceById("laundry-metaclub")).toBeNull();
      expect(getIframeGuideServiceById("facility-dorm1")).toBeNull();
      expect(getIframeGuideServiceById("dorm-home")).toBeNull();
      expect(getIframeGuideServiceById("chatbuli")).toBeNull();
      expect(getIframeGuideServiceById("unidorm-complain")).toBeNull();
      expect(getIframeGuideServiceById("https://evil.example")).toBeNull();
      expect(getIframeGuideServiceById("javascript:alert(1)")).toBeNull();
      expect(getIframeGuideServiceById("")).toBeNull();
      expect(getIframeGuideServiceById(null)).toBeNull();
      expect(getIframeGuideServiceById(undefined)).toBeNull();
    });
  });

  describe("resolveAppStoreUrl", () => {
    it("iOS 환경에서는 App Store URL을 반환하고 그 외에는 Google Play URL을 반환한다", () => {
      expect(resolveAppStoreUrl(METACLUB_STORE_LINKS, "ios_unidorm_app")).toBe(
        "https://apps.apple.com/kr/app/id6444430778",
      );
      expect(resolveAppStoreUrl(METACLUB_STORE_LINKS, "ios_browser")).toBe(
        "https://apps.apple.com/kr/app/id6444430778",
      );
      expect(
        resolveAppStoreUrl(METACLUB_STORE_LINKS, "android_unidorm_app"),
      ).toBe(
        "https://play.google.com/store/apps/details?id=com.fingerverse.metapoint",
      );
      expect(resolveAppStoreUrl(METACLUB_STORE_LINKS, "android_browser")).toBe(
        "https://play.google.com/store/apps/details?id=com.fingerverse.metapoint",
      );
      expect(resolveAppStoreUrl(METACLUB_STORE_LINKS, "other")).toBe(
        "https://play.google.com/store/apps/details?id=com.fingerverse.metapoint",
      );

      expect(resolveAppStoreUrl(INTIP_STORE_LINKS, "ios_browser")).toBe(
        "https://apps.apple.com/kr/app/id6740070975",
      );
      expect(resolveAppStoreUrl(INTIP_STORE_LINKS, "android_browser")).toBe(
        "https://play.google.com/store/apps/details?id=inu.appcenter.intip_android",
      );
    });
  });
});
