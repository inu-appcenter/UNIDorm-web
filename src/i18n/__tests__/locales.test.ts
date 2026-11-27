import { describe, expect, it } from "vitest";
import { resources, SUPPORTED_LANGUAGES } from "../index";

function collectLeafKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") {
    return prefix ? [prefix] : [];
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item, idx) =>
      collectLeafKeys(item, `${prefix}[${idx}]`),
    );
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(
    ([key, value]) =>
      collectLeafKeys(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe("i18n 로케일 리소스 키 일관성 검증", () => {
  const namespaces = Object.keys(resources.ko) as Array<
    keyof typeof resources.ko
  >;

  it("모든 지원 언어가 동일한 네임스페이스 목록을 가진다", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(Object.keys(resources[lang]).sort()).toEqual(
        [...namespaces].sort(),
      );
    }
  });

  it("모든 네임스페이스에서 ko 기준 번역 키가 en, zh, vi에 누락 없이 존재한다", () => {
    for (const ns of namespaces) {
      const baseKeys = collectLeafKeys(resources.ko[ns]).sort();
      for (const lang of SUPPORTED_LANGUAGES) {
        const targetKeys = collectLeafKeys(resources[lang][ns]).sort();
        expect(
          targetKeys,
          `[${lang}/${String(ns)}] 키가 기준(ko)과 다릅니다`,
        ).toEqual(baseKeys);
      }
    }
  });
});
