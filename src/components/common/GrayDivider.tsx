// components/GrayDivider.tsx
import styled from "styled-components";

interface GrayDividerProps {
  thickness?: string; // e.g., "1px", "2px"
  margin?: string; // e.g., "16px 0"
  color?: string; // e.g., "#ccc"
}

const StyledDivider = styled.div<GrayDividerProps>`
  width: 100%;
  height: ${({ thickness }) => thickness || "1px"};
  background-color: ${({ color }) => color || "#ccc"};
  margin: ${({ margin }) => margin || "6px 0"};
  //box-sizing: border-box;
`;

const GrayDivider = ({ thickness, margin, color }: GrayDividerProps) => {
  return <StyledDivider thickness={thickness} margin={margin} color={color} />;
};

export default GrayDivider;
