// ToggleGroup.tsx

import styled from "styled-components";

interface ToggleGroupProps {
  Groups: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

const ToggleGroup = ({ Groups, selectedIndex, onSelect }: ToggleGroupProps) => {
  return (
    <ToggleGroupWrapper>
      {Groups.map((content, index) => (
        <ToggleItem
          key={index}
          selected={selectedIndex === index}
          onClick={() => onSelect(index)}
        >
          {content}
        </ToggleItem>
      ))}
    </ToggleGroupWrapper>
  );
};

export default ToggleGroup;

const ToggleGroupWrapper = styled.div`
  display: flex;
  width: 100%;
  height: fit-content;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
`;

const ToggleItem = styled.div<{ selected: boolean }>`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 13px;
  gap: 7px;

  width: 100%;
  height: fit-content;

  background: ${({ selected }) => (selected ? "#0A84FF" : "#ffffff")};
  color: ${({ selected }) => (selected ? "#ffffff" : "#8e8e93")};

  font-size: 12px;
  text-align: center;
  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease;
  border-right: 1px solid rgba(0, 0, 0, 0.3);

  &:last-child {
    border-right: none;
  }
`;
