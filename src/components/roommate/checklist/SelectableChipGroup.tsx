import styled from "styled-components";

interface BaseProps {
  Groups: string[];
  multi?: boolean;
  disabled?: boolean; // disabled 추가
}

type SingleSelectProps = BaseProps & {
  selectedIndex: number | null;
  onSelect: (index: any) => void;
  selectedIndices?: never;
};

type MultiSelectProps = BaseProps & {
  selectedIndices: number[];
  onSelect: (indices: number[]) => void;
  selectedIndex?: never;
};

type SelectableChipProps = SingleSelectProps | MultiSelectProps;

const isMultiProps = (
  props: SelectableChipProps,
): props is MultiSelectProps => {
  return Array.isArray((props as MultiSelectProps).selectedIndices);
};

const SelectableChipGroup = (props: SelectableChipProps) => {
  const {
    Groups,
    selectedIndex,
    selectedIndices,
    multi = false,
    disabled = false,
  } = props;

  const handleClick = (index: number) => {
    if (disabled) return; // 클릭 무력화

    if (isMultiProps(props)) {
      const newSelected = props.selectedIndices.includes(index)
        ? props.selectedIndices.filter((i) => i !== index)
        : [...props.selectedIndices, index];

      props.onSelect(newSelected);
    } else {
      // 싱글 선택 모드에서 이미 선택된 인덱스를 클릭하면 해제(null)
      if (props.selectedIndex === index) {
        props.onSelect(null);
      } else {
        props.onSelect(index);
      }
    }
  };

  return (
    <SelectableChipGroupWrapper>
      {Groups.map((content, index) => {
        const isSelected = multi
          ? (selectedIndices?.includes(index) ?? false)
          : selectedIndex === index;

        return (
          <SelectableChip
            key={index}
            selected={isSelected}
            onClick={() => handleClick(index)}
            disabled={disabled} // 스타일용 prop 전달
          >
            {content}
          </SelectableChip>
        );
      })}
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

const SelectableChip = styled.div<{ selected: boolean; disabled?: boolean }>`
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
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  transition:
    background 0.2s ease,
    color 0.2s ease;

  ${({ disabled }) =>
    disabled &&
    `
    opacity: 0.6;
    pointer-events: none;
  `}
`;
