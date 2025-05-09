import styled from "styled-components";

interface RoundSquareButtonProps {
  btnName: string;
}
const RoundSquareButton = ({ btnName }: RoundSquareButtonProps) => {
  return <RoundSquareButtonWrapper>{btnName}</RoundSquareButtonWrapper>;
};
export default RoundSquareButton;

const RoundSquareButtonWrapper = styled.div`
  width: fit-content;
  min-width: 80px;
  height: 100%;
  max-height: 50px;
  padding: 0 16px;

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
