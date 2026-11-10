import {
  complainDormitory,
  dormitoryBlocks,
  dormStructure,
} from "@/constants/constants";
import type { DormitoryStudentInfo } from "./ssvParser";

export interface DormitoryFormAutoFill {
  dormitoryIndex: number | null;
  dormitoryBlockIndex: number | null;
  floor: string;
  room: string;
  bed: string;
}

/**
 * 모바일 사생증 또는 포털 ERP 사생 정보를 민원 작성 페이지(ComplainWritePage)의
 * 기숙사/동/층/호수/침대 선택 규격으로 변환하는 방어적 어댑터 함수입니다.
 */
export function extractDormitoryFormAutoFill(
  info?: DormitoryStudentInfo | Record<string, any> | null
): DormitoryFormAutoFill {
  const result: DormitoryFormAutoFill = {
    dormitoryIndex: null,
    dormitoryBlockIndex: null,
    floor: "",
    room: "",
    bed: "",
  };

  if (!info) return result;

  const raw = (info as any).rawFields || {};
  const profile = (info as any).profile || {};

  // 1. 원본 필드 취합 (우선순위: rawFields > profile > 최상위)
  const dormGbn = String(raw.dormGbn || profile.dormitoryType || (info as any).dormitoryType || "").trim();
  const dormBdNm = String(raw.dormBdNm || profile.dormitoryBuilding || (info as any).dormitoryBuilding || "").trim();
  const dormBdCd = String(raw.dormBdCd || "").trim();
  const studentDormNo = String(
    raw.domstuNo ||
    raw.domStuNo ||
    profile.studentDormNo ||
    (info as any).studentDormNo ||
    ""
  ).trim();

  const explicitRoomNumber = String(raw.roomNo || (info as any).roomNumber || "").trim();
  const explicitBedNumber = String(raw.bedNo || (info as any).bedNumber || "").trim();

  // 2. 기숙사 구분 식별 (complainDormitory: ["1기숙사", "2기숙사", "3기숙사"])
  let detectedDormIdx: number | null = null;
  if (dormGbn === "01" || dormGbn.includes("1기숙사") || dormBdNm.includes("1기숙사") || dormBdNm.includes("제1기숙사")) {
    detectedDormIdx = 0;
  } else if (
    dormGbn === "02" ||
    dormGbn === "03" ||
    dormGbn.includes("2기숙사") ||
    dormBdNm.includes("2기숙사") ||
    dormBdNm.includes("제2기숙사")
  ) {
    detectedDormIdx = 1;
  } else if (
    dormGbn === "04" ||
    dormGbn === "05" ||
    dormGbn.includes("3기숙사") ||
    dormBdNm.includes("3기숙사") ||
    dormBdNm.includes("제3기숙사")
  ) {
    detectedDormIdx = 2;
  } else if (/^\d{8}$/.test(studentDormNo)) {
    // 사생번호 앞 2자리 기반 폴백
    const prefix = studentDormNo.slice(0, 2);
    if (prefix === "01") detectedDormIdx = 0;
    else if (prefix === "02" || prefix === "03") detectedDormIdx = 1;
    else if (prefix === "04" || prefix === "05") detectedDormIdx = 2;
  }

  result.dormitoryIndex = detectedDormIdx;

  // 3. 동 구분 식별 (dormitoryBlocks: ["A동", "B동", "C동"])
  let detectedBlockIdx: number | null = null;
  if (dormBdNm.includes("A") || dormBdNm.includes("A동") || dormBdCd === "1") {
    detectedBlockIdx = 0;
  } else if (dormBdNm.includes("B") || dormBdNm.includes("B동") || dormBdCd === "2") {
    detectedBlockIdx = 1;
  } else if (dormBdNm.includes("C") || dormBdNm.includes("C동") || dormBdCd === "3") {
    detectedBlockIdx = 2;
  } else if (/^\d{8}$/.test(studentDormNo)) {
    // 8자리 사생번호 3번째 자리 폴백 (예: 03205052의 '2' -> B동)
    const blockCode = studentDormNo[2];
    if (blockCode === "1") detectedBlockIdx = 0;
    else if (blockCode === "2") detectedBlockIdx = 1;
    else if (blockCode === "3") detectedBlockIdx = 2;
  }

  result.dormitoryBlockIndex = detectedBlockIdx;

  // 4. 층, 호수, 침대번호 파싱
  let parsedFloorNum: number | null = null;
  let parsedRoomNum: number | null = null;
  let parsedBedNum: number | null = null;

  // 4-1. 8자리 표준 사생번호 (예: 03205052 -> 05층, 05호, 2번)
  if (/^\d{8}$/.test(studentDormNo)) {
    const fStr = studentDormNo.slice(3, 5);
    const rStr = studentDormNo.slice(5, 7);
    const bStr = studentDormNo.slice(7, 8);

    const fNum = parseInt(fStr, 10);
    const rNum = parseInt(rStr, 10);
    const bNum = parseInt(bStr, 10);

    if (!isNaN(fNum) && fNum > 0) parsedFloorNum = fNum;
    if (!isNaN(rNum) && rNum > 0) parsedRoomNum = rNum;
    if (!isNaN(bNum) && bNum > 0) parsedBedNum = bNum;
  }
  // 4-2. 하이픈 구분 사생번호 (예: 24-2-0402-A -> 4층, 2호, 1번)
  else if (/^\d{2}-\d-(\d{3,4})-([A-Za-z0-9])$/i.test(studentDormNo)) {
    const match = studentDormNo.match(/^\d{2}-\d-(\d{3,4})-([A-Za-z0-9])$/i);
    if (match) {
      const roomDigits = match[1];
      const bedChar = match[2].toUpperCase();

      if (roomDigits.length === 4) {
        parsedFloorNum = parseInt(roomDigits.slice(0, 2), 10);
        parsedRoomNum = parseInt(roomDigits.slice(2, 4), 10);
      } else if (roomDigits.length === 3) {
        parsedFloorNum = parseInt(roomDigits.slice(0, 1), 10);
        parsedRoomNum = parseInt(roomDigits.slice(1, 3), 10);
      }

      if (bedChar === "A" || bedChar === "1") parsedBedNum = 1;
      else if (bedChar === "B" || bedChar === "2") parsedBedNum = 2;
      else if (bedChar === "C" || bedChar === "3") parsedBedNum = 3;
      else if (bedChar === "D" || bedChar === "4") parsedBedNum = 4;
    }
  }

  // 4-3. 사생번호에서 추출하지 못했거나 명시적 호수/침대 필드가 있는 경우 보완
  if (explicitRoomNumber && (parsedFloorNum === null || parsedRoomNum === null)) {
    const numMatch = explicitRoomNumber.match(/\d+/);
    if (numMatch) {
      const fullRoomNum = parseInt(numMatch[0], 10);
      if (fullRoomNum >= 100) {
        parsedFloorNum = Math.floor(fullRoomNum / 100);
        parsedRoomNum = fullRoomNum % 100;
      }
    }
  }

  if (explicitBedNumber && parsedBedNum === null) {
    const cleanBed = explicitBedNumber.toUpperCase();
    if (cleanBed.includes("A") || cleanBed.includes("1")) parsedBedNum = 1;
    else if (cleanBed.includes("B") || cleanBed.includes("2")) parsedBedNum = 2;
    else if (cleanBed.includes("C") || cleanBed.includes("3")) parsedBedNum = 3;
    else if (cleanBed.includes("D") || cleanBed.includes("4")) parsedBedNum = 4;
  }

  // 5. dormStructure 기반 유효성 검증
  const dormName = detectedDormIdx !== null ? complainDormitory[detectedDormIdx] : null;
  const blockName = detectedBlockIdx !== null ? dormitoryBlocks[detectedBlockIdx] : null;

  // @ts-ignore
  const structureRules = dormName && blockName ? dormStructure[dormName]?.[blockName] : null;

  if (structureRules) {
    // 층수 검증
    if (
      parsedFloorNum !== null &&
      parsedFloorNum >= structureRules.floors.min &&
      parsedFloorNum <= structureRules.floors.max
    ) {
      result.floor = `${parsedFloorNum}층`;
    }

    // 호수 검증
    if (
      parsedRoomNum !== null &&
      parsedRoomNum >= 1 &&
      parsedRoomNum <= structureRules.rooms
    ) {
      result.room = `${parsedRoomNum}호`;
    }

    // 침대 번호 검증
    if (
      parsedBedNum !== null &&
      parsedBedNum >= 1 &&
      parsedBedNum <= structureRules.beds
    ) {
      result.bed = `${parsedBedNum}번`;
    }
  } else {
    // 구조 규칙이 없는 경우라도 최소한의 유효 숫자라면 포맷팅 부여
    if (parsedFloorNum !== null) result.floor = `${parsedFloorNum}층`;
    if (parsedRoomNum !== null) result.room = `${parsedRoomNum}호`;
    if (parsedBedNum !== null) result.bed = `${parsedBedNum}번`;
  }

  return result;
}

export type AutoFillStatus = "idle" | "success" | "not_found";

/**
 * 자동 완성 결과 상태에 따른 사용자 안내 문구를 반환합니다.
 */
export function getAutoFillNoticeMessage(
  status: AutoFillStatus,
  isEditMode?: boolean
): string | undefined {
  if (isEditMode) return undefined;
  if (status === "success") {
    return "사생증에 등록된 방 정보예요. 정보가 다르다면 직접 변경할 수 있어요.";
  }
  if (status === "not_found") {
    return "사생증 정보를 찾을 수 없어 직접 선택해주세요.";
  }
  return undefined;
}
