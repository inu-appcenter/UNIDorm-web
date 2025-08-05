// components/IconTextButton.tsx
import React from "react";
import styled from "styled-components";

import Date_range_light from "../../assets/roommate/Date_range_light.svg";
import Flag_light from "../../assets/roommate/Flag_light.svg";
import comment_light from "../../assets/roommate/Comment_light.svg";
import TopRightDropdownMenu from "../common/TopRightDropdownMenu.tsx";

type ButtonType = "addtimetable" | "createrules" | "quickmessage";

type MenuItemType = {
  label: string;
  onClick: () => void;
};

interface IconTextButtonProps {
  type: ButtonType;
  onClick?: () => void;
  menuItems?: MenuItemType[];
}

// 매핑 객체
const buttonMeta: Record<ButtonType, { icon: React.ReactNode; text: string }> =
  {
    addtimetable: {
      icon: <img src={Date_range_light} />,
      text: "시간표",
    },
    createrules: {
      icon: <img src={Flag_light} />,
      text: "우리 방 규칙",
    },
    quickmessage: {
      icon: <img src={comment_light} />,
      text: "퀵 메시지",
    },
  };

const IconTextButton: React.FC<IconTextButtonProps> = ({
  type,
  onClick,
  menuItems,
}) => {
  const meta = buttonMeta[type];

  if (!meta) return null;

  return (
    <ButtonContainer onClick={onClick}>
      <LeftContainer>
        <IconWrapper>{meta.icon}</IconWrapper>
        <TextWrapper>{meta.text}</TextWrapper>
      </LeftContainer>
      {menuItems && menuItems.length > 0 && (
        <TopRightDropdownMenu items={menuItems} color={"#636366"} />
      )}
    </ButtonContainer>
  );
};

export default IconTextButton;

// 스타일 정의
const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: none;
  padding: 6px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background: transparent;
`;
const LeftContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const IconWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TextWrapper = styled.span`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  /* 상자 높이와 동일 또는 150% */
  letter-spacing: 0.38px;

  color: #1c1c1e;
`;
