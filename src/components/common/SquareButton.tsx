import styled from "styled-components";

interface SquareButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: () => void;
}

const SquareButton = ({
  text,
  disabled = false,
  onClick,
}: SquareButtonProps) => {
  return (
    <SquareButtonWrapper disabled={disabled} onClick={onClick}>
      {text}
    </SquareButtonWrapper>
  );
};

export default SquareButton;

const SquareButtonWrapper = styled.button<{ disabled?: boolean }>`
  width: 100%;
  min-height: 60px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  background-color: ${({ disabled }) => (disabled ? "#8E8E93" : "#0A84FF")};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#99999f" : "#006fe0")};
  }
`;
