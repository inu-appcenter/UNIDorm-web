import { useMemo } from "react";
import styled from "styled-components";
import DOMPurify from "dompurify";
import linkify from "@/utils/linkfy";

interface RichTextViewerProps {
  content?: string | null;
  className?: string;
}

export default function RichTextViewer({
  content,
  className,
}: RichTextViewerProps) {
  const safeContent = content ?? "";

  const isHtml = useMemo(() => {
    if (!safeContent) return false;
    return /<[a-z][\s\S]*>/i.test(safeContent);
  }, [safeContent]);

  const sanitizedHtml = useMemo(() => {
    if (!safeContent || !isHtml) return "";

    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A" && node.hasAttribute("href")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });

    const clean = DOMPurify.sanitize(safeContent, {
      ADD_ATTR: ["target"],
    });

    DOMPurify.removeHook("afterSanitizeAttributes");
    return clean;
  }, [safeContent, isHtml]);

  if (!safeContent) {
    return null;
  }

  if (isHtml) {
    return (
      <ViewerContainer
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return (
    <ViewerContainer className={className}>
      {linkify(safeContent)}
    </ViewerContainer>
  );
}

const ViewerContainer = styled.div`
  width: 100%;
  font-size: 15px;
  line-height: 1.65;
  color: #222;
  overflow-x: auto;
  word-break: break-word;
  overflow-wrap: break-word;

  /* 문단 간격 */
  p {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }

  /* 제목 스타일 */
  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 18px 0 8px 0;
    color: #111;
    line-height: 1.4;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 14px 0 6px 0;
    color: #111;
    line-height: 1.4;
  }

  /* 목록 스타일 */
  ul,
  ol {
    padding-left: 22px;
    margin: 8px 0;
  }

  li {
    margin-bottom: 4px;
    line-height: 1.6;
  }

  /* 인용구 스타일 */
  blockquote {
    border-left: 3.5px solid #007aff;
    background-color: #f7f9fc;
    padding: 8px 14px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
    color: #444;

    p {
      margin: 0 0 4px 0;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  /* 가로선 */
  hr {
    border: none;
    border-top: 1px solid #e2e2e2;
    margin: 18px 0;
  }

  /* 굵게, 기울임, 취소선 */
  strong,
  b {
    font-weight: 700;
  }
  em,
  i {
    font-style: italic;
  }
  s,
  strike,
  del {
    text-decoration: line-through;
  }

  /* 링크 스타일 */
  a {
    color: #007aff;
    text-decoration: underline;
    word-break: break-all;
    &:hover {
      opacity: 0.8;
    }
  }

  /* 이미지 */
  img {
    max-width: 100% !important;
    height: auto !important;
    border-radius: 8px;
    margin: 8px 0;
  }

  /* 표 */
  table {
    max-width: 100% !important;
    width: 100% !important;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 13.5px;
  }

  table,
  th,
  td {
    border: 1px solid #ddd;
  }

  th,
  td {
    padding: 8px 10px;
    word-break: keep-all;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
`;
