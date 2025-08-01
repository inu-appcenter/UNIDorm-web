// ToggleGroup.tsx

import styled from "styled-components";

interface ToggleGroupProps {
  Groups: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean; // 추가
}

const ToggleGroup = ({
  Groups,
  selectedIndex,
  onSelect,
  disabled = false,
}: ToggleGroupProps) => {
  return (
    <ToggleGroupWrapper>
      {Groups.map((content, index) => (
        <ToggleItem
          key={index}
          selected={selectedIndex === index}
          onClick={() => {
            if (!disabled) {
              onSelect(index);
            }
          }}
          disabled={disabled} // styled-component에 넘겨서 스타일 적용도 가능
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

const ToggleItem = styled.div<{ selected: boolean; disabled?: boolean }>`
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
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  transition:
    background 0.2s ease,
    color 0.2s ease;
  border-right: 1px solid rgba(0, 0, 0, 0.3);

  &:last-child {
    border-right: none;
  }

  ${({ disabled }) =>
    disabled &&
    `
    opacity: 0.6;
    pointer-events: none;  // 클릭 자체를 막음
  `}
`;
