import React from "react";
import { useTranslation } from "react-i18next";
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
  children?: React.ReactNode;
}

const EmptyMessage: React.FC<EmptyMessageProps> = ({
  message,
  children,
}) => {
  const { t } = useTranslation("common");
  const displayMessage = message ?? t("states.empty");

  return (
    <EmptyMessageWrapper>{children || displayMessage}</EmptyMessageWrapper>
  );
};

export default EmptyMessage;
