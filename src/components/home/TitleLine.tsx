import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FaRight from "../../assets/FaRight.svg";

interface TitleLineProps {
  title: string;
  link?: string;
}

const TitleLine = ({ title, link }: TitleLineProps) => {
  const navigate = useNavigate();
  return (
    <TitleLineWrapper>
      <div className="title">{title}</div>
      {link && (
        <div onClick={() => navigate(link)} className="more">
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
  align-items: flex-start;
  padding: 0px;
  gap: 8px;

  width: 100%;
  height: fit-content;

  .title {
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    /* 상자 높이와 동일 또는 175% */

    color: #1c1c1e;
  }

  .body {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 28px;
    /* 상자 높이와 동일 또는 200% */

    color: #8e8e93;
  }

  .more {
    color: #8e8e93;
    display: flex;
    flex-direction: row;
    align-content: start;
    justify-content: start;
    height: fit-content;
    gap: 8px;

    cursor: pointer;
  }
`;
