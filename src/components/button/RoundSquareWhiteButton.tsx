import styled from "styled-components";
import Ripple from "../common/Ripple";

interface RoundSquareButtonProps {
  btnName: string;
  onClick?: () => void;
}

const RoundSquareWhiteButton = ({
  btnName,
  onClick,
}: RoundSquareButtonProps) => {
  return (
    <RoundSquareWhiteButtonWrapper onClick={onClick} role="button" tabIndex={0}>
      <Ripple color="rgba(10, 132, 255, 0.15)" />
      <ButtonText>{btnName}</ButtonText>
    </RoundSquareWhiteButtonWrapper>
  );
};
export default RoundSquareWhiteButton;

const RoundSquareWhiteButtonWrapper = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  min-width: 80px;
  height: 100%;
  min-height: 50px;
  padding: 0 16px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background: transparent;
  border: 2px solid #0a84ff;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;

  /* 토스 스타일 쫀득한 감속 이징 및 스케일 피드백 */
  transition: transform 0.12s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.12s ease;

  &:active {
    transform: scale(0.97);
    background-color: rgba(10, 132, 255, 0.05);
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
  color: #0a84ff;
`;
