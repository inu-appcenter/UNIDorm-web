import React from "react";
import styled from "styled-components";

interface Props {
  content: string;
  replaceUrlWithShortcut?: boolean;
}

const TRAILING_PUNCTUATION = /[),.!?;:>}\]]+$/;

export default function ChatMessageContent({
  content,
  replaceUrlWithShortcut = false,
}: Props) {
  const text = String(content ?? "");
  if (!text) return null;

  const lines = text.split(/\r?\n/);

  return (
    <Container>
      {lines.map((line, lineIdx) => {
        // Heading (#, ##, ###, ####)
        const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const headingText = headingMatch[2];
          return (
            <Heading key={lineIdx} $level={level}>
              {parseInlineMarkdown(headingText, replaceUrlWithShortcut)}
            </Heading>
          );
        }

        // Bullet list item: - item, * item, • item
        const bulletMatch = line.match(/^(\s*)([-*•])\s+(.+)$/);
        if (bulletMatch) {
          const indent = bulletMatch[1].length;
          const itemText = bulletMatch[3];
          return (
            <ListItem key={lineIdx} $indent={indent}>
              <BulletIcon>•</BulletIcon>
              <ItemContent>
                {parseInlineMarkdown(itemText, replaceUrlWithShortcut)}
              </ItemContent>
            </ListItem>
          );
        }

        // Numbered list item: 1. item
        const numberedMatch = line.match(/^(\s*)(\d+)[.)]\s+(.+)$/);
        if (numberedMatch) {
          const num = numberedMatch[2];
          const itemText = numberedMatch[3];
          return (
            <ListItem key={lineIdx} $indent={0}>
              <NumberBadge>{num}.</NumberBadge>
              <ItemContent>
                {parseInlineMarkdown(itemText, replaceUrlWithShortcut)}
              </ItemContent>
            </ListItem>
          );
        }

        // Empty line
        if (!line.trim()) {
          return <EmptyLine key={lineIdx} />;
        }

        // Regular line
        return (
          <TextLine key={lineIdx}>
            {parseInlineMarkdown(line, replaceUrlWithShortcut)}
          </TextLine>
        );
      })}
    </Container>
  );
}

function parseInlineMarkdown(
  text: string,
  replaceUrlWithShortcut: boolean,
): React.ReactNode[] {
  // Matches:
  // 1. Markdown link: [label](url)
  // 2. URL link: https://... or http://... or www....
  // 3. Inline code: `code`
  // 4. Bold: **bold** or __bold__
  // 5. Italic: *italic* or _italic_
  const tokenRegex =
    /(\[([^\]]+)\]\((https?:\/\/[^\s)]+|www\.[^\s)]+)\)|https?:\/\/[^\s<>]+|www\.[^\s<>]+|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/gi;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const fullMatch = match[0];
    const linkLabel = match[2];
    const linkUrl = match[3];
    const codeContent = match[4];
    const boldAsterisk = match[5];
    const boldUnderscore = match[6];
    const italicAsterisk = match[7];
    const italicUnderscore = match[8];

    if (linkLabel && linkUrl) {
      const cleanLinkUrl = linkUrl.replace(/^<|>$/g, "");
      const href = cleanLinkUrl.startsWith("www.")
        ? `https://${cleanLinkUrl}`
        : cleanLinkUrl;
      const isRawUrlLabel =
        linkLabel.startsWith("http://") ||
        linkLabel.startsWith("https://") ||
        linkLabel.startsWith("www.");
      const displayLabel =
        replaceUrlWithShortcut && isRawUrlLabel ? "바로가기" : linkLabel;

      nodes.push(
        <StyledLink
          key={`${match.index}-mdlink`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {displayLabel}
        </StyledLink>,
      );
    } else if (
      fullMatch.startsWith("http://") ||
      fullMatch.startsWith("https://") ||
      fullMatch.startsWith("www.")
    ) {
      const cleanUrl = fullMatch.replace(TRAILING_PUNCTUATION, "");
      const trailingPunc = fullMatch.slice(cleanUrl.length);
      const href = cleanUrl.startsWith("www.")
        ? `https://${cleanUrl}`
        : cleanUrl;

      nodes.push(
        <StyledLink
          key={`${match.index}-urllink`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {replaceUrlWithShortcut ? "바로가기" : cleanUrl}
        </StyledLink>,
      );
      if (trailingPunc) {
        nodes.push(trailingPunc);
      }
    } else if (codeContent !== undefined) {
      nodes.push(
        <InlineCode key={`${match.index}-code`}>{codeContent}</InlineCode>,
      );
    } else if (boldAsterisk !== undefined || boldUnderscore !== undefined) {
      nodes.push(
        <BoldText key={`${match.index}-bold`}>
          {boldAsterisk ?? boldUnderscore}
        </BoldText>,
      );
    } else if (italicAsterisk !== undefined || italicUnderscore !== undefined) {
      nodes.push(
        <em key={`${match.index}-italic`}>
          {italicAsterisk ?? italicUnderscore}
        </em>,
      );
    } else {
      nodes.push(fullMatch);
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  word-break: break-word;
`;

const TextLine = styled.div`
  line-height: 1.5;
`;

const EmptyLine = styled.div`
  height: 8px;
`;

const Heading = styled.div<{ $level: number }>`
  font-weight: 700;
  font-size: ${({ $level }) => ($level === 1 ? "16px" : $level === 2 ? "15px" : "14px")};
  margin-top: 4px;
  margin-bottom: 2px;
  color: #222222;
  line-height: 1.4;
`;

const ListItem = styled.div<{ $indent?: number }>`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding-left: ${({ $indent }) => ($indent ? `${$indent * 10}px` : "0")};
  line-height: 1.5;
`;

const BulletIcon = styled.span`
  flex-shrink: 0;
  font-weight: 700;
  color: #888888;
`;

const NumberBadge = styled.span`
  flex-shrink: 0;
  font-weight: 600;
  color: #666666;
  font-size: 13px;
`;

const ItemContent = styled.span`
  flex: 1;
`;

const BoldText = styled.strong`
  font-weight: 700;
  color: inherit;
`;

const InlineCode = styled.code`
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 1px 4px;
  font-family: monospace;
  font-size: 0.9em;
  color: #0958d9;
`;

const StyledLink = styled.a`
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-all;
  font-weight: 500;

  &:hover {
    color: #0958d9;
  }
`;
