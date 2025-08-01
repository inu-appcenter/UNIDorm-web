import styled from "styled-components";
import { useNavigate } from "react-router-dom";

interface HomeCardProps {
  index: number;
  id: number;
  content: string;
}

const HomeTipsCard = ({ index, id, content }: HomeCardProps) => {
  const navigate = useNavigate();
  const handleClickCard = () => {
    navigate(`/tips/${id}`);
  };

  return (
    <HomeCardWrapper onClick={handleClickCard}>
      <span className="title">Tip {index}</span>
      <span className="content">{content}</span>
    </HomeCardWrapper>
  );
};

export default HomeTipsCard;

const HomeCardWrapper = styled.div`
  box-sizing: border-box;

  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 32px;

  width: 100%;
  height: fit-content;

  padding: 8px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 8px;

  .title {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 24px;
    letter-spacing: 0.38px;

    color: #0a84ff;
  }
  .content {
    color: black;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0.38px;

    color: #1c1c1e;
  }
`;
