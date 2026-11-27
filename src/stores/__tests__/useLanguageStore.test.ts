import { beforeEach, describe, expect, it } from "vitest";
import i18n, { LANGUAGE_STORAGE_KEY } from "../../i18n";
import { useLanguageStore } from "../useLanguageStore";
import { safeLocalStorage } from "../../utils/safeStorage";

describe("useLanguageStore 및 i18n 연동 검증", () => {
  beforeEach(() => {
    safeLocalStorage.clear();
    useLanguageStore.getState().setLanguage("ko");
  });

  it("기본 언어는 ko이며 en으로 변경 시 storage와 i18n이 함께 갱신된다", () => {
    expect(useLanguageStore.getState().language).toBe("ko");
    expect(i18n.language).toBe("ko");

    useLanguageStore.getState().setLanguage("en");

    expect(useLanguageStore.getState().language).toBe("en");
    expect(safeLocalStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    expect(i18n.language).toBe("en");
    expect(i18n.t("onboarding:step1.cta")).toBe("Continue");
  });

  it("zh(중국어)와 vi(베트남어)로 변경 시 storage와 온보딩 리소스가 갱신된다", () => {
    useLanguageStore.getState().setLanguage("zh");
    expect(useLanguageStore.getState().language).toBe("zh");
    expect(safeLocalStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("zh");
    expect(i18n.language).toBe("zh");
    expect(i18n.t("onboarding:step1.cta")).toBe("继续");

    useLanguageStore.getState().setLanguage("vi");
    expect(useLanguageStore.getState().language).toBe("vi");
    expect(safeLocalStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("vi");
    expect(i18n.language).toBe("vi");
    expect(i18n.t("onboarding:step1.cta")).toBe("Tiếp tục");
  });

  it("ko로 되돌리면 온보딩 리소스도 한국어로 반환된다", () => {
    useLanguageStore.getState().setLanguage("en");
    useLanguageStore.getState().setLanguage("ko");

    expect(i18n.language).toBe("ko");
    expect(i18n.t("onboarding:step3.cta")).toBe("유니돔 시작하기");
  });
});
