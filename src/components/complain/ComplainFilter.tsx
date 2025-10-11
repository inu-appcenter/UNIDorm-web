// 📄 components/complain/ComplainFilter.tsx

import styled from "styled-components";
import FormField from "./FormField.tsx";
import SelectableChipGroup from "../roommate/checklist/SelectableChipGroup.tsx";
import {
  beds,
  complainDormitory,
  complainStatus,
  ComplainType,
  dormitoryBlocks,
  floors,
  rooms,
} from "../../constants/constants.ts";
import { Dropdown, DropdownContainer, Input } from "../../styles/complain.ts";
import { ComplaintSearchDto } from "../../types/complain.ts";

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
  const handleApplyFilters = () => {
    const filters: ComplaintSearchDto = {
      ...(dormitoryIndex !== null && {
        // complainDormitory[dormitoryIndex]의 값이 string이라고 가정
        dormType: complainDormitory[dormitoryIndex],
      }),
      ...(manager && { officer: manager }),
      ...(typeIndex !== null && { type: ComplainType[typeIndex] }),
      ...(statusIndex !== null && { status: complainStatus[statusIndex] }),
      // 'block' 대신 'building' 사용
      ...(blockIndex !== null && { building: dormitoryBlocks[blockIndex] }),
      ...(floor && { floor }),
      // 'room' 대신 'roomNumber' 사용
      ...(room && { roomNumber: room }),
      // 'bed' 대신 'bedNumber' 사용
      ...(bed && { bedNumber: bed }),
      // 원본 코드에는 없지만, DTO에 'keyword'가 있으니 필요하면 추가하세요.
      // ...(keyword && { keyword: keyword }),
    };
    onApply(filters);
  };

  return (
    <Wrapper>
      <FormField label="기숙사">
        <SelectableChipGroup
          Groups={complainDormitory}
          selectedIndex={dormitoryIndex} // ⭐ props.selectedIndex
          onSelect={onDormitoryChange} // ⭐ props.onSelect
        />
      </FormField>
      <FormField label="담당자">
        <Input
          placeholder="담당자 이름을 입력해주세요"
          value={manager} // ⭐ props.value
          onChange={(e) => onManagerChange(e.target.value)} // ⭐ props.onChange
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
      <FormField label="층/호수">
        <DropdownContainer>
          <Dropdown
            value={floor}
            onChange={(e) => onFloorChange(e.target.value)}
            hasValue={!!floor}
          >
            <option value="" disabled>
              층
            </option>
            {floors.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Dropdown>
          <Dropdown
            value={room}
            onChange={(e) => onRoomChange(e.target.value)}
            hasValue={!!room}
          >
            <option value="" disabled>
              호수
            </option>
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Dropdown>
          <Dropdown
            value={bed}
            onChange={(e) => onBedChange(e.target.value)}
            hasValue={!!bed}
          >
            <option value="" disabled>
              침대
            </option>
            {beds.map((b) => (
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
        </Button>{" "}
        {/* ⭐ props.onReset */}
        <Button onClick={handleApplyFilters}>필터 적용</Button>
      </ButtonWrapper>
    </Wrapper>
  );
};

export default ComplainFilter;

// (styled-components 코드는 이전과 동일)
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
