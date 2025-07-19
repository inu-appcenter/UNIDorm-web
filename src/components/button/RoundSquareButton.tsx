import styled from "styled-components";

interface RoundSquareButtonProps {
  btnName: string;
  onClick?: () => void;
}
const RoundSquareButton = ({ btnName, onClick }: RoundSquareButtonProps) => {
  return (
    <RoundSquareButtonWrapper onClick={onClick}>
      {btnName}
    </RoundSquareButtonWrapper>
  );
};
export default RoundSquareButton;

const RoundSquareButtonWrapper = styled.div`
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

  background: #0a84ff;
  border-radius: 8px;

  font-family: "Pretendard";
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  letter-spacing: 0.38px;

  color: #f4f4f4;
`;
