import React from "react";
import styled from "styled-components";

const EmptyMessageWrapper = styled.div`
  padding: 24px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
`;

interface EmptyMessageProps {
  message?: string;
}

const EmptyMessage: React.FC<EmptyMessageProps> = ({
  message = "데이터가 없습니다.",
}) => {
  return <EmptyMessageWrapper>{message}</EmptyMessageWrapper>;
};

export default EmptyMessage;
