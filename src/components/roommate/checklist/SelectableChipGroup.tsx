import styled from "styled-components";

interface BaseProps {
  Groups: string[];
  multi?: boolean;
}

type SingleSelectProps = BaseProps & {
  selectedIndex: number | null;
  onSelect: (index: number) => void;
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
  const { Groups, selectedIndex, selectedIndices, multi = false } = props;

  const handleClick = (index: number) => {
    if (isMultiProps(props)) {
      const newSelected = props.selectedIndices.includes(index)
        ? props.selectedIndices.filter((i) => i !== index)
        : [...props.selectedIndices, index];

      props.onSelect(newSelected);
    } else {
      props.onSelect(index);
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
