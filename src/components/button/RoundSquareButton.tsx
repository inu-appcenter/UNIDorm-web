import styled from "styled-components";

// 1. props 인터페이스에 'color' 추가 (선택적 프로퍼티)
interface RoundSquareButtonProps {
  btnName: string;
  color?: string;
  onClick?: () => void;
}

// 2. 컴포넌트 이름 변경 및 color prop 받기
const RoundSquareButton = ({
  btnName,
  onClick,
  color = "#0a84ff", // 기본값을 기존 파란색으로 설정
}: RoundSquareButtonProps) => {
  return (
    // 3. styled-component에 color prop 전달
    <RoundSquareButtonWrapper onClick={onClick} color={color}>
      {btnName}
    </RoundSquareButtonWrapper>
  );
};
export default RoundSquareButton;

// 4. styled-component가 color prop을 받도록 타입 지정
const RoundSquareButtonWrapper = styled.button<{ color: string }>`
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

  /* 5. background 색상을 props로부터 동적으로 설정 */
  background: ${(props) => props.color};
  border-radius: 8px;

  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  letter-spacing: 0.38px;

  color: #f4f4f4;

  /* 줄바꿈 방지 설정 */
  white-space: nowrap;
  /* 텍스트 넘침 제어 (필요 시) */
  overflow: hidden;
  /* 넘치는 텍스트 말줄임 표시 (필요 시) */
  text-overflow: ellipsis;
`;
