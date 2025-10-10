import React from "react";

/**
 * 주어진 텍스트에서 URL을 찾아 클릭 가능한 <a> 태그로 변환합니다.
 * 줄바꿈 문자는 <br /> 태그로 처리됩니다.
 * @param content - 변환할 원본 문자열
 * @returns URL이 링크로 변환된 React 요소 배열
 */
const linkify = (content: string) => {
  // URL을 찾기 위한 정규식 (http, https, www)
  const urlRegex = /(https?:\/\/\S+|www\.\S+)/gi;

  // 1. 먼저 텍스트를 줄바꿈(\n) 기준으로 나눕니다.
  return content.split("\n").map((line, lineIndex) => (
    // React.Fragment를 사용하여 불필요한 DOM 요소를 생성하지 않습니다.
    <React.Fragment key={lineIndex}>
      {/* 2. 각 줄을 다시 URL 정규식을 기준으로 나눕니다. */}
      {line.split(urlRegex).map((part, partIndex) => {
        // 3. 나눠진 부분이 URL 형식과 일치하는지 확인합니다.
        if (part.match(urlRegex)) {
          let url = part;
          let trailingChars = ""; // URL 뒤에 붙는 구두점을 저장할 변수

          // URL 끝에 올 수 있는 구두점 목록
          const punctuation = [".", ",", ")", "]", "}", ":", ";", "!"];

          // URL의 마지막 글자가 구두점 목록에 포함되어 있다면, 분리합니다.
          // "...link.)" 와 같이 여러 구두점이 붙어있는 경우를 대비해 while문을 사용합니다.
          while (punctuation.includes(url.slice(-1))) {
            trailingChars = url.slice(-1) + trailingChars;
            url = url.slice(0, -1);
          }

          // 구두점을 분리한 후에도 URL이 남아있는 경우에만 링크로 만듭니다.
          if (url) {
            // "www."로 시작하는 주소는 "http://"를 붙여줍니다.
            const href = url.startsWith("www.") ? `http://${url}` : url;
            return (
              <React.Fragment key={partIndex}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0066cc", textDecoration: "underline" }}
                >
                  {url}
                </a>
                {/* 분리해두었던 구두점을 링크 뒤에 다시 붙여줍니다. */}
                {trailingChars}
              </React.Fragment>
            );
          } else {
            // URL이 비었다면 (e.g. "http://"), 분리된 구두점만 반환합니다.
            return <span key={partIndex}>{trailingChars}</span>;
          }
        }
        // 4. URL이 아닌 일반 텍스트 부분은 그대로 반환합니다.
        return <span key={partIndex}>{part}</span>;
      })}
      {/* 각 줄이 끝날 때마다 줄바꿈 처리를 합니다. */}
      <br />
    </React.Fragment>
  ));
};

export default linkify;
