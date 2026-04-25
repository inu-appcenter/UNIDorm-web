import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FaRight from "../../assets/FaRight.svg";
import { mixpanelTrack } from "@/utils/mixpanel";

interface TitleLineProps {
  title?: string;
  link?: string;
  externalLink?: string;
  location?: string;
}

const TitleLine = ({ title, link, externalLink, location }: TitleLineProps) => {
  const navigate = useNavigate();

  const handleClickMore = () => {
    if (title) mixpanelTrack.moreClicked(title, location || "알수없음");
    if (link) {
      navigate(link);
    } else if (externalLink) {
      window.open(externalLink, "_blank");
    }
  };

  return (
    <TitleLineWrapper>
      <div className="title" onClick={handleClickMore}>
        {title}
      </div>
      {(link || externalLink) && (
        <div className="more" onClick={handleClickMore}>
          더보기 <img src={FaRight} />
        </div>
      )}
    </TitleLineWrapper>
  );
};

export default TitleLine;

const TitleLineWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  width: 100%;
  height: fit-content;

  .title {
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 28px;

    color: #1c1c1e;
    cursor: pointer;
  }

  .more {
    font-size: 14px;

    color: #8e8e93;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    height: fit-content;
    gap: 8px;

    cursor: pointer;
  }

  img {
    height: 12px;
  }
`;
