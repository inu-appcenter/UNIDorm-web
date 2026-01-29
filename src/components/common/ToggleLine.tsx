import styled from "styled-components";
import Switch from "../../components/common/Switch.tsx";

interface ToggleLineProps {
  label?: string;
  offLabel?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

const ToggleLine = ({
  label = "사용 중",
  offLabel = "사용 안 함",
  checked,
  onToggle,
}: ToggleLineProps) => {
  return (
    <ToggleWrapper $checked={checked} onClick={() => onToggle(!checked)}>
      <StatusText $checked={checked}>{checked ? label : offLabel}</StatusText>
      <div onClick={(e) => e.stopPropagation()}>
        <Switch checked={checked} onCheckedChange={() => onToggle(!checked)} />
      </div>
    </ToggleWrapper>
  );
};

export default ToggleLine;

const ToggleWrapper = styled.div<{ $checked: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px 20px;
  border-radius: 24px; /* 양쪽 둥근 모서리 */
  transition: all 0.2s ease;
  cursor: pointer;
  box-sizing: border-box;

  /* 상태별 배경 및 테두리 */
  background-color: ${(props) => (props.$checked ? "#eeeeee" : "#ffffff")};
  border: 1px solid ${(props) => (props.$checked ? "#eeeeee" : "#e5e5e5")};

  &:active {
    opacity: 0.8;
  }
`;

const StatusText = styled.span<{ $checked: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => (props.$checked ? "#0A84FF" : "#0")};
  user-select: none;
`;
