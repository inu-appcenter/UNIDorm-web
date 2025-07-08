import styled from "styled-components";
import { useState } from "react";

interface ToggleGroupProps {
  Groups: string[];
}

const ToggleGroup = ({ Groups }: ToggleGroupProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

  const handleClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <ToggleGroupWrapper>
      {Groups.map((content, index) => (
        <ToggleItem
          key={index}
          selected={selectedIndex === index}
          onClick={() => handleClick(index)}
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
  overflow: hidden; /* 추가 */
`;

const ToggleItem = styled.div<{ selected: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 13px;
  gap: 7px;

  width: 100%;
  height: fit-content;

  background: ${({ selected }) => (selected ? "#0A84FF" : "#ffffff")};

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

  border-right: 1px solid rgba(0, 0, 0, 0.3);

  &:last-child {
    border-right: none;
  }
`;
