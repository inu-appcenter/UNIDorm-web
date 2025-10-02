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
import { useState } from "react";

const ComplainFilter = ({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: () => void;
}) => {
  const [selectedDormitoryIndex, setSelectedDormitoryIndex] = useState<
    number | null
  >(null);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState<number | null>(
    null,
  );
  const [selectedStatusIndex, setSelectedStatusIndex] = useState<number | null>(
    null,
  );
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(
    null,
  );
  const [manager, setManager] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBed, setSelectedBed] = useState("");

  const handleResetFilters = () => {
    setSelectedDormitoryIndex(null);
    setSelectedTypeIndex(null);
    setSelectedStatusIndex(null);
    setSelectedBlockIndex(null);
    setManager("");
    setSelectedFloor("");
    setSelectedRoom("");
    setSelectedBed("");
  };

  const handleApplyFilters = () => {
    console.log("필터 적용:", {
      dormitory: selectedDormitoryIndex,
      type: selectedTypeIndex,
      status: selectedStatusIndex,
      block: selectedBlockIndex,
      manager,
      floor: selectedFloor,
      room: selectedRoom,
      bed: selectedBed,
    });
    onApply();
  };

  return (
    <Wrapper>
      <FormField label="기숙사">
        <SelectableChipGroup
          Groups={complainDormitory}
          selectedIndex={selectedDormitoryIndex}
          onSelect={setSelectedDormitoryIndex}
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
          selectedIndex={selectedTypeIndex}
          onSelect={setSelectedTypeIndex}
        />
      </FormField>

      <FormField label="현황">
        <SelectableChipGroup
          Groups={complainStatus}
          selectedIndex={selectedStatusIndex}
          onSelect={setSelectedStatusIndex}
        />
      </FormField>

      <FormField label="동">
        <SelectableChipGroup
          Groups={dormitoryBlocks}
          selectedIndex={selectedBlockIndex}
          onSelect={setSelectedBlockIndex}
        />
      </FormField>

      <FormField label="층/호수">
        <DropdownContainer>
          <Dropdown
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            hasValue={!!selectedFloor}
          >
            <option value="" disabled>
              층
            </option>
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </Dropdown>
          <Dropdown
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            hasValue={!!selectedRoom}
          >
            <option value="" disabled>
              호수
            </option>
            {rooms.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </Dropdown>
          <Dropdown
            value={selectedBed}
            onChange={(e) => setSelectedBed(e.target.value)}
            hasValue={!!selectedBed}
          >
            <option value="" disabled>
              침대
            </option>
            {beds.map((bed) => (
              <option key={bed} value={bed}>
                {bed}
              </option>
            ))}
          </Dropdown>
        </DropdownContainer>
      </FormField>

      <ButtonWrapper>
        <Button onClick={handleResetFilters} isReset>
          초기화
        </Button>
        <Button onClick={handleApplyFilters}>필터 적용</Button>
      </ButtonWrapper>
    </Wrapper>
  );
};

export default ComplainFilter;

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
