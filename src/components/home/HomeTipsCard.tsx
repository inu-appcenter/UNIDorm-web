import styled from "styled-components";
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
    mixpanelTrack.itemClicked("꿀팁", id, content, "홈_오늘의꿀팁");
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
  padding: 4px 0;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  .tip-badge {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 1.5;
    color: #1677ff;
    min-width: fit-content;
  }

  .content {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.5;
    color: #3d3d3d;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
`;
