import { describe, it, expect } from "vitest";
import { resolveFormSubmittedState, statusText } from "../formUtils";

describe("formUtils", () => {
  describe("resolveFormSubmittedState (제출 여부 판별 및 앱 멀티 웹뷰 폴백)", () => {
    it("라우터 state에 명시적인 boolean 값이 있으면 해당 값을 우선 적용한다", () => {
      expect(resolveFormSubmittedState(true, undefined)).toBe(true);
      expect(resolveFormSubmittedState(false, undefined)).toBe(false);
      expect(resolveFormSubmittedState(true, false)).toBe(true);
      expect(resolveFormSubmittedState(false, true)).toBe(false);
    });

    it("앱 멀티 웹뷰 진입 등으로 state가 undefined인 경우 서버 API 응답(apiHasSubmitted)으로 폴백한다", () => {
      expect(resolveFormSubmittedState(undefined, true)).toBe(true);
      expect(resolveFormSubmittedState(undefined, false)).toBe(false);
    });

    it("state가 null이나 객체 등 유효하지 않은 타입인 경우에도 서버 API 응답으로 안전하게 폴백한다", () => {
      expect(resolveFormSubmittedState(null, true)).toBe(true);
      expect(resolveFormSubmittedState({}, true)).toBe(true);
      expect(resolveFormSubmittedState("invalid", false)).toBe(false);
    });

    it("state와 서버 데이터가 모두 없는 초기 로딩 상태에서는 false를 기본값으로 반환한다", () => {
      expect(resolveFormSubmittedState(undefined, undefined)).toBe(false);
      expect(resolveFormSubmittedState(null, undefined)).toBe(false);
    });
  });

  describe("statusText (설문 상태 표시 텍스트 변환)", () => {
    it("상태 코드에 맞춰 사용자 친화적인 텍스트를 반환한다", () => {
      expect(statusText("진행전")).toBe("진행 전");
      expect(statusText("진행중")).toBe("진행 중");
      expect(statusText("마감")).toBe("마감");
      expect(statusText("기타")).toBe("진행 전");
    });
  });
});
