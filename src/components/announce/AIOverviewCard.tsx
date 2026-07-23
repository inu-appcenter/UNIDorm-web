import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import styled from "styled-components";
import type { AnnouncementPost } from "@/types/announcements";
import { colors, typography } from "@/styles/tokens";

interface AIOverviewCardProps {
  query: string;
  answer: string;
  isLoading: boolean;
  error: string | null;
  notices: AnnouncementPost[];
  onOpenChat: () => void;
  onOpenNotice: (noticeId: number) => void;
}

interface ParsedAnswer {
  content: string;
  sources: string[];
}

function parseAnswer(answer: string): ParsedAnswer {
  const sourceMarker = answer.match(
    /(?:^|\r?\n)\s*(?:sources?|출처)\s*:\s*/i,
  );

  if (sourceMarker?.index === undefined) {
    return {
      content: answer.replace(/\*\*/g, ""),
      sources: [],
    };
  }

  const sourceStart = sourceMarker.index + sourceMarker[0].length;

  return {
    content: answer
      .slice(0, sourceMarker.index)
      .trimEnd()
      .replace(/\*\*/g, ""),
    sources: answer
      .slice(sourceStart)
      .split(/\r?\n/)
      .map((source) => source.trim())
      .filter(Boolean),
  };
}

function formatNoticeDate(date: string) {
  const isoDate = date.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (isoDate) return isoDate;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(parsedDate)
    .replace(/\. /g, "-")
    .replace(".", "");
}

export default function AIOverviewCard({
  query,
  answer,
  isLoading,
  error,
  notices,
  onOpenChat,
  onOpenNotice,
}: AIOverviewCardProps) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const parsedAnswer = useMemo(() => parseAnswer(answer), [answer]);
  const relatedNotices = notices.slice(0, 3);

  useEffect(() => {
    setIsSourcesOpen(false);
  }, [query]);

  return (
    <Section aria-labelledby="ai-overview-title">
      <SectionTitle id="ai-overview-title">
        <Sparkles size={18} aria-hidden />
        AI 개요
      </SectionTitle>

      <Card>
        <FeaturedTitle>“{query}”에 대한 챗불이 답변</FeaturedTitle>
        <Summary aria-live="polite">
          {error ||
            parsedAnswer.content ||
            (isLoading ? "챗불이가 답변을 찾고 있어요..." : "")}
        </Summary>
        {isLoading && <LoadingText>답변을 작성하고 있어요...</LoadingText>}

        {!error && parsedAnswer.sources.length > 0 && (
          <SourceDisclosure>
            <SourceToggle
              type="button"
              aria-expanded={isSourcesOpen}
              aria-controls="ai-answer-sources"
              onClick={() => setIsSourcesOpen((isOpen) => !isOpen)}
            >
              출처 자세히 보기 {isSourcesOpen ? "접기" : "···"}
            </SourceToggle>
            <SourcePanel
              id="ai-answer-sources"
              $isOpen={isSourcesOpen}
            >
              <SourceList>
                {parsedAnswer.sources.map((source, index) => {
                  const url = source.match(/https?:\/\/\S+/)?.[0];
                  const label = url
                    ? source
                        .replace(url, "")
                        .replace(/\s*-\s*$/, "")
                        .trim()
                    : source;

                  return (
                    <li key={`${source}-${index}`}>
                      {label && <span>{label}</span>}
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={isSourcesOpen ? 0 : -1}
                        >
                          원문 보기
                        </a>
                      )}
                    </li>
                  );
                })}
              </SourceList>
            </SourcePanel>
          </SourceDisclosure>
        )}

        {relatedNotices.length > 0 && (
          <RelatedNoticeList aria-label={`${query} 관련 공지`}>
            {relatedNotices.map((notice) => (
              <RelatedNoticeButton
                key={notice.id}
                type="button"
                onClick={() => onOpenNotice(notice.id)}
              >
                <time dateTime={notice.createdDate}>
                  {formatNoticeDate(notice.createdDate)}
                </time>
                <span>{notice.title}</span>
              </RelatedNoticeButton>
            ))}
          </RelatedNoticeList>
        )}

        <ChatButton type="button" onClick={onOpenChat}>
          <Sparkles size={16} aria-hidden />
          챗불이 AI 사용해보기
        </ChatButton>
      </Card>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitle = styled.h2`
  ${typography.headline2}
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: ${colors.gray.gray800};

  svg {
    color: ${colors.main.main4};
    fill: ${colors.main.main4};
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 16px 14px;
  border: 1px solid ${colors.gray.gray100};
  border-radius: 12px;
  background: ${colors.bg.bg1};
  box-shadow: 0 2px 8px rgba(36, 36, 36, 0.06);
`;

const FeaturedTitle = styled.h3`
  ${typography.body1Normal}
  margin: 0;
  color: ${colors.gray.gray900};
`;

const Summary = styled.p`
  ${typography.label1Reading}
  min-height: 21px;
  margin: 0;
  color: ${colors.gray.gray700};
  white-space: pre-line;
`;

const LoadingText = styled.p`
  ${typography.caption1}
  margin: -6px 0 0;
  color: ${colors.gray.gray400};
`;

const SourcePanel = styled.div<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => ($isOpen ? "320px" : "0")};
  margin-top: ${({ $isOpen }) => ($isOpen ? "8px" : "0")};
  overflow-y: auto;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition:
    max-height 0.2s ease,
    margin-top 0.2s ease,
    opacity 0.2s ease;
`;

const SourceDisclosure = styled.div`
  align-self: flex-start;
  max-width: 100%;

  @media (hover: hover) {
    &:hover ${SourcePanel} {
      max-height: 320px;
      margin-top: 8px;
      opacity: 1;
    }
  }
`;

const SourceToggle = styled.button`
  ${typography.caption1}
  padding: 0;
  border: 0;
  background: transparent;
  color: ${colors.gray.gray500};
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: ${colors.gray.gray700};
    text-decoration: underline;
  }
`;

const SourceList = styled.ol`
  ${typography.caption1}
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding-left: 0;
  color: ${colors.gray.gray500};
  list-style: none;
  word-break: break-word;

  li {
    padding-left: 2px;
  }

  span {
    margin-right: 6px;
  }

  a {
    color: ${colors.main.main1};
    font-weight: 600;
    white-space: nowrap;
  }
`;

const RelatedNoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid ${colors.gray.gray100};
`;

const RelatedNoticeButton = styled.button`
  ${typography.caption1}
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${colors.gray.gray400};
  text-align: left;
  cursor: pointer;

  time {
    white-space: nowrap;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover,
  &:focus-visible {
    color: ${colors.gray.gray700};
    text-decoration: underline;
  }
`;

const ChatButton = styled.button`
  ${typography.label1Normal}
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 40px;
  margin-top: 2px;
  border: 1px solid ${colors.main.main1};
  border-radius: 999px;
  background: ${colors.bg.bg1};
  color: ${colors.gray.gray800};
  font-weight: 600;
  cursor: pointer;

  svg {
    color: ${colors.main.main1};
  }

  &:active {
    background: ${colors.blue.blue100};
  }
`;
