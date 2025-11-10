// 📄 components/complain/ComplainFilter.tsx

import styled from "styled-components";
import FormField from "./FormField.tsx";
import SelectableChipGroup from "../roommate/checklist/SelectableChipGroup.tsx";
import {
  complainDormitory,
  complainStatus,
  ComplainType,
  dormitoryBlocks,
} from "../../constants/constants.ts"; // 'as const'로 선언된 상수들
import { Dropdown, DropdownContainer, Input } from "../../styles/common.ts";
import { ComplaintSearchDto } from "../../types/complain.ts";
import { useEffect, useState } from "react"; // ⭐ useState, useEffect 추가

// --- 1. 타입 정의 추가 (ComplainWritePage와 동일) ---
type DormName = (typeof complainDormitory)[number];
type BlockName = (typeof dormitoryBlocks)[number];

type DormRules = {
  floors: { min: number; max: number };
  rooms: number;
  beds: number;
};

// --- 2. dormStructure 정의 (ComplainWritePage와 동일) ---
const dormStructure: Record<DormName, Partial<Record<BlockName, DormRules>>> = {
  "1기숙사": {
    A동: { floors: { min: 3, max: 13 }, rooms: 10, beds: 3 },
    B동: { floors: { min: 2, max: 9 }, rooms: 11, beds: 3 },
    C동: { floors: { min: 2, max: 9 }, rooms: 11, beds: 3 },
  },
  "2기숙사": {
    A동: { floors: { min: 2, max: 11 }, rooms: 33, beds: 2 },
    B동: { floors: { min: 2, max: 15 }, rooms: 23, beds: 2 },
  },
  "3기숙사": {
    A동: { floors: { min: 2, max: 12 }, rooms: 28, beds: 2 },
    B동: { floors: { min: 2, max: 12 }, rooms: 23, beds: 2 },
  },
};

// --- 3. 헬퍼 함수 정의 (ComplainWritePage와 동일) ---
const generateOptions = (min: number, max: number, suffix: string) => {
  return Array.from({ length: max - min + 1 }, (_, i) => `${min + i}${suffix}`);
};

// ⭐ 부모로부터 받을 Props 타입 정의
interface ComplainFilterProps {
  // 각 필드의 현재 값
  dormitoryIndex: number | null;
  typeIndex: number | null;
  statusIndex: number | null;
  blockIndex: number | null;
  manager: string;
  floor: string;
  room: string;
  bed: string;

  // 각 필드의 값을 변경하는 함수
  onDormitoryChange: (index: number | null) => void;
  onTypeChange: (index: number | null) => void;
  onStatusChange: (index: number | null) => void;
  onBlockChange: (index: number | null) => void;
  onManagerChange: (value: string) => void;
  onFloorChange: (value: string) => void;
  onRoomChange: (value: string) => void;
  onBedChange: (value: string) => void;

  // 필터 적용 및 초기화 함수
  onApply: (filters: ComplaintSearchDto) => void;
  onReset: () => void;
}

const ComplainFilter = ({
  // ⭐ Props 비구조화 할당
  dormitoryIndex,
  typeIndex,
  statusIndex,
  blockIndex,
  manager,
  floor,
  room,
  bed,
  onDormitoryChange,
  onTypeChange,
  onStatusChange,
  onBlockChange,
  onManagerChange,
  onFloorChange,
  onRoomChange,
  onBedChange,
  onApply,
  onReset,
}: ComplainFilterProps) => {
  // --- 4. 동적 옵션 목록을 위한 상태 추가 ---
  const [floorOptions, setFloorOptions] = useState<string[]>([]);
  const [roomOptions, setRoomOptions] = useState<string[]>([]);
  const [bedOptions, setBedOptions] = useState<string[]>([]);

  // --- 5. 기숙사/동 선택 시 옵션 동적 생성 Effect ---
  useEffect(() => {
    const dormName = complainDormitory[dormitoryIndex as number];
    const blockName = dormitoryBlocks[blockIndex as number];

    let floors: string[] = [];
    let rooms: string[] = [];
    let beds: string[] = [];

    if (dormName && blockName) {
      const dorm = dormStructure[dormName];
      const rules = dorm?.[blockName];

      if (rules) {
        floors = generateOptions(rules.floors.min, rules.floors.max, "층");
        rooms = generateOptions(1, rules.rooms, "호");
        beds = generateOptions(1, rules.beds, "번");
      }
    }

    setFloorOptions(floors);
    setRoomOptions(rooms);
    setBedOptions(beds);

    // ⭐ 옵션 변경 시, 부모의 상태(props)가 유효하지 않으면 초기화 핸들러 호출
    if (!floors.includes(floor)) {
      onFloorChange("");
    }
    if (!rooms.includes(room)) {
      onRoomChange("");
    }
    if (!beds.includes(bed)) {
      onBedChange("");
    }
    // props로 받은 floor, room, bed 및 핸들러 함수를 의존성 배열에 추가
  }, [
    dormitoryIndex,
    blockIndex,
    floor,
    room,
    bed,
    onFloorChange,
    onRoomChange,
    onBedChange,
  ]);

  const handleApplyFilters = () => {
    const filters: ComplaintSearchDto = {
      ...(dormitoryIndex !== null && {
        dormType: complainDormitory[dormitoryIndex],
      }),
      ...(manager && { officer: manager }),
      ...(typeIndex !== null && { type: ComplainType[typeIndex] }),
      ...(statusIndex !== null && { status: complainStatus[statusIndex] }),
      ...(blockIndex !== null && { building: dormitoryBlocks[blockIndex] }),
      ...(floor && { floor }),
      ...(room && { roomNumber: room }),
      ...(bed && { bedNumber: bed }),
    };
    onApply(filters);
  };

  return (
    <Wrapper>
      <FormField label="기숙사">
        <SelectableChipGroup
          Groups={complainDormitory}
          selectedIndex={dormitoryIndex}
          onSelect={onDormitoryChange}
        />
      </FormField>
      <FormField label="담당자">
        <Input
          placeholder="담당자 이름을 입력해주세요"
          value={manager}
          onChange={(e) => onManagerChange(e.target.value)}
        />
      </FormField>
      <FormField label="유형">
        <SelectableChipGroup
          Groups={ComplainType}
          selectedIndex={typeIndex}
          onSelect={onTypeChange}
        />
      </FormField>
      <FormField label="현황">
        <SelectableChipGroup
          Groups={complainStatus}
          selectedIndex={statusIndex}
          onSelect={onStatusChange}
        />
      </FormField>
      <FormField label="동">
        <SelectableChipGroup
          Groups={dormitoryBlocks}
          selectedIndex={blockIndex}
          onSelect={onBlockChange}
        />
      </FormField>

      {/* --- 6. JSX 드롭다운 수정 --- */}
      <FormField label="층/호수/침대">
        <DropdownContainer>
          <Dropdown
            value={floor}
            onChange={(e) => onFloorChange(e.target.value)}
            hasValue={!!floor}
            disabled={floorOptions.length === 0} // ⭐ disabled 추가
          >
            <option value="" disabled>
              층
            </option>
            {/* ⭐ floorOptions 사용 */}
            {floorOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Dropdown>
          <Dropdown
            value={room}
            onChange={(e) => onRoomChange(e.target.value)}
            hasValue={!!room}
            disabled={roomOptions.length === 0} // ⭐ disabled 추가
          >
            <option value="" disabled>
              호수
            </option>
            {/* ⭐ roomOptions 사용 */}
            {roomOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Dropdown>
          <Dropdown
            value={bed}
            onChange={(e) => onBedChange(e.target.value)}
            hasValue={!!bed}
            disabled={bedOptions.length === 0} // ⭐ disabled 추가
          >
            <option value="" disabled>
              침대
            </option>
            {/* ⭐ bedOptions 사용 */}
            {bedOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Dropdown>
        </DropdownContainer>
      </FormField>
      <ButtonWrapper>
        <Button onClick={onReset} isReset>
          초기화
        </Button>
        <Button onClick={handleApplyFilters}>필터 적용</Button>
      </ButtonWrapper>
    </Wrapper>
  );
};

export default ComplainFilter;

// (styled-components 코드는 동일)
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 2px solid rgba(10, 132, 255, 0.12);
  background: #fff;
  padding: 16px;
  box-sizing: border-box;
  gap: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 64px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
`;

const Button = styled.button<{ isReset?: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: ${({ isReset }) => (isReset ? "1px solid #ccc" : "none")};
  background-color: ${({ isReset }) => (isReset ? "#f0f0f0" : "#007bff")};
  color: ${({ isReset }) => (isReset ? "#333" : "#fff")};
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;
