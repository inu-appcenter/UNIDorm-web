import { describe, it, expect } from "vitest";
import { resolveHomeDormitoryCardDisplay } from "../HomeDormitoryCardButton";

describe("HomeDormitoryCardButton - resolveHomeDormitoryCardDisplay 상태별 텍스트 검증", () => {
  it("비로그인 상태일 때는 기본 출입 안내 문구와 '열기' 액션이 반환되어야 한다", () => {
    const result = resolveHomeDormitoryCardDisplay({
      isLoggedIn: false,
    });

    expect(result.subtitle).toBe("스마트폰으로 기숙사 출입하기");
    expect(result.title).toBe("모바일 사생증");
    expect(result.actionText).toBe("열기");
  });

  it("로그인되어 있으나 사생증 미발급인 상태일 때는 발급 안내 문구와 '발급하기' 액션이 반환되어야 한다", () => {
    const result = resolveHomeDormitoryCardDisplay({
      isLoggedIn: true,
      isIssued: false,
      isExpired: false,
    });

    expect(result.subtitle).toBe("스마트폰으로 기숙사 출입하기");
    expect(result.title).toBe("모바일 사생증 발급받기");
    expect(result.actionText).toBe("발급하기");
  });

  it("로그인 및 발급 완료 상태(건물명과 호실이 있는 경우)에는 기숙사 정보와 사생명 출입 안내가 표시되어야 한다", () => {
    const result = resolveHomeDormitoryCardDisplay({
      isLoggedIn: true,
      isIssued: true,
      isExpired: false,
      buildingName: "제2기숙사 B동",
      roomNumber: "402호",
      studentName: "김유니",
    });

    expect(result.subtitle).toBe("제2기숙사 B동 402호");
    expect(result.title).toBe("김유니 사생님 출입하기");
    expect(result.actionText).toBe("출입하기");
  });

  it("발급 완료 상태이지만 사생명이 없는 경우 일반 사생증 출입하기 문구로 대체되어야 한다", () => {
    const result = resolveHomeDormitoryCardDisplay({
      isLoggedIn: true,
      isIssued: true,
      isExpired: false,
      buildingName: "제1기숙사",
      roomNumber: null,
      studentName: null,
    });

    expect(result.subtitle).toBe("제1기숙사");
    expect(result.title).toBe("모바일 사생증 출입하기");
    expect(result.actionText).toBe("출입하기");
  });

  it("발급 완료 상태이지만 건물/호실 정보가 없는 경우 '생활원 거주 중'으로 대체되어야 한다", () => {
    const result = resolveHomeDormitoryCardDisplay({
      isLoggedIn: true,
      isIssued: true,
      isExpired: false,
      buildingName: null,
      roomNumber: null,
      studentName: "홍길동",
    });

    expect(result.subtitle).toBe("생활원 거주 중");
    expect(result.title).toBe("홍길동 사생님 출입하기");
    expect(result.actionText).toBe("출입하기");
  });

  it("학기가 만료된 상태일 때는 사생증 갱신 안내 문구와 '갱신하기' 액션이 반환되어야 한다", () => {
    const result = resolveHomeDormitoryCardDisplay({
      isLoggedIn: true,
      isIssued: true,
      isExpired: true,
      buildingName: "제2기숙사",
      studentName: "김유니",
    });

    expect(result.subtitle).toBe("이용 기간 만료");
    expect(result.title).toBe("새 학기 사생증 갱신하기");
    expect(result.actionText).toBe("갱신하기");
  });
});
