import styled from "styled-components";
import { colors, typography } from "@/styles/tokens";
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
    ${typography.heading2}
    color: ${colors.gray.gray800};
    cursor: pointer;
  }

  .more {
    ${typography.label1Normal}
    color: ${colors.gray.gray500};
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
