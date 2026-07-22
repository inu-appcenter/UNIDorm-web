import styled from "styled-components";
import { colors, typography } from "@/styles/tokens";
import TitleLine from "../home/TitleLine.tsx";

interface TitleContentAreaProps {
  title?: string;
  link?: string;
  externalLink?: string;
  location?: string;
  description?: string;
  margin?: string;
  padding?: string;
  gap?: string; // gap 프롭 추가
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
}

const TitleContentArea = ({
  title,
  link,
  externalLink,
  location,
  description,
  margin,
  padding,
  gap,
  rightAction,
  children,
}: TitleContentAreaProps) => {
  return (
    <TitleContentAreaWrapper $gap={gap}>
      <HeaderSection>
        <TextGroup>
          <TitleLine
            title={title}
            link={link}
            externalLink={externalLink}
            location={location}
          />
          {description && (
            <DescriptionText $margin={margin} $padding={padding}>
              {description}
            </DescriptionText>
          )}
        </TextGroup>
        {rightAction && <ActionGroup>{rightAction}</ActionGroup>}
      </HeaderSection>
      {children}
    </TitleContentAreaWrapper>
  );
};

export default TitleContentArea;

const TitleContentAreaWrapper = styled.div<{ $gap?: string }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  gap: ${({ $gap }) => $gap || "8px"};
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
`;

const DescriptionText = styled.p<{ $margin?: string; $padding?: string }>`
  ${typography.caption1}
  color: ${colors.gray.gray600};
  text-align: start;
  width: 100%;
  margin: ${({ $margin }) => $margin || "0"};
  padding: ${({ $padding }) => $padding || "0"};
  box-sizing: border-box;
  white-space: pre-line;
`;
