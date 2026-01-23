import styled from "styled-components";
import { useState } from "react";

const FCMPage = () => {
  const token = localStorage.getItem("fcmToken");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (token) {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // 1.5초 후 "복사됨" 표시 제거
    }
  };
  return (
    <FCMPageWrapper>
      <div>
        <p>{token}</p>
      </div>
      <CopyButton onClick={handleCopy}>
        {copied ? "복사됨 ✅" : "복사하기"}
      </CopyButton>
    </FCMPageWrapper>
  );
};

export default FCMPage;

const FCMPageWrapper = styled.div`
  width: 100%;
  padding: 16px;

  padding-top: 60px;
  box-sizing: border-box;
  word-break: break-all; /* 단어가 길면 줄바꿈 */
  overflow-wrap: anywhere; /* 최신 브라우저 호환성 */
  white-space: pre-wrap; /* 공백과 줄바꿈 유지 */
`;

const CopyButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #0056b3;
  }
`;
