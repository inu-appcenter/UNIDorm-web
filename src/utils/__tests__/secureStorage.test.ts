import { describe, it, expect, beforeEach } from "vitest";
import { secureStorage } from "../secureStorage";
import { safeLocalStorage } from "../safeStorage";

describe("secureStorage", () => {
  beforeEach(() => {
    safeLocalStorage.clear();
  });

  it("데이터를 안전하게 암호화(v2)하여 저장하고 복호화한다", async () => {
    const testData = { studentId: "202612345", name: "홍길동", room: "301호" };
    await secureStorage.setItem("test_key", testData);

    const rawStored = safeLocalStorage.getItem("test_key");
    expect(rawStored).toBeTruthy();
    expect(rawStored?.startsWith("enc:v2:")).toBe(true);

    const restored = await secureStorage.getItem("test_key");
    expect(restored).toEqual(testData);
  });

  it("평문 레거시 데이터가 있을 경우 정상 복호화하고 v2로 자동 마이그레이션한다", async () => {
    const legacyPlain = { studentId: "202611111", legacy: true };
    safeLocalStorage.setItem("legacy_key", JSON.stringify(legacyPlain));

    const restored = await secureStorage.getItem("legacy_key");
    expect(restored).toEqual(legacyPlain);

    // 마이그레이션 확인 (비동기 처리 후 enc:v2:로 재암호화됨)
    await new Promise((r) => setTimeout(r, 50));
    const rawAfter = safeLocalStorage.getItem("legacy_key");
    expect(rawAfter?.startsWith("enc:v2:")).toBe(true);
  });

  it("TTL 메타데이터가 포함된 캐시를 저장하고 만료 여부를 판별한다", async () => {
    const data = { dorm: "제2기숙사", room: "405" };
    // 만료 시간 1초 후
    await secureStorage.setCacheWithTtl("dorm_cache", data, 1000);

    const envelope = await secureStorage.getCacheWithTtl("dorm_cache");
    expect(envelope).not.toBeNull();
    expect(envelope?.data).toEqual(data);
    expect(envelope?.isExpired).toBe(false);
    expect(envelope?.expireAt).toBeGreaterThan(Date.now() - 100);

    // 만료된 캐시 시뮬레이션
    await secureStorage.setCacheWithTtl("expired_cache", data, -1000);
    const expiredEnvelope = await secureStorage.getCacheWithTtl("expired_cache");
    expect(expiredEnvelope?.isExpired).toBe(true);
    expect(expiredEnvelope?.data).toEqual(data);
  });

  it("clearAllPortalCaches 호출 시 모든 포털 관련 캐시가 소거된다", async () => {
    await secureStorage.setItem("portal_dormitory_student_info", { a: 1 });
    await secureStorage.setItem("portal_student_info", { b: 2 });
    safeLocalStorage.setItem("portal_student_id", "202612345");
    await secureStorage.setItem("other_key", { retain: true });

    secureStorage.clearAllPortalCaches();

    expect(await secureStorage.getItem("portal_dormitory_student_info")).toBeNull();
    expect(await secureStorage.getItem("portal_student_info")).toBeNull();
    expect(safeLocalStorage.getItem("portal_student_id")).toBeNull();
    expect(await secureStorage.getItem("other_key")).not.toBeNull();
  });
});
