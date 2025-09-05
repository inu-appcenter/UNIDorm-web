import styled from "styled-components";

interface RoundSquareButtonProps {
  btnName: string;
  onClick?: () => void;
}
const RoundSquareBlueButton = ({
  btnName,
  onClick,
}: RoundSquareButtonProps) => {
  return (
    <RoundSquareBlueButtonWrapper onClick={onClick}>
      {btnName}
    </RoundSquareBlueButtonWrapper>
  );
};
export default RoundSquareBlueButton;

const RoundSquareBlueButtonWrapper = styled.div`
  width: auto;
  min-width: 80px;
  height: 100%;
  min-height: 50px;
  padding: 0 16px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background: #0a84ff;
  border-radius: 8px;

  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  letter-spacing: 0.38px;

  color: #f4f4f4;
`;
