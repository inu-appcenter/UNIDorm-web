import styled from "styled-components";
import ChatMessageContent from "./ChatMessageContent";
import ChatBuliLogo from "@/assets/ai-chat/챗불이로고.svg";

type Props = {
  content: string;
  time: string;
  showTime?: boolean;
  unreadCount?: number;
};

const ChatItemBot = ({
  content,
  time,
  showTime = true,
  unreadCount,
}: Props) => {
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
            <HeaderSubtitle>인천대 기숙사 채팅도우미</HeaderSubtitle>
            <HeaderTitle>공지봇</HeaderTitle>
          </HeaderTextGroup>
          <LogoWrapper>
            <BotLogoImage src={ChatBuliLogo} alt="공지봇" />
          </LogoWrapper>
        </CardHeader>
        <CardBody>
          <ChatMessageContent content={content} />
        </CardBody>
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
  width: 244px;
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
  padding: 16px 12px 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 104px;
  box-sizing: border-box;
  overflow: hidden;
`;

const GlowBackground = styled.div`
  position: absolute;
  left: 139.22px;
  top: 27.51px;
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

const CardBody = styled.div`
  background-color: #ffffff;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  padding: 8px 12px 12px 12px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #3d3d3d;
  white-space: pre-wrap;
  word-break: break-word;
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
