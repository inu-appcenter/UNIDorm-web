import { describe, it, expect, vi } from "vitest";
import useHeaderStore from "../../../../stores/useHeaderStore";

describe("Header - 모바일 사생증 헤더 상태 및 스토어 동작 검증", () => {
  it("useHeaderStore의 showDormitoryCard 초기값은 false여야 한다", () => {
    useHeaderStore.getState().resetHeader();
    const state = useHeaderStore.getState();
    expect(state.showDormitoryCard).toBe(false);
    expect(state.dormitoryCardOnClick).toBeNull();
  });

  it("setHeader 호출 시 showDormitoryCard와 dormitoryCardOnClick이 정상적으로 업데이트되어야 한다", () => {
    const mockHandler = vi.fn();
    useHeaderStore.getState().setHeader({
      showAlarm: true,
      showDormitoryCard: true,
      dormitoryCardOnClick: mockHandler,
    });

    const state = useHeaderStore.getState();
    expect(state.showAlarm).toBe(true);
    expect(state.showDormitoryCard).toBe(true);
    expect(state.dormitoryCardOnClick).toBe(mockHandler);
  });

  it("resetHeader 호출 시 showDormitoryCard가 false로 초기화되어야 한다", () => {
    useHeaderStore.getState().setHeader({
      showDormitoryCard: true,
    });
    useHeaderStore.getState().resetHeader();

    const state = useHeaderStore.getState();
    expect(state.showDormitoryCard).toBe(false);
    expect(state.dormitoryCardOnClick).toBeNull();
  });
});
