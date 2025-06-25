import styled from "styled-components";
import TitleLine from "./TitleLine.tsx";

interface BoardAreaProps {
  type: string; //공지사항, 기숙사 꿀팁
  children: React.ReactNode;
}

const BoardArea = ({ type, children }: BoardAreaProps) => {
  return (
    <BoardAreaWrapper>
      <TitleLine title={type}></TitleLine>
      {children}
    </BoardAreaWrapper>
  );
};

export default BoardArea;

const BoardAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  width: 100%;
  height: fit-content;

  gap: 8px;
`;
