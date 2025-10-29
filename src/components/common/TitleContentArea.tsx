import styled from "styled-components";
import TitleLine from "../home/TitleLine.tsx";

interface TitleContentAreaProps {
  title?: string; // 공지사항, 기숙사 꿀팁 등
  link?: string;
  description?: string;
  margin?: string;
  children?: React.ReactNode;
}

const TitleContentArea = ({
  title,
  link,
  description,
  margin,
  children,
}: TitleContentAreaProps) => {
  return (
    <TitleContentAreaWrapper>
      <TitleLine title={title} link={link} />
      {description && (
        <DescriptionText $margin={margin}>{description}</DescriptionText>
      )}
      {children}
    </TitleContentAreaWrapper>
  );
};

export default TitleContentArea;

const TitleContentAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: fit-content;

  gap: 8px;
`;

const DescriptionText = styled.p<{ $margin?: string }>`
  font-size: 12px;
  color: #666;
  text-align: start;
  width: 100%;
  margin: 0;
  margin-bottom: ${({ $margin }) => $margin || "0"};
  white-space: pre-line; /* ← 이 부분 추가 */
`;
