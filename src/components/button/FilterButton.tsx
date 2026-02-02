import React from "react";
import styled from "styled-components";

interface FilterButtonProps {
  active?: boolean;
  onClick?: () => void;
}

const StyledButton = styled.button<{ active: boolean }>`
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  border: ${({ active }) => (active ? "none" : "1px solid #D0D0D0")};
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  background-color: ${({ active }) => (active ? "#4B7BFF" : "#F4F5F7")};
  color: ${({ active }) => (active ? "white" : "#494949")};

  svg {
    fill: ${({ active }) => (active ? "white" : "#494949")};
  }
`;

const FilterButton: React.FC<FilterButtonProps> = ({
  active = false,
  onClick,
}) => {
  return (
    <StyledButton active={active} onClick={onClick}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3 5h18v2l-7 7v5l-4-2v-3L3 7V5z" />
      </svg>
      검색
    </StyledButton>
  );
};

export default FilterButton;
