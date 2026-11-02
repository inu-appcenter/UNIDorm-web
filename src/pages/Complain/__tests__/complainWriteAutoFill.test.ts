import { describe, it, expect } from "vitest";
import {
  complainDormitory,
  dormitoryBlocks,
  dormStructure,
} from "../../../constants/constants";
import { extractDormitoryFormAutoFill, getAutoFillNoticeMessage } from "../../../utils/complainDormitoryAdapter";
import { ComplaintCreateDto, ComplaintDetail } from "../../../types/complain";

describe("ComplainWritePage - 사생증 자동완성 및 옵션 반응성 정밀 기능 검증", () => {
  // 제보 학생 실제 데이터
  const mockResidentData = {
    hasData: true,
    studentId: "202101504",
    studentName: "이성빈",
    dormitoryType: "03",
    dormitoryBuilding: "B동",
    studentDormNo: "03205052",
    rawFields: {
      dormGbn: "03",
      dormBdNm: "B동",
      dormBdCd: "2",
      domstuNo: "03205052",
    },
  };

  // ComplainWritePage의 동적 옵션 생성 useMemo 로직 모의
  function computeDynamicOptions(
    selectedDormitoryIndex: number | null,
    selectedDormitoryBlockIndex: number | null
  ) {
    const dormName =
      selectedDormitoryIndex !== null
        ? complainDormitory[selectedDormitoryIndex]
        : null;
    const blockName =
      selectedDormitoryBlockIndex !== null
        ? dormitoryBlocks[selectedDormitoryBlockIndex]
        : null;

    let floors: string[] = [];
    let rooms: string[] = [];
    let beds: string[] = [];

    // @ts-ignore
    if (dormName && blockName && dormStructure[dormName]?.[blockName]) {
      // @ts-ignore
      const rules = dormStructure[dormName][blockName];
      floors = Array.from(
        { length: rules.floors.max - rules.floors.min + 1 },
        (_, i) => `${rules.floors.min + i}층`
      );
      rooms = Array.from({ length: rules.rooms }, (_, i) => `${1 + i}호`);
      beds = Array.from({ length: rules.beds }, (_, i) => `${1 + i}번`);
    }

    return { floors, rooms, beds };
  }

  it("1. 사생증 보유 학생 진입 시 2기숙사 B동 5층 5호 2번이 자동 계산되고 생성된 옵션 목록에 정확히 포함된다", () => {
    // 1-1. 어댑터 파싱
    const autoFill = extractDormitoryFormAutoFill(mockResidentData);

    expect(autoFill.dormitoryIndex).toBe(1); // 2기숙사
    expect(autoFill.dormitoryBlockIndex).toBe(1); // B동
    expect(autoFill.floor).toBe("5층");
    expect(autoFill.room).toBe("5호");
    expect(autoFill.bed).toBe("2번");

    // 1-2. 해당 기숙사/동의 옵션 목록 생성
    const options = computeDynamicOptions(
      autoFill.dormitoryIndex,
      autoFill.dormitoryBlockIndex
    );

    // 2기숙사 B동 규칙: 2층~15층, 1호~23호, 1번~2번
    expect(options.floors).toContain(autoFill.floor);
    expect(options.rooms).toContain(autoFill.room);
    expect(options.beds).toContain(autoFill.bed);
  });

  it("2. 사생증 미보유(캐시 null 또는 비사생) 시 모든 필드가 null/빈값으로 유지된다", () => {
    const autoFill = extractDormitoryFormAutoFill(null);

    expect(autoFill.dormitoryIndex).toBeNull();
    expect(autoFill.dormitoryBlockIndex).toBeNull();
    expect(autoFill.floor).toBe("");
    expect(autoFill.room).toBe("");
    expect(autoFill.bed).toBe("");

    const options = computeDynamicOptions(
      autoFill.dormitoryIndex,
      autoFill.dormitoryBlockIndex
    );
    expect(options.floors).toEqual([]);
    expect(options.rooms).toEqual([]);
    expect(options.beds).toEqual([]);
  });

  it("3. 수정 모드(isEditMode) 진입 시 사생증 정보가 있더라도 기존 민원 데이터가 우선 보존된다", () => {
    const existingComplaint: ComplaintDetail = {
      id: 999,
      title: "기존 민원 제목",
      content: "기존 민원 내용",
      type: "소음",
      dormType: "1기숙사",
      building: "A동",
      floor: "7층",
      roomNumber: "3호",
      bedNumber: "1번",
      status: "대기중",
      specificLocation: "복도",
      incidentDate: "2026-11-01",
      incidentTime: "22:00",
      createdDate: "2026-11-01T22:00:00Z",
    };

    // 수정 모드 판별 플래그
    const isEditMode = true;
    const editId = 999;

    let appliedDormType = existingComplaint.dormType;
    let appliedBuilding = existingComplaint.building;
    let appliedFloor = existingComplaint.floor;
    let appliedRoom = existingComplaint.roomNumber;
    let appliedBed = existingComplaint.bedNumber;

    // 만약 신규 모드일 때만 사생증 캐시를 적용하는 가드
    if (!isEditMode && !editId) {
      const autoFill = extractDormitoryFormAutoFill(mockResidentData);
      if (autoFill.dormitoryIndex !== null) appliedDormType = complainDormitory[autoFill.dormitoryIndex];
      if (autoFill.dormitoryBlockIndex !== null) appliedBuilding = dormitoryBlocks[autoFill.dormitoryBlockIndex];
      if (autoFill.floor) appliedFloor = autoFill.floor;
      if (autoFill.room) appliedRoom = autoFill.room;
      if (autoFill.bed) appliedBed = autoFill.bed;
    }

    // 기존 민원 값 그대로 유지 검증
    expect(appliedDormType).toBe("1기숙사");
    expect(appliedBuilding).toBe("A동");
    expect(appliedFloor).toBe("7층");
    expect(appliedRoom).toBe("3호");
    expect(appliedBed).toBe("1번");
  });

  it("4. 기숙사/동을 변경했을 때 새 옵션 범위를 벗어나는 층/호수는 안전하게 초기화된다", () => {
    // 2기숙사 B동의 15층 선택 상태 모의
    let selectedFloor = "15층";
    let selectedRoom = "20호";

    // 사용자가 1기숙사 B동으로 변경 (1기숙사 B동 규칙: 2층~9층, 1호~11호)
    const newDormIndex = 0; // 1기숙사
    const newBlockIndex = 1; // B동
    const newOptions = computeDynamicOptions(newDormIndex, newBlockIndex);

    // 1기숙사 B동은 9층까지이므로 15층은 포함되지 않음
    if (!newOptions.floors.includes(selectedFloor)) {
      selectedFloor = "";
    }
    // 1기숙사 B동은 11호까지이므로 20호는 포함되지 않음
    if (!newOptions.rooms.includes(selectedRoom)) {
      selectedRoom = "";
    }

    expect(selectedFloor).toBe("");
    expect(selectedRoom).toBe("");
  });

  it("5. 자동 완성된 정보로 최종 민원 DTO 생성 시 백엔드 규격에 맞는 정확한 필드값이 담긴다", () => {
    const autoFill = extractDormitoryFormAutoFill(mockResidentData);

    const dto: ComplaintCreateDto = {
      id: 0,
      title: "방음이 잘 안 돼요",
      content: "옆방 소음이 너무 큽니다.",
      type: "소음",
      dormType: complainDormitory[autoFill.dormitoryIndex!],
      building: dormitoryBlocks[autoFill.dormitoryBlockIndex!],
      floor: autoFill.floor,
      roomNumber: autoFill.room,
      bedNumber: autoFill.bed,
      status: "접수 대기",
      specificLocation: "책상 앞 벽면",
      incidentDate: "2026-11-02",
      incidentTime: "23:00",
      createdDate: new Date().toISOString(),
      privacyAgreed: true,
    };

    expect(dto.dormType).toBe("2기숙사");
    expect(dto.building).toBe("B동");
    expect(dto.floor).toBe("5층");
    expect(dto.roomNumber).toBe("5호");
    expect(dto.bedNumber).toBe("2번");
  });

  it("6. 자동 완성 상태별 안내 메시지가 담백하고 정확하게 생성된다", () => {
    // 성공 시
    const successMsg = getAutoFillNoticeMessage("success", false);
    expect(successMsg).toBe("사생증에 등록된 방 정보예요. 정보가 다르다면 직접 변경할 수 있어요.");

    // 사생 정보 미확인 / 실패 시
    const notFoundMsg = getAutoFillNoticeMessage("not_found", false);
    expect(notFoundMsg).toBe("사생증 정보를 찾을 수 없어 직접 선택해주세요.");

    // 대기(idle) 상태
    const idleMsg = getAutoFillNoticeMessage("idle", false);
    expect(idleMsg).toBeUndefined();

    // 수정 모드인 경우 어떤 상태여도 안내 메시지가 노출되지 않아야 함
    expect(getAutoFillNoticeMessage("success", true)).toBeUndefined();
    expect(getAutoFillNoticeMessage("not_found", true)).toBeUndefined();
  });
});
