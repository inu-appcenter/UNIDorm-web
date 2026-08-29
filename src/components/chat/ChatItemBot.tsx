import styled from "styled-components";
import ChatMessageContent from "./ChatMessageContent";
import ChatBuliLogo from "@/assets/ai-chat/챗불이로고.svg";
import useAIChatStore from "@/stores/useAIChatStore";
import { MessageSquarePlus } from "lucide-react";

type Props = {
  content: string;
  time: string;
  showTime?: boolean;
  unreadCount?: number;
  title?: string;
  subtitle?: string;
  isChatBuli?: boolean;
  onMoveToAIChat?: () => void;
  onAskHere?: () => void;
};

const ChatItemBot = ({
  content,
  time,
  showTime = true,
  unreadCount,
  title,
  subtitle,
  isChatBuli,
  onMoveToAIChat,
  onAskHere,
}: Props) => {
  const openChat = useAIChatStore((state) => state.openChat);

  // isChatBuli가 명시되지 않은 경우 title을 기반으로 자동 판정
  const isAIChatBuli =
    isChatBuli !== undefined ? isChatBuli : title === "챗불이";

  const displayTitle =
    title || (isAIChatBuli ? "챗불이" : "공지봇");
  const displaySubtitle =
    subtitle ||
    (isAIChatBuli ? "기숙사 생활 도우미" : "인천대 기숙사 채팅도우미");

  const handleMoveToAIChat = () => {
    if (onMoveToAIChat) {
      onMoveToAIChat();
    } else {
      openChat();
    }
  };

  const unreadLabel =
    typeof unreadCount === "number" && unreadCount > 0
      ? unreadCount > 99
        ? "99+"
        : String(unreadCount)
      : null;

  return (
    <Wrapper>
      <CardContainer>
        <CardHeader>
          <GlowBackground />
          <HeaderTextGroup>
            <HeaderSubtitle>{displaySubtitle}</HeaderSubtitle>
            <HeaderTitle>{displayTitle}</HeaderTitle>
          </HeaderTextGroup>
          <LogoWrapper>
            <BotLogoImage src={ChatBuliLogo} alt={displayTitle} />
          </LogoWrapper>
        </CardHeader>
        <CardBody $hasFooter={isAIChatBuli}>
          <ChatMessageContent content={content} replaceUrlWithShortcut />
        </CardBody>
        {isAIChatBuli && (
          <CardFooter>
            <PrimaryActionButton type="button" onClick={handleMoveToAIChat}>
              <ButtonLogo src={ChatBuliLogo} alt="" />
              챗불이로 이동
            </PrimaryActionButton>
            {onAskHere && (
              <SecondaryActionButton type="button" onClick={onAskHere}>
                <MessageSquarePlus size={14} />
                여기서 질문
              </SecondaryActionButton>
            )}
            <DisclaimerText>
              챗불이는 AI이며, 인천대학교의 공식 답변이 아니에요.
              <br />
              실수할 수 있으니, 중요한 정보는 직접 확인하세요.
            </DisclaimerText>
          </CardFooter>
        )}
      </CardContainer>
      {(showTime || unreadLabel) && (
        <TimeArea>
          {showTime && <span>{time}</span>}
          {unreadLabel && <strong>{unreadLabel}</strong>}
        </TimeArea>
      )}
    </Wrapper>
  );
};

export default ChatItemBot;

const Wrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  width: 100%;
  padding: 8px 20px;
  box-sizing: border-box;
`;

const CardContainer = styled.div`
  width: 100%;
  max-width: 80%;
  min-width: 240px;

  @media (min-width: 1024px) {
    max-width: 520px;
  }

  border: 1px solid #f7f7f7;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.04);
`;

const CardHeader = styled.div`
  position: relative;
  background-color: #f7f7f7;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px 16px 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 104px;
  box-sizing: border-box;
  overflow: hidden;
`;

const GlowBackground = styled.div`
  position: absolute;
  right: 16px;
  top: 20px;
  width: 106.95px;
  height: 106.95px;
  border-radius: 50%;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(255, 214, 102, 0.2) 0%,
    rgba(255, 214, 102, 0) 100%
  );
  pointer-events: none;
  z-index: 0;
`;

const HeaderTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 1;
  word-break: keep-all;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #3d3d3d;
  white-space: nowrap;
`;

const HeaderTitle = styled.h4`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
  color: #3d3d3d;
`;

const LogoWrapper = styled.div`
  position: relative;
  width: 88.74px;
  height: 88.74px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const BotLogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
`;

const CardBody = styled.div<{ $hasFooter?: boolean }>`
  background-color: #ffffff;
  padding: 12px 16px 14px 16px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #3d3d3d;
  white-space: pre-wrap;
  word-break: break-word;
  border-bottom-left-radius: ${({ $hasFooter }) => ($hasFooter ? "0" : "16px")};
  border-bottom-right-radius: ${({ $hasFooter }) => ($hasFooter ? "0" : "16px")};
`;

const CardFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 14px 16px;
  background-color: #ffffff;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;

const PrimaryActionButton = styled.button`
  flex: 1 1 110px;
  min-width: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #bae0ff;
  background-color: #e6f4ff;
  color: #0958d9;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #d0eaff;
  }
  &:active {
    background-color: #bae0ff;
  }
`;

const ButtonLogo = styled.img`
  width: 18px;
  height: 18px;
  object-fit: contain;
`;

const SecondaryActionButton = styled.button`
  flex: 1 1 110px;
  min-width: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  background-color: #fafafa;
  color: #555555;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f0f0f0;
  }
  &:active {
    background-color: #e8e8e8;
  }
`;

const DisclaimerText = styled.p`
  width: 100%;
  margin: 6px 0 0 0;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.45;
  color: #8b8b8b;
  text-align: left;
  word-break: keep-all;
`;

const TimeArea = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  font-family: "Pretendard", sans-serif;
  font-size: 11px;
  line-height: 1.5;
  color: #8b8b8b;

  strong {
    color: #0958d9;
    font-weight: 600;
  }
`;
