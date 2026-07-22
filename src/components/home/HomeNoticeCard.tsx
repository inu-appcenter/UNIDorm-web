import styled from "styled-components";
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
}

const HomeNoticeCard = ({
  id,
  title,
  content,
  isEmergency,
  createdDate,
  type,
}: HomeCardProps) => {
  const navigate = useNavigate();

  return (
    <NoticeItemWrapper
      onClick={() => {
        mixpanelTrack.itemClicked("공지", id, title, "홈_공지사항목록");
        navigate("/announcements/" + id);
      }}
    >
      <TitleRow>
        {isEmergency && <EmergencyBadge>긴급</EmergencyBadge>}
        <TitleText>{title}</TitleText>
      </TitleRow>
      <ContentText>{content}</ContentText>
      <BottomRow>
        {type ? (
          <TypeBadge type={type}>{getLabelByValue(type)}</TypeBadge>
        ) : (
          <div />
        )}
        <TimeGroup>
          <AiOutlineClockCircle className="clock-icon" />
          <span>{formatTimeAgo(createdDate)}</span>
        </TimeGroup>
      </BottomRow>
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

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const EmergencyBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 16px;
  background-color: #1677ff;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
`;

const TitleText = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  color: #3d3d3d;
  flex: 1;

  /* 2줄 이상 말줄임 설정 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContentText = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: #555555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 2px;
`;

const TimeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8b8b8b;

  .clock-icon {
    font-size: 14px;
  }
`;
