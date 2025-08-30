import React from "react";
import { CheckCircle, Inbox, MessageSquare, User } from "lucide-react";
import styled, { css } from "styled-components";

interface StepFlowProps {
  activeIndex: number; // 0: 대기중, 1: 담당자 배정, 2: 처리중, 3: 처리완료
  assignee?: string; // 담당자가 정해졌을 경우 이름
  handleStatus?: (arg0: string) => void;
}

interface StepItemProps {
  label: string;
  active?: boolean;
  completed?: boolean;
  icon: React.ReactNode;
  extraLabel?: string;
  handleStatus?: (arg0: string) => void;
}

const StepItem: React.FC<StepItemProps> = ({
  label,
  icon,
  active,
  completed,
  extraLabel,
  handleStatus,
}) => (
  <StepItemWrapper
    active={active}
    completed={completed}
    onClick={() => {
      if (!handleStatus) return;
      handleStatus(label);
    }}
  >
    <StepIcon active={active} completed={completed}>
      {icon}
    </StepIcon>
    <div className="title">
      {label}
      <br />
      {extraLabel ? ` (${extraLabel})` : ""}
    </div>
  </StepItemWrapper>
);

const StepFlow: React.FC<StepFlowProps> = ({
  activeIndex,
  assignee,
  handleStatus,
}) => {
  return (
    <StepContainer>
      <StepItem
        label="대기중"
        icon={<Inbox />}
        active={activeIndex === 0}
        completed={activeIndex > 0}
        handleStatus={handleStatus}
      />
      <Separator>...</Separator>

      <StepItem
        label="담당자 배정"
        icon={<User />}
        active={activeIndex === 1}
        completed={activeIndex > 1}
        extraLabel={assignee}
        handleStatus={handleStatus}
      />
      <Separator>...</Separator>
      <StepItem
        label="처리중"
        icon={<MessageSquare />}
        active={activeIndex === 2}
        completed={activeIndex > 2}
        handleStatus={handleStatus}
      />
      <Separator>...</Separator>

      <StepItem
        label="처리완료"
        icon={<CheckCircle />}
        active={activeIndex === 3}
        handleStatus={handleStatus}
      />
    </StepContainer>
  );
};

export default StepFlow;

const StepContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 1rem;
  padding: 16px;
  position: relative;

  width: 100%;
  box-sizing: border-box;

  box-shadow: 2px 4px 8px 0 rgba(0, 0, 0, 0.06);
`;

const StepItemWrapper = styled.div<{ active?: boolean; completed?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  position: relative;

  cursor: pointer;

  .title {
    text-align: center;
    height: 25px;
    color: #9ca3af;

    ${({ active }) =>
      active &&
      css`
        color: #1c1c1e;
        font-weight: 600;
      `}
  }
`;

const StepIcon = styled.div<{ active?: boolean; completed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  max-width: 40px;
  height: 40px;
  max-height: 40px;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 50%;
  background: #e7f3ff;
  margin-bottom: 0.25rem;
  z-index: 1;

  ${({ active }) =>
    active &&
    css`
      background: #0a84ff;
      color: #f4f4f4;
    `}

  ${({ completed }) =>
    completed &&
    css`
      background: #e7f3ff;
      color: #8e8e93;
    `}

  svg {
    width: 100%;
    height: 100%;
  }
`;

const Separator = styled.div`
  font-size: 1.2rem;
  color: #d9d9d9;
  height: 68px;
`;
