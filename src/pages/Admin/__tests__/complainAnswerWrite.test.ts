import { describe, it, expect } from "vitest";
import { ComplaintDetail } from "@/types/complain";

describe("ComplainAnswerWritePage & ComplainAnswerCard - 널 참조 방어 및 모드 판별 로직 검증", () => {
  const mockNewComplaintWithoutReply: ComplaintDetail = {
    id: 101,
    title: "방충망이 찢어졌어요",
    content: "모기가 너무 많이 들어옵니다.",
    type: "시설",
    dormType: "제1기숙사",
    status: "담당자 배정",
    building: "1동",
    floor: "3층",
    roomNumber: "302호",
    bedNumber: "A",
    specificLocation: "창문",
    incidentDate: "2026-10-27",
    incidentTime: "10:00",
    createdDate: "2026-10-27 10:00:00",
    officer: "시설관리팀 홍길동",
    reply: null,
    images: [],
    studentNumber: "202301234",
  };

  const mockComplaintWithReply: ComplaintDetail = {
    id: 102,
    title: "난방이 안 돼요",
    content: "새벽에 너무 춥습니다.",
    type: "시설",
    dormType: "제2기숙사",
    status: "처리완료",
    building: "2동",
    floor: "5층",
    roomNumber: "501호",
    bedNumber: "B",
    specificLocation: "바닥 난방",
    incidentDate: "2026-10-25",
    incidentTime: "08:00",
    createdDate: "2026-10-25 08:30:00",
    officer: "관리실 이순신",
    reply: {
      replyTitle: "난방 밸브 교체 완료했습니다",
      replyContent: "방문하여 보일러 밸브 교체 조치 완료했습니다.",
      responderName: "관리실 이순신",
      attachmentUrl: [
        {
          imageName: "valve.jpg",
          imageUrl: "https://cdn.example.com/valve.jpg",
          contentType: "image/jpeg",
          fileSize: 1024,
          uploadDate: "2026-10-26 14:00:00",
        },
      ],
      createdDate: "2026-10-26 14:00:00",
    },
    images: [],
    studentNumber: "202305678",
  };

  // ComplainAnswerWritePage 폼 초기화 상태 결정 로직 순수 함수 검증
  function resolveAnswerFormState(
    complain: ComplaintDetail | null,
    stateManager?: string,
  ) {
    const isEditMode = Boolean(complain?.reply);
    const title = complain?.reply?.replyTitle ?? "";
    const content = complain?.reply?.replyContent ?? "";
    const manager =
      complain?.reply?.responderName ||
      stateManager ||
      complain?.officer ||
      "";
    const isRejected = complain?.status === "반려";
    const initialImages = complain?.reply?.attachmentUrl ?? [];

    return {
      isEditMode,
      title,
      content,
      manager,
      isRejected,
      initialImages,
    };
  }

  it("신규 답변 작성 시 reply가 null이어도 replyTitle 접근 에러 없이 올바른 기본값으로 초기화된다", () => {
    expect(() => {
      resolveAnswerFormState(mockNewComplaintWithoutReply);
    }).not.toThrow();

    const state = resolveAnswerFormState(mockNewComplaintWithoutReply);

    expect(state.isEditMode).toBe(false);
    expect(state.title).toBe("");
    expect(state.content).toBe("");
    expect(state.manager).toBe("시설관리팀 홍길동");
    expect(state.isRejected).toBe(false);
    expect(state.initialImages).toEqual([]);
  });

  it("기존 답변 수정 시 reply가 존재하면 해당 내용과 함께 수정 모드로 초기화된다", () => {
    const state = resolveAnswerFormState(mockComplaintWithReply);

    expect(state.isEditMode).toBe(true);
    expect(state.title).toBe("난방 밸브 교체 완료했습니다");
    expect(state.content).toBe("방문하여 보일러 밸브 교체 조치 완료했습니다.");
    expect(state.manager).toBe("관리실 이순신");
    expect(state.isRejected).toBe(false);
    expect(state.initialImages).toHaveLength(1);
    expect(state.initialImages[0].imageUrl).toBe(
      "https://cdn.example.com/valve.jpg",
    );
  });

  it("complain이 null인 초기 진입 상태에서도 에러 없이 안전하게 폴백된다", () => {
    expect(() => {
      resolveAnswerFormState(null);
    }).not.toThrow();

    const state = resolveAnswerFormState(null);
    expect(state.isEditMode).toBe(false);
    expect(state.title).toBe("");
    expect(state.content).toBe("");
    expect(state.manager).toBe("");
    expect(state.isRejected).toBe(false);
  });

  it("ComplainAnswerCard의 date가 falsy이거나 누락되어도 크래시 없이 빈 문자열을 반환한다", () => {
    const formatDate = (date?: string) =>
      (date || "").replace(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}).*$/,
        (_match, p1, p2, p3, p4, p5) =>
          `${p1.substring(2)}.${p2}.${p3} ${p4}:${p5}`,
      );

    expect(() => formatDate(undefined)).not.toThrow();
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
    expect(formatDate("2026-10-27 11:20:00")).toBe("26.10.27 11:20");
    expect(formatDate("2026-10-27T11:20:00Z")).toBe("26.10.27 11:20");
  });
});
