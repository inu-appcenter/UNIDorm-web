import styled from "styled-components";
import TitleLine from "../home/TitleLine.tsx";

interface TitleContentAreaProps {
  type: string; //공지사항, 기숙사 꿀팁
  link?: string;
  children: React.ReactNode;
}

const TitleContentArea = ({ type, link, children }: TitleContentAreaProps) => {
  return (
    <TitleConentAreaWrapper>
      <TitleLine title={type} link={link}></TitleLine>
      {children}
    </TitleConentAreaWrapper>
  );
};

export default TitleContentArea;

const TitleConentAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  width: 100%;
  height: fit-content;

  gap: 8px;
`;
