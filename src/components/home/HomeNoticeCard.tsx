import styled from "styled-components";
import { colors, typography } from "@/styles/tokens";
import { AiOutlineClockCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "@/utils/dateUtils";
import { mixpanelTrack } from "@/utils/mixpanel";
import { ANNOUNCE_CATEGORY_LIST } from "@/constants/announcement";
import { TypeBadge } from "@/styles/announcement";
import { getLabelByValue } from "@/utils/announceUtils";

interface HomeCardProps {
  id: number;
  title: string;
  content: string;
  isEmergency: boolean;
  createdDate: string;
  type?: (typeof ANNOUNCE_CATEGORY_LIST)[number]["value"];
  order?: number;
  layoutType?: "카드형" | "목록형";
}

const HomeNoticeCard = ({
  id,
  title,
  content,
  isEmergency,
  createdDate,
  type,
  order = 0,
  layoutType = "목록형",
}: HomeCardProps) => {
  const navigate = useNavigate();

  return (
    <NoticeItemWrapper
      onClick={() => {
        mixpanelTrack.noticeItemClicked(
          id,
          type,
          order,
          isEmergency,
          layoutType,
        );
        navigate("/announcements/" + id);
      }}
    >
      <MetaRow>
        <BadgeGroup>
          {type && <TypeBadge type={type}>{getLabelByValue(type)}</TypeBadge>}
          {isEmergency && <EmergencyBadge>긴급</EmergencyBadge>}
        </BadgeGroup>
        <TimeGroup>
          <AiOutlineClockCircle className="clock-icon" />
          <span>{formatTimeAgo(createdDate)}</span>
        </TimeGroup>
      </MetaRow>
      <TitleText>{title}</TitleText>
      <ContentText>{content}</ContentText>
    </NoticeItemWrapper>
  );
};

export default HomeNoticeCard;

const NoticeItemWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  //padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #fcfcfc;
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const BadgeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 22px;
`;

const EmergencyBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 16px;
  background-color: ${colors.main.main1};
  color: ${colors.gray.gray0};
  ${typography.caption1}
  font-weight: 500;
  flex-shrink: 0;
`;

const TitleText = styled.div`
  ${typography.body1Normal}
  color: ${colors.gray.gray800};
  flex: 1;

  /* 2줄 이상 말줄임 설정 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContentText = styled.div`
  ${typography.label1Normal}
  color: ${colors.gray.gray700};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const TimeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  ${typography.caption1}
  color: ${colors.gray.gray500};

  .clock-icon {
    font-size: 14px;
  }
`;
