import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { OpenChatTab } from "@/types/openchat";

interface Props {
  tab: OpenChatTab;
  onClickMoveDormitory?: () => void;
}

export default function OpenChatEmptyState({
  tab,
  onClickMoveDormitory,
}: Props) {
  const { t } = useTranslation("chat");
  const isMyChat = tab === "MY";

  return (
    <Container>
      {isMyChat ? (
        <>
          <TextGroup>
            <Title>{t("openChat.emptyTitle")}</Title>
            <Description>{t("openChat.emptyDescription")}</Description>
          </TextGroup>

          <MoveButton type="button" onClick={onClickMoveDormitory}>
            {t("tabs.open")}
          </MoveButton>
        </>
      ) : (
        <TextGroup>
          <Title>{t("openChat.emptyTitle")}</Title>
          <Description>{t("openChat.emptyDescription")}</Description>
        </TextGroup>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  padding: 24px 16px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0px 4px 7px rgba(223, 223, 223, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  box-sizing: border-box;
  margin-top: 16px;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  color: #3d3d3d;
  word-break: keep-all;
`;

const Description = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #8b8b8b;
  text-align: center;
  word-break: keep-all;
`;

const MoveButton = styled.button`
  width: 140px;
  height: 38px;
  border: none;
  border-radius: 20px;
  background-color: #1677ff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0958d9;
  }
`;
