import styled from "styled-components";
import TitleLine from "../home/TitleLine.tsx";

interface TitleContentAreaProps {
  title?: string;
  link?: string;
  description?: string;
  margin?: string;
  rightAction?: React.ReactNode; // 우측 배치용 프롭 추가
  children?: React.ReactNode;
}

const TitleContentArea = ({
  title,
  link,
  description,
  margin,
  rightAction,
  children,
}: TitleContentAreaProps) => {
  return (
    <TitleContentAreaWrapper>
      <HeaderSection>
        <TextGroup>
          <TitleLine title={title} link={link} />
          {description && (
            <DescriptionText $margin={margin}>{description}</DescriptionText>
          )}
        </TextGroup>
        {rightAction && <ActionGroup>{rightAction}</ActionGroup>}
      </HeaderSection>
      {children}
    </TitleContentAreaWrapper>
  );
};

export default TitleContentArea;

const TitleContentAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  gap: 8px;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between; // 양 끝 정렬
  align-items: center; // 중앙 정렬
  width: 100%;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
`;

const DescriptionText = styled.p<{ $margin?: string }>`
  font-size: 12px;
  color: #666;
  text-align: start;
  width: 100%;
  margin: 0;
  margin-bottom: ${({ $margin }) => $margin || "0"};
  white-space: pre-line;
`;
