import styled from "styled-components";
import Ripple from "../common/Ripple";

interface RoundSquareButtonProps {
  btnName: string;
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const RoundSquareButton = ({
  btnName,
  onClick,
  color = "#0a84ff",
  disabled = false,
}: RoundSquareButtonProps) => {
  return (
    <RoundSquareButtonWrapper
      type="button"
      onClick={onClick}
      color={color}
      disabled={disabled}
    >
      {!disabled && <Ripple color="rgba(255, 255, 255, 0.32)" />}
      <ButtonText>{btnName}</ButtonText>
    </RoundSquareButtonWrapper>
  );
};

export default RoundSquareButton;

const RoundSquareButtonWrapper = styled.button<{ color: string }>`
  position: relative;
  flex: 1;
  width: 100%;
  min-width: fit-content;
  height: 100%;
  min-height: 50px;
  padding: 0 16px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background: ${(props) => props.color};
  border-radius: 8px;
  border: none;
  outline: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;

  /* 토스 스타일 쫀득한 감속 이징 및 스케일 피드백 */
  transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.12s ease;

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    background: #dfdfdf;
    color: #8b8b8b;
    cursor: not-allowed;
    pointer-events: none;
    transform: none;
  }
`;

const ButtonText = styled.span`
  position: relative;
  z-index: 1;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.38px;
  color: #f4f4f4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
