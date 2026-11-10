import { describe, expect, it } from "vitest";
import { adaptUserComplaintListResponse } from "../complain";
import { adaptAdminComplaintListResponse } from "../complainAdmin";

describe("민원 API 응답 어댑터 - 무중단 비동기 배포 안전성 검증", () => {
  const mockItem = {
    id: 21,
    date: "2026-10-27",
    type: "소음",
    title: "야간 소음 민원",
    status: "대기중",
    officer: null,
    building: null,
    floor: "3",
    roomNumber: "301",
    bedNumber: null,
    dormType: null,
    studentNumber: null,
  };

  describe("사용자 민원 어댑터 (adaptUserComplaintListResponse)", () => {
    it("시나리오 1: 신버전 서버 응답 ({ content, hasNext, nextCursor }) 정상 파싱", () => {
      const v2Response = {
        content: [mockItem],
        hasNext: true,
        nextCursor: 21,
      };

      const result = adaptUserComplaintListResponse(v2Response);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].id).toBe(21);
      expect(result.hasNext).toBe(true);
      expect(result.nextCursor).toBe(21);
    });

    it("시나리오 2: 구버전 서버 응답 (단순 배열) 폴백 처리", () => {
      const v1Response = [mockItem];

      const result = adaptUserComplaintListResponse(v1Response);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].id).toBe(21);
      expect(result.hasNext).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it("시나리오 3: 빈 데이터 및 null 수신 시 기본값 방어", () => {
      expect(adaptUserComplaintListResponse(null)).toEqual({
        content: [],
        hasNext: false,
        nextCursor: null,
      });

      expect(adaptUserComplaintListResponse({})).toEqual({
        content: [],
        hasNext: false,
        nextCursor: null,
      });
    });
  });

  describe("관리자 민원 어댑터 (adaptAdminComplaintListResponse)", () => {
    it("시나리오 1: 신버전 서버 응답 정상 파싱", () => {
      const v2Response = {
        content: [mockItem],
        hasNext: true,
        nextCursor: 21,
      };

      const result = adaptAdminComplaintListResponse(v2Response);

      expect(result.content).toHaveLength(1);
      expect(result.hasNext).toBe(true);
      expect(result.nextCursor).toBe(21);
    });

    it("시나리오 2: 구버전 서버 응답 (단순 배열) 폴백 처리", () => {
      const v1Response = [mockItem];

      const result = adaptAdminComplaintListResponse(v1Response);

      expect(result.content).toHaveLength(1);
      expect(result.hasNext).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });
});
