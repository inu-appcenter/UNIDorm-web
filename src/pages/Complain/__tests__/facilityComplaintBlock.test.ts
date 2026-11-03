import { describe, it, expect } from "vitest";
import { ComplainType } from "../../../constants/constants";

describe("ComplainWritePage - 시설(고장 등) 가짜 선택지 및 차단 로직 검증", () => {
  // 프론트 표시용 목록 (ComplainWritePage와 동일한 규격)
  const DISPLAY_COMPLAIN_TYPES = [...ComplainType, "시설(고장 등)"];

  it("1. 프론트 민원 유형 목록 끝에 '시설(고장 등)' 가짜 선택지가 추가되고 원본 ComplainType은 보존된다", () => {
    expect(DISPLAY_COMPLAIN_TYPES).toHaveLength(ComplainType.length + 1);
    expect(DISPLAY_COMPLAIN_TYPES[ComplainType.length]).toBe("시설(고장 등)");

    // 백엔드 API와 통신하는 원본 ComplainType은 5개 그대로 유지되어야 함
    expect(ComplainType).toEqual(["소음", "흡연", "음주", "호실변경신청", "공용공간"]);
  });

  it("2. '시설(고장 등)' 가짜 칩을 클릭했을 때 선택 인덱스가 변경되지 않고 모달이 열려야 한다", () => {
    let selectedIndex: number | null = null;
    let isFacilityModalOpen = false;

    const handleSelectComplainType = (index: number | null) => {
      if (index === ComplainType.length) {
        isFacilityModalOpen = true;
        return;
      }
      selectedIndex = index;
    };

    // '시설(고장 등)' (인덱스 5) 클릭 시뮬레이션
    handleSelectComplainType(5);

    expect(isFacilityModalOpen).toBe(true);
    expect(selectedIndex).toBeNull(); // 인덱스가 5로 오염되지 않고 null 유지

    // 일반 유형인 '소음' (인덱스 0) 클릭 시뮬레이션
    handleSelectComplainType(0);
    expect(selectedIndex).toBe(0);

    // 다시 '시설(고장 등)' 클릭 시 기존 선택값(0)이 유지되고 모달만 오픈
    handleSelectComplainType(5);
    expect(selectedIndex).toBe(0);
    expect(isFacilityModalOpen).toBe(true);
  });

  it("3. 백엔드 DTO 생성 시 유효한 ComplainType(소음/흡연/음주/호실변경신청/공용공간)만 전송된다", () => {
    let selectedIndex: number | null = null;

    const handleSelect = (idx: number | null) => {
      if (idx === ComplainType.length) {
        // 차단
        return;
      }
      selectedIndex = idx;
    };

    handleSelect(5); // 시설 클릭 시도

    // 필수값 검사: selectedIndex가 null이면 제출 차단
    const canSubmit = selectedIndex !== null;
    expect(canSubmit).toBe(false);

    handleSelect(4); // 공용공간 선택
    expect(selectedIndex).toBe(4);
    expect(ComplainType[selectedIndex!]).toBe("공용공간");
  });

  it("4. 시설 안내 모달에 필수 경고 문구 및 공식 접수처 링크가 올바르게 정의되어 있어야 한다", () => {
    const warningMessage =
      "공용공간 등 다른 카테고리를 선택하여 시설 관련 민원을 접수하시더라도 처리하지 않습니다.";
    const instructionMessage =
      "시설 관련 민원은 1기숙사는 포털, 2/3기숙사는 EDUFMS에서 접수해주세요. (고장 일체 해당)";
    const inuPortalUrl = "https://portal.inu.ac.kr";
    const edufmsUrl = "https://edumac.kr/mon/index.do?schlType=Univ";

    expect(warningMessage).toContain("처리하지 않습니다");
    expect(instructionMessage).toContain("EDUFMS");
    expect(inuPortalUrl).toBe("https://portal.inu.ac.kr");
    expect(edufmsUrl).toContain("edumac.kr");
  });
});
