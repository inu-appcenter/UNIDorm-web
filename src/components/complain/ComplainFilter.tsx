// 📄 components/complain/ComplainFilter.tsx

import styled from "styled-components";
import FormField from "./FormField.tsx";
import SelectableChipGroup from "../roommate/checklist/SelectableChipGroup.tsx";
import {
  complainDormitory,
  complainStatus,
  ComplainType,
  dormitoryBlocks,
  dormStructure,
  formatBuildingForServer,
  formatBuildingFromServer,
} from "@/constants/constants";
import { Dropdown, DropdownContainer, Input } from "@/styles/common";
import { ComplaintSearchDto } from "@/types/complain";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const generateOptions = (min: number, max: number, suffix: string) => {
  return Array.from({ length: max - min + 1 }, (_, i) => `${min + i}${suffix}`);
};

interface ComplainFilterProps {
  /** 현재 적용된 상세 필터 조건 (초기값으로 사용) */
  initialFilters: ComplaintSearchDto | null;
  /** 필터 적용 핸들러 */
  onApply: (filters: ComplaintSearchDto | null) => void;
  /** 필터 초기화 핸들러 */
  onReset: () => void;
  /** 닫기 핸들러 (선택) */
  onClose?: () => void;
}

type DormName = keyof typeof dormStructure;

const ComplainFilter = ({
  initialFilters,
  onApply,
  onReset,
  onClose,
}: ComplainFilterProps) => {
  // initialFilters로부터 인덱스 및 필드 값 복원
  const getInitialDormIndex = () => {
    if (!initialFilters?.dormType) return null;
    const idx = (complainDormitory as readonly string[]).indexOf(
      initialFilters.dormType,
    );
    return idx >= 0 ? idx : null;
  };

  const getInitialTypeIndex = () => {
    if (!initialFilters?.type) return null;
    const idx = (ComplainType as readonly string[]).indexOf(
      initialFilters.type,
    );
    return idx >= 0 ? idx : null;
  };

  const getInitialStatusIndex = () => {
    if (!initialFilters?.status) return null;
    const idx = (complainStatus as readonly string[]).indexOf(
      initialFilters.status,
    );
    return idx >= 0 ? idx : null;
  };

  const getInitialBlockIndex = () => {
    if (!initialFilters?.building) return null;
    const formatted = formatBuildingFromServer(initialFilters.building);
    const idx = (dormitoryBlocks as readonly string[]).indexOf(formatted);
    return idx >= 0 ? idx : null;
  };

  // 내부 폼 상태 (Draft State: 적용 전까지 부모 상태를 오염시키지 않음)
  const [dormitoryIndex, setDormitoryIndex] = useState<number | null>(
    getInitialDormIndex,
  );
  const [typeIndex, setTypeIndex] = useState<number | null>(getInitialTypeIndex);
  const [statusIndex, setStatusIndex] = useState<number | null>(
    getInitialStatusIndex,
  );
  const [blockIndex, setBlockIndex] = useState<number | null>(
    getInitialBlockIndex,
  );
  const [manager, setManager] = useState(initialFilters?.officer || "");
  const [floor, setFloor] = useState(initialFilters?.floor || "");
  const [room, setRoom] = useState(initialFilters?.roomNumber || "");
  const [bed, setBed] = useState(initialFilters?.bedNumber || "");
  const [startDate, setStartDate] = useState(initialFilters?.startDate || "");
  const [endDate, setEndDate] = useState(initialFilters?.endDate || "");

  // 동적 옵션 목록
  const [floorOptions, setFloorOptions] = useState<string[]>([]);
  const [roomOptions, setRoomOptions] = useState<string[]>([]);
  const [bedOptions, setBedOptions] = useState<string[]>([]);

  // 기숙사/동 선택 시 층/호수/침대 옵션 동적 생성
  useEffect(() => {
    const dormName =
      dormitoryIndex !== null ? complainDormitory[dormitoryIndex] : null;
    const blockName =
      blockIndex !== null ? dormitoryBlocks[blockIndex] : null;

    let floors: string[] = [];
    let rooms: string[] = [];
    let beds: string[] = [];

    if (dormName && blockName && dormName in dormStructure) {
      const dorm = dormStructure[dormName as DormName];
      const rules =
        blockName in dorm
          ? (dorm as Record<string, { floors: { min: number; max: number }; rooms: number; beds: number }>)[
              blockName
            ]
          : null;

      if (rules) {
        floors = generateOptions(rules.floors.min, rules.floors.max, "층");
        rooms = generateOptions(1, rules.rooms, "호");
        beds = generateOptions(1, rules.beds, "번");
      }
    }

    setFloorOptions(floors);
    setRoomOptions(rooms);
    setBedOptions(beds);

    if (floor && !floors.includes(floor)) {
      setFloor("");
    }
    if (room && !rooms.includes(room)) {
      setRoom("");
    }
    if (bed && !beds.includes(bed)) {
      setBed("");
    }
  }, [dormitoryIndex, blockIndex, floor, room, bed]);

  // 필터 적용
  const handleApply = () => {
    const selectedBlock =
      blockIndex !== null ? dormitoryBlocks[blockIndex] : null;
    const serverBuilding = formatBuildingForServer(selectedBlock);

    const filters: ComplaintSearchDto = {
      ...(dormitoryIndex !== null && {
        dormType: complainDormitory[dormitoryIndex],
      }),
      ...(manager.trim() && { officer: manager.trim() }),
      ...(typeIndex !== null && { type: ComplainType[typeIndex] }),
      ...(statusIndex !== null && { status: complainStatus[statusIndex] }),
      ...(serverBuilding && { building: serverBuilding }),
      ...(floor && { floor }),
      ...(room && { roomNumber: room }),
      ...(bed && { bedNumber: bed }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const hasAnyFilter = Object.keys(filters).length > 0;
    onApply(hasAnyFilter ? filters : null);
  };

  // 필터 초기화
  const handleReset = () => {
    setDormitoryIndex(null);
    setTypeIndex(null);
    setStatusIndex(null);
    setBlockIndex(null);
    setManager("");
    setFloor("");
    setRoom("");
    setBed("");
    setStartDate("");
    setEndDate("");
    onReset();
  };

  return (
    <Wrapper>
      <HeaderRow>
        <FilterTitle>필터</FilterTitle>
        {onClose && (
          <CloseButton type="button" onClick={onClose} aria-label="필터 닫기">
            <X size={18} />
          </CloseButton>
        )}
      </HeaderRow>

      <FormField label="기숙사">
        <SelectableChipGroup
          Groups={complainDormitory}
          selectedIndex={dormitoryIndex}
          onSelect={setDormitoryIndex}
        />
      </FormField>

      <FormField label="담당자">
        <Input
          placeholder="담당자 이름을 입력해주세요"
          value={manager}
          onChange={(e) => setManager(e.target.value)}
        />
      </FormField>

      <FormField label="유형">
        <SelectableChipGroup
          Groups={ComplainType}
          selectedIndex={typeIndex}
          onSelect={setTypeIndex}
        />
      </FormField>

      <FormField label="현황">
        <SelectableChipGroup
          Groups={complainStatus}
          selectedIndex={statusIndex}
          onSelect={setStatusIndex}
        />
      </FormField>

      <FormField label="동">
        <SelectableChipGroup
          Groups={dormitoryBlocks}
          selectedIndex={blockIndex}
          onSelect={setBlockIndex}
        />
      </FormField>

      <FormField label="층/호수/침대">
        <DropdownContainer>
          <Dropdown
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            hasValue={!!floor}
            disabled={floorOptions.length === 0}
          >
            <option value="" disabled>
              층
            </option>
            {floorOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Dropdown>
          <Dropdown
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            hasValue={!!room}
            disabled={roomOptions.length === 0}
          >
            <option value="" disabled>
              호수
            </option>
            {roomOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Dropdown>
          <Dropdown
            value={bed}
            onChange={(e) => setBed(e.target.value)}
            hasValue={!!bed}
            disabled={bedOptions.length === 0}
          >
            <option value="" disabled>
              침대
            </option>
            {bedOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Dropdown>
        </DropdownContainer>
      </FormField>

      <FormField label="접수 기간">
        <DateRangeContainer>
          <DateInput
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="접수 시작일"
          />
          <DateSeparator>~</DateSeparator>
          <DateInput
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            aria-label="접수 종료일"
          />
        </DateRangeContainer>
      </FormField>

      <GuideText>
        화면 우측 상단 메뉴에서 현재 조회된 민원 목록을 CSV로 다운로드할 수 있어요.
      </GuideText>

      <ButtonWrapper>
        <ResetButton type="button" onClick={handleReset}>
          초기화
        </ResetButton>
        <ApplyButton type="button" onClick={handleApply}>
          필터 적용
        </ApplyButton>
      </ButtonWrapper>
    </Wrapper>
  );
};

export default ComplainFilter;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  padding: 20px;
  box-sizing: border-box;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  min-width: 320px;
  max-width: 480px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
`;

const FilterTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #191f28;
`;

const CloseButton = styled.button`
  border: none;
  background: none;
  padding: 4px;
  color: #8b95a1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;

  &:hover {
    color: #191f28;
    background-color: #f2f4f6;
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const DateInput = styled.input`
  flex: 1;
  height: 40px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e8eb;
  background-color: #ffffff;
  font-size: 13px;
  color: #191f28;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #3182f6;
  }
`;

const DateSeparator = styled.span`
  color: #8b95a1;
  font-size: 14px;
  font-weight: 500;
`;

const GuideText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #8b95a1;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
`;

const ResetButton = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #e5e8eb;
  background-color: #f2f4f6;
  color: #4e5968;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: #e5e8eb;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ApplyButton = styled.button`
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  background-color: #3182f6;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    background-color: #1b64da;
  }

  &:active {
    transform: scale(0.98);
  }
`;
