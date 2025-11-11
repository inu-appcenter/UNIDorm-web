import styled from "styled-components";

interface BaseProps {
  Groups: string[];
  multi?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  selectedBackgroundColor?: string;
  color?: string;
  selectedColor?: string;
  borderColor?: string; // borderColor prop 추가
  selectedBorderColor?: string; // selectedBorderColor prop 추가
  unselectable?: boolean; // 해제 불가 여부 추가
  rowScrollable?: boolean; // 가로 한줄 스크롤로 할 경우
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
    backgroundColor,
    selectedBackgroundColor,
    color,
    selectedColor,
    borderColor,
    selectedBorderColor,
  } = props;

  const handleClick = (index: number) => {
    if (disabled) return;

    if (isMultiProps(props)) {
      if (props.unselectable && props.selectedIndices.includes(index)) return;

      const newSelected = props.selectedIndices.includes(index)
        ? props.selectedIndices.filter((i) => i !== index)
        : [...props.selectedIndices, index];

      props.onSelect(newSelected);
    } else {
      if (props.unselectable && props.selectedIndex === index) return;

      if (props.selectedIndex === index) {
        props.onSelect(null);
      } else {
        props.onSelect(index);
      }
    }
  };

  return (
    <SelectableChipGroupWrapper rowScrollable={props.rowScrollable}>
      {Groups.map((content, index) => {
        const isSelected = multi
          ? (selectedIndices?.includes(index) ?? false)
          : selectedIndex === index;

        return (
          <SelectableChip
            key={index}
            selected={isSelected}
            onClick={() => handleClick(index)}
            disabled={disabled}
            backgroundColor={backgroundColor}
            selectedBackgroundColor={selectedBackgroundColor}
            color={color}
            selectedColor={selectedColor}
            borderColor={borderColor}
            selectedBorderColor={selectedBorderColor}
          >
            {content}
          </SelectableChip>
        );
      })}
    </SelectableChipGroupWrapper>
  );
};

export default SelectableChipGroup;

const SelectableChipGroupWrapper = styled.div<{ rowScrollable?: boolean }>`
  display: flex;
  flex-wrap: ${({ rowScrollable }) => (rowScrollable ? "nowrap" : "wrap")};
  gap: 8px;
  width: 100%;
`;

const SelectableChip = styled.div<{
  selected: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  selectedBackgroundColor?: string;
  color?: string;
  selectedColor?: string;
  borderColor?: string;
  selectedBorderColor?: string;
}>`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;

  background: ${({ selected, backgroundColor, selectedBackgroundColor }) =>
    selected
      ? selectedBackgroundColor || "#0A84FF"
      : backgroundColor || "#ffffff"};
  border: 1px solid
    ${({ selected, borderColor, selectedBorderColor }) =>
      selected
        ? selectedBorderColor || "#0A84FF" // 선택되었을 때의 테두리 색상
        : borderColor || "#8e8e93"}; // 선택되지 않았을 때의 테두리 색상
  border-radius: 20px;

  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: ${({ selected, color, selectedColor }) =>
    selected ? selectedColor || "#ffffff" : color || "#8e8e93"};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease; // transition에 border-color 추가

  ${({ disabled }) =>
    disabled &&
    `
    opacity: 0.6;
    pointer-events: none;
  `}
`;
