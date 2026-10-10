import React from "react";
import styled from "styled-components";
import { GraduationCap, ChevronRight } from "lucide-react";
import { colors, typography } from "@/styles/tokens";

interface HomeDormitoryCardButtonProps {
  onClick: () => void;
}

export default function HomeDormitoryCardButton({
  onClick,
}: HomeDormitoryCardButtonProps) {
  return (
    <CardContainer onClick={onClick} role="button" tabIndex={0}>
      <LeftContent>
        <IconWrapper>
          <GraduationCap size={22} color="var(--interactive-primary, #3182F6)" />
        </IconWrapper>
        <TextGroup>
          <Title>모바일 사생증</Title>
          <Subtitle>출입 및 배정 호실 간편 확인</Subtitle>
        </TextGroup>
      </LeftContent>
      <ChevronRight size={20} color="var(--text-disabled, #8B95A1)" />
    </CardContainer>
  );
}

const CardContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: ${colors.bg.bg1};
  border-radius: 16px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s ease, background-color 0.15s ease;

  &:hover {
    background: #f7f9fa;
  }

  &:active {
    transform: scale(0.99);
    background: #f2f4f6;
  }
`;

const LeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--blue-50, #e8f3ff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  color: ${colors.text.title};
`;

const Subtitle = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${colors.text.sub};
`;
