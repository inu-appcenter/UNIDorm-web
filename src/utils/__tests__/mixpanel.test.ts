import { describe, it, expect, vi, beforeEach } from "vitest";

// mixpanel-browser 모킹
vi.mock("mixpanel-browser", () => ({
  default: {
    init: vi.fn(),
    register: vi.fn(),
    track: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    people: {
      set: vi.fn(),
    },
  },
}));

import mixpanel from "mixpanel-browser";
import { mixpanelTrack } from "../mixpanel";

describe("Mixpanel - 모바일 사생증 트래킹 및 개인정보(PII) 배제 검증", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("사생증 진입 클릭 이벤트가 올바른 위치 속성과 함께 전송되어야 한다", () => {
    mixpanelTrack.dormitoryCardEntryClicked("홈");
    expect(mixpanel.track).toHaveBeenCalledWith("모바일 사생증 진입 클릭", {
      location: "홈",
    });

    mixpanelTrack.dormitoryCardEntryClicked("사생정보조회");
    expect(mixpanel.track).toHaveBeenCalledWith("모바일 사생증 진입 클릭", {
      location: "사생정보조회",
    });
  });

  it("사생증 페이지 뷰 이벤트가 정상 전송되어야 한다", () => {
    mixpanelTrack.dormitoryCardPageViewed();
    expect(mixpanel.track).toHaveBeenCalledWith("페이지 조회", {
      page_name: "모바일 사생증",
    });
  });

  it("사생증 발급 성공 시 기숙사 구분/학기만 포함되고 학생 개인식별정보(PII)는 절대 포함되지 않아야 한다", () => {
    mixpanelTrack.dormitoryCardIssueSuccess({
      dormitoryType: "제2기숙사(BTL)",
      year: "2026",
      term: "20",
    });

    expect(mixpanel.track).toHaveBeenCalledWith("모바일 사생증 발급 성공", {
      dormitory_type: "제2기숙사(BTL)",
      year: "2026",
      term: "20",
    });

    // PII 배제 단언 (개인식별정보 키가 절대 포함되지 않아야 함)
    const trackedProps = (mixpanel.track as any).mock.calls[0][1];
    expect(trackedProps).not.toHaveProperty("studentId");
    expect(trackedProps).not.toHaveProperty("student_id");
    expect(trackedProps).not.toHaveProperty("studentName");
    expect(trackedProps).not.toHaveProperty("student_name");
    expect(trackedProps).not.toHaveProperty("name");
    expect(trackedProps).not.toHaveProperty("roomNumber");
    expect(trackedProps).not.toHaveProperty("room_number");
    expect(trackedProps).not.toHaveProperty("bedNumber");
    expect(trackedProps).not.toHaveProperty("bed_number");
    expect(trackedProps).not.toHaveProperty("studentDormNo");
    expect(trackedProps).not.toHaveProperty("student_dorm_no");
    expect(trackedProps).not.toHaveProperty("phone");
    expect(trackedProps).not.toHaveProperty("address");
  });

  it("비사생 차단 노출 이벤트가 사유와 함께 전송되고 PII가 없어야 한다", () => {
    mixpanelTrack.dormitoryCardNonResidentBlocked({ reason: "미배정" });
    expect(mixpanel.track).toHaveBeenCalledWith("모바일 사생증 비사생 노출", {
      reason: "미배정",
    });

    const trackedProps = (mixpanel.track as any).mock.calls[0][1];
    expect(trackedProps).not.toHaveProperty("studentId");
    expect(trackedProps).not.toHaveProperty("name");
  });

  it("포털 연동 온보딩 노출 이벤트가 정상 전송되어야 한다", () => {
    mixpanelTrack.dormitoryCardOnboardingViewed();
    expect(mixpanel.track).toHaveBeenCalledWith("모바일 사생증 연동 온보딩 노출", undefined);
  });

  it("화면 내 부가 액션 버튼 클릭 이벤트가 정상 전송되어야 한다", () => {
    mixpanelTrack.dormitoryCardInfoButtonClicked("사생증화면");
    expect(mixpanel.track).toHaveBeenCalledWith("모바일 사생증 사생정보조회 클릭", {
      location: "사생증화면",
    });

    mixpanelTrack.dormitoryCardNonResidentHomeClicked();
    expect(mixpanel.track).toHaveBeenCalledWith("모바일 사생증 홈으로 클릭", undefined);
  });

  it("동기화 시작, 성공, 실패 이벤트가 PII 없이 안전하게 전송되어야 한다", () => {
    // 1) 동기화 시작
    mixpanelTrack.dormitoryCardSyncStarted("saved_account");
    expect(mixpanel.track).toHaveBeenCalledWith("모바일 사생증 동기화 시작", {
      sync_type: "saved_account",
    });

    // 2) 동기화 성공
    mixpanelTrack.dormitoryCardSyncSuccess({
      durationMs: 1250,
      hasPhoto: true,
      hasDormInfo: true,
    });
    expect(mixpanel.track).toHaveBeenCalledWith("모바일 사생증 동기화 성공", {
      duration_ms: 1250,
      has_photo: true,
      has_dorm_info: true,
    });

    // 3) 동기화 실패
    mixpanelTrack.dormitoryCardSyncFailed({
      stage: "DORM_FETCH",
      errorCode: "TIMEOUT",
      errorMessage: "요청 시간이 초과되었습니다.",
      durationMs: 15000,
    });
    expect(mixpanel.track).toHaveBeenCalledWith("모바일 사생증 동기화 실패", {
      stage: "DORM_FETCH",
      error_code: "TIMEOUT",
      error_message: "요청 시간이 초과되었습니다.",
      duration_ms: 15000,
    });
  });

  it("네이티브 브릿지 에러 이벤트가 액션 타입과 에러 정보를 포함해 정상 전송되어야 한다", () => {
    mixpanelTrack.nativeBridgeError({
      actionType: "executeAgentAction",
      errorCode: "EXECUTION_ERROR",
      errorMessage: "포털 서버 응답 없음",
    });
    expect(mixpanel.track).toHaveBeenCalledWith("네이티브 브릿지 에러", {
      action_type: "executeAgentAction",
      error_code: "EXECUTION_ERROR",
      error_message: "포털 서버 응답 없음",
    });
  });
});
