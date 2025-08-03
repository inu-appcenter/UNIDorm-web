import React from "react";

interface FilterButtonProps {
  active?: boolean;
  onClick?: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  active = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: "fit-content",
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: 14,
        backgroundColor: active ? "#4B7BFF" : "#F4F5F7",
        color: active ? "white" : "#494949",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active ? "white" : "#494949"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3 5h18v2l-7 7v5l-4-2v-3L3 7V5z" />
      </svg>
      필터
    </button>
  );
};

export default FilterButton;
