// SelectableChipGroup.tsx

import styled from "styled-components";

interface SelectableChipProps {
  Groups: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

const SelectableChipGroup = ({
  Groups,
  selectedIndex,
  onSelect,
}: SelectableChipProps) => {
  return (
    <SelectableChipGroupWrapper>
      {Groups.map((content, index) => (
        <SelectableChip
          key={index}
          selected={selectedIndex === index}
          onClick={() => onSelect(index)}
        >
          {content}
        </SelectableChip>
      ))}
    </SelectableChipGroupWrapper>
  );
};

export default SelectableChipGroup;

const SelectableChipGroupWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
`;

const SelectableChip = styled.div<{ selected: boolean }>`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 13px;

  background: ${({ selected }) => (selected ? "#0A84FF" : "#ffffff")};
  border: 1px solid #8e8e93;
  border-radius: 20px;

  font-size: 12px;
  color: ${({ selected }) => (selected ? "#ffffff" : "#8e8e93")};
  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease;
`;
