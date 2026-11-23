import { describe, expect, it } from "vitest";
import {
  FLOATING_SEARCH_BAR_CLEARANCE,
  FLOATING_SEARCH_BAR_Z_INDEX,
  normalizeSearchQuery,
  resolveFloatingSearchBarBottomOffset,
} from "../FloatingSearchBar";

describe("FloatingSearchBar - 하단 플로팅 검색바 유틸리티 검증", () => {
  it("FLOATING_SEARCH_BAR_Z_INDEX는 BottomBar(1000) 아래에 위치한다", () => {
    expect(FLOATING_SEARCH_BAR_Z_INDEX).toBe(990);
    expect(FLOATING_SEARCH_BAR_Z_INDEX).toBeLessThan(1000);
    expect(FLOATING_SEARCH_BAR_CLEARANCE).toBe("84px");
  });

  it("하단 탭바 유무와 사용자 지정 bottomOffset에 따라 하단 오프셋을 반환한다", () => {
    expect(resolveFloatingSearchBarBottomOffset({})).toBe("16px");
    expect(resolveFloatingSearchBarBottomOffset({ hasBottomBar: false })).toBe(
      "16px",
    );
    expect(resolveFloatingSearchBarBottomOffset({ hasBottomBar: true })).toBe(
      "86px",
    );
    expect(
      resolveFloatingSearchBarBottomOffset({
        hasBottomBar: true,
        bottomOffset: "28px",
      }),
    ).toBe("28px");
    expect(
      resolveFloatingSearchBarBottomOffset({
        hasBottomBar: false,
        bottomOffset: "   ",
      }),
    ).toBe("16px");
  });

  it("normalizeSearchQuery는 앞뒤 공백을 제거하고 빈 문자열을 처리한다", () => {
    expect(normalizeSearchQuery("  세탁기  ")).toBe("세탁기");
    expect(normalizeSearchQuery("   ")).toBe("");
    expect(normalizeSearchQuery("메타클럽")).toBe("메타클럽");
  });
});
