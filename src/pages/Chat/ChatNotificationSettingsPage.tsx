import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useSetHeader } from "@/hooks/useSetHeader";
import {
  getOpenChatNotificationMode,
  updateOpenChatNotificationMode,
  NotificationMode,
} from "@/apis/chat";

interface NotificationOption {
  title: string;
  desc: string;
  mode: NotificationMode;
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    title: "메시지 올 때마다 받기",
    desc: "새 메시지가 올 때 바로 알림을 받아요.",
    mode: "EVERY",
  },
  {
    title: "1시간마다 모아 받기",
    desc: "새 메시지가 올 때마다 알림을 받지 않고, 1시간마다 모아서 채팅 알림을 받아요.",
    mode: "BUNDLED",
  },
  {
    title: "알림 끄기",
    desc: "새 메시지가 와도 알림을 받지 않아요.",
    mode: "OFF",
  },
];

export default function ChatNotificationSettingsPage() {
  const { id } = useParams();
  const roomId = Number(id);

  const [selectedMode, setSelectedMode] = useState<NotificationMode | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* 공용 헤더 설정 */
  useSetHeader({
    title: "채팅방 알림 설정",
  });

  /* 현재 알림 모드 조회 */
  useEffect(() => {
    if (!roomId) return;

    const fetchNotificationMode = async () => {
      try {
        setIsLoading(true);
        const res = await getOpenChatNotificationMode(roomId);
        setSelectedMode(res.data.mode);
      } catch (error) {
        console.error("알림 모드 조회 실패:", error);
        alert("알림 설정을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationMode();
  }, [roomId]);

  const handleSelectOption = async (option: NotificationOption) => {
    if (isSubmitting || isLoading || selectedMode === option.mode) return;

    setIsSubmitting(true);
    try {
      await updateOpenChatNotificationMode(roomId, option.mode);
      setSelectedMode(option.mode);
    } catch (error) {
      console.error("알림 설정 변경 실패:", error);
      alert("알림 설정 변경에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Heading>설정값은 이 채팅방에만 적용돼요.</Heading>
        {isLoading ? (
          <LoadingText>설정을 불러오는 중입니다...</LoadingText>
        ) : (
          <OptionList>
            {NOTIFICATION_OPTIONS.map((opt) => {
              const isActive = selectedMode === opt.mode;
              return (
                <OptionCard
                  key={opt.mode}
                  $active={isActive}
                  onClick={() => handleSelectOption(opt)}
                >
                  <RadioCircle $active={isActive}>
                    {isActive && <RadioDot />}
                  </RadioCircle>
                  <TextGroup>
                    <OptionTitle>{opt.title}</OptionTitle>
                    <OptionDesc>{opt.desc}</OptionDesc>
                  </TextGroup>
                </OptionCard>
              );
            })}
          </OptionList>
        )}
      </ContentContainer>
    </PageContainer>
  );
}

/* Styled Components */
const PageContainer = styled.div`
  width: 100%;
  height: calc(100vh - 70px);
  background-color: #ffffff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  box-sizing: border-box;
`;

const Heading = styled.h3`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #3d3d3d;
  text-align: left;
`;

const LoadingText = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  color: #8b8b8b;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const OptionCard = styled.div<{ $active: boolean }>`
  background-color: #ffffff;
  border: 1px solid ${({ $active }) => ($active ? "#1677ff" : "#dfdfdf")};
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #fcfcfc;
  }
`;

const RadioCircle = styled.div<{ $active: boolean }>`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ $active }) => ($active ? "#1677ff" : "#dfdfdf")};
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
`;

const RadioDot = styled.div`
  width: 10px;
  height: 10px;
  background-color: #1677ff;
  border-radius: 50%;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
`;

const OptionTitle = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #3d3d3d;
`;

const OptionDesc = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: #8b8b8b;
`;
