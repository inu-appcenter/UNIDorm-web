import React from "react";
import styled from "styled-components";

const URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const TRAILING_PUNCTUATION = /[),.!?;:]+$/;

const splitTrailingPunctuation = (value: string) => {
  const punctuation = value.match(TRAILING_PUNCTUATION)?.[0] ?? "";
  return {
    linkText: punctuation ? value.slice(0, -punctuation.length) : value,
    punctuation,
  };
};

export default function ChatMessageContent({ content }: { content: string }) {
  const parts = String(content ?? "").split(URL_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (!part.match(URL_PATTERN)) {
          return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
        }

        const { linkText, punctuation } = splitTrailingPunctuation(part);
        const href = linkText.startsWith("www.")
          ? `https://${linkText}`
          : linkText;

        return (
          <React.Fragment key={`${part}-${index}`}>
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {linkText}
            </Link>
            {punctuation}
          </React.Fragment>
        );
      })}
    </>
  );
}

const Link = styled.a`
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  overflow-wrap: anywhere;
`;
