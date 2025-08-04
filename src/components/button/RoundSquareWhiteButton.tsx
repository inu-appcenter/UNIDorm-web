import styled from "styled-components";

interface RoundSquareButtonProps {
  btnName: string;
  onClick?: () => void;
}

const RoundSquareWhiteButton = ({
  btnName,
  onClick,
}: RoundSquareButtonProps) => {
  return (
    <RoundSquareWhiteButtonWrapper onClick={onClick}>
      {btnName}
    </RoundSquareWhiteButtonWrapper>
  );
};
export default RoundSquareWhiteButton;

const RoundSquareWhiteButtonWrapper = styled.div`
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

  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  letter-spacing: 0.38px;

  color: #0a84ff;

  cursor: pointer;
`;
