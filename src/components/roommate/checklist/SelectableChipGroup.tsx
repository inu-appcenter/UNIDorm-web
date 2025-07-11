import styled from "styled-components";
import { useState } from "react";

interface SelectableChipProps {
  Groups: string[];
}

const SelectableChipGroup = ({ Groups }: SelectableChipProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <SelectableChipGroupWrapper>
      {Groups.map((content, index) => (
        <SelectableChip
          key={index}
          selected={selectedIndex === index}
          onClick={() => handleClick(index)}
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
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 13px;
  gap: 7px;

  width: fit-content;
  height: fit-content;

  background: ${({ selected }) => (selected ? "#0A84FF" : "#ffffff")};
  border: 1px solid #8e8e93;
  border-radius: 20px;

  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  text-align: center;

  color: ${({ selected }) => (selected ? "#ffffff" : "#8e8e93")};
  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease;
`;
