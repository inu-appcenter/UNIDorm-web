import styled from "styled-components";
import { colors, typography } from "@/styles/tokens";
import { useNavigate } from "react-router-dom";
import { mixpanelTrack } from "@/utils/mixpanel";

interface HomeCardProps {
  index: number;
  id: number;
  content: string;
}

const HomeTipsCard = ({ index, id, content }: HomeCardProps) => {
  const navigate = useNavigate();
  const handleClickCard = () => {
    mixpanelTrack.tipItemClicked(id, index, "목록형");
    navigate(`/tips/${id}`);
  };

  return (
    <HomeCardWrapper onClick={handleClickCard}>
      <span className="tip-badge">Tip {index}</span>
      <span className="content">{content}</span>
    </HomeCardWrapper>
  );
};

export default HomeTipsCard;

const HomeCardWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  .tip-badge {
    ${typography.caption1}
    color: ${colors.main.main1};
    min-width: fit-content;
    white-space: nowrap;
  }

  .content {
    ${typography.label1Normal}
    color: ${colors.gray.gray800};

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
`;
