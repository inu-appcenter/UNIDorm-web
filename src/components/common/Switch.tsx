import React from "react";
import styled from "styled-components";
import { Switch as HeadlessSwitch } from "@headlessui/react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const SwitchContainer = styled(HeadlessSwitch)<{ checked: boolean }>`
  display: inline-flex;
  align-items: center;
  /* 전체 사이즈 축소 */
  height: 20px;
  width: 36px;
  padding: 0 2px;
  border-radius: 9999px;
  border: none;
  background-color: ${({ checked }) => (checked ? "#0A84FF" : "#A2A1A5")};
  transition: background-color 0.2s ease-in-out;
  cursor: pointer;
`;

const SwitchHandle = styled.span<{ checked: boolean }>`
  /* 컨테이너 높이에 맞춘 핸들 크기 */
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  /* 이동 거리: 36px(너비) - 4px(좌우패딩) - 16px(핸들) = 16px */
  transform: ${({ checked }) =>
    checked ? "translateX(16px)" : "translateX(0px)"};
  transition: transform 0.2s ease-in-out;
`;

const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange }) => {
  return (
    <SwitchContainer checked={checked} onChange={onCheckedChange}>
      <SwitchHandle checked={checked} />
    </SwitchContainer>
  );
};

export default Switch;
