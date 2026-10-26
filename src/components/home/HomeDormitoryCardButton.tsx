import styled from "styled-components";
import { ChevronRight } from "lucide-react";
import { colors } from "@/styles/tokens";

export interface HomeDormitoryCardButtonProps {
  onClick: () => void;
  isLoggedIn?: boolean;
  buildingName?: string | null;
  roomNumber?: string | null;
  studentName?: string | null;
  isExpired?: boolean;
  isIssued?: boolean;
}

export interface DormitoryCardDisplayInfo {
  subtitle: string;
  title: string;
  actionText: string;
}

/**
 * 사용자 상태에 따른 카드 텍스트 정보 도출 헬퍼 함수
 */
export function resolveHomeDormitoryCardDisplay({
  isLoggedIn = false,
  buildingName,
  roomNumber,
  studentName,
  isExpired = false,
  isIssued = false,
}: Omit<HomeDormitoryCardButtonProps, "onClick">): DormitoryCardDisplayInfo {
  if (!isLoggedIn) {
    return {
      subtitle: "스마트폰으로 기숙사 출입하기",
      title: "모바일 사생증",
      actionText: "열기",
    };
  }

  if (isExpired) {
    return {
      subtitle: "이용 기간 만료",
      title: "새 학기 사생증 갱신하기",
      actionText: "갱신하기",
    };
  }

  if (isIssued) {
    const locationParts = [buildingName, roomNumber].filter(Boolean);
    const subtitle = locationParts.length > 0 ? locationParts.join(" ") : "생활원 거주 중";
    const title = studentName ? `${studentName} 사생님 출입하기` : "모바일 사생증 출입하기";
    return {
      subtitle,
      title,
      actionText: "출입하기",
    };
  }

  return {
    subtitle: "스마트폰으로 기숙사 출입하기",
    title: "모바일 사생증 발급받기",
    actionText: "발급하기",
  };
}

export default function HomeDormitoryCardButton(props: HomeDormitoryCardButtonProps) {
  const { onClick } = props;
  const { subtitle, title, actionText } = resolveHomeDormitoryCardDisplay(props);

  return (
    <CardContainer
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <TextGroup>
        <Subtitle>{subtitle}</Subtitle>
        <Title>{title}</Title>
      </TextGroup>
      <ActionPill>
        <span>{actionText}</span>
        <ChevronRight size={14} strokeWidth={2.5} />
      </ActionPill>
    </CardContainer>
  );
}

const CardContainer = styled.div`
  width: 100%;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: ${colors.bg.bg1};
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.15s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: #fafbfd;
    border-color: rgba(49, 130, 246, 0.18);
  }

  &:active {
    transform: scale(0.985);
    background: #f2f4f6;
  }
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  margin-right: 12px;
`;

const Subtitle = styled.span`
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  color: ${colors.text.text2};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Title = styled.span`
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  color: ${colors.text.text1};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActionPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: #e8f3ff;
  color: #3182F6;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
  transition: background-color 0.15s ease;

  ${CardContainer}:hover & {
    background: #dbeafe;
  }
`;
