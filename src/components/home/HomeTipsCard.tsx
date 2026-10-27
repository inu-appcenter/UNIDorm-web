import styled from "styled-components";
import { colors, typography } from "@/styles/tokens";
import { useNavigate } from "react-router-dom";
import { mixpanelTrack } from "@/utils/mixpanel";
import { stripHtmlTags } from "@/utils/text";

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
      <span className="content">{stripHtmlTags(content)}</span>
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
  width: calc(100% + 16px);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  padding: 6px 8px;
  margin: -3px -8px;
  border-radius: 8px;

  /* Apple 스타일 미세 탭 피드백 */
  transition: background-color 0.12s ease, transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background-color: #f7f9fa;
  }

  &:active {
    background-color: #f2f4f6;
    transform: scale(0.99);
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
