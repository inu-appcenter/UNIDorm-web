import styled from "styled-components";

interface TitleLineProps {
  title: string;
}

const TitleLine = ({ title }: TitleLineProps) => {
  return (
    <TitleLineWrapper>
      <div className="title">{title}</div>
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
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    /* 상자 높이와 동일 또는 150% */
    display: flex;
    align-items: center;
    letter-spacing: 0.38px;

    color: #1c1c1e;
  }
`;
