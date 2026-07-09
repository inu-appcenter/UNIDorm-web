import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSetHeader } from "@/hooks/useSetHeader";

interface NotificationOption {
  id: number;
  title: string;
  desc: string;
}

export default function ChatNotificationSettingsPage() {
  const navigate = useNavigate();

  // 피그마와 일치하도록 기본값은 2번 옵션("같은 채팅방 묶어서 받기")으로 설정합니다.
  const [selectedId, setSelectedId] = useState<number>(2);

  const options: NotificationOption[] = [
    {
      id: 1,
      title: "메시지 올 때마다 받기",
      desc: "새 메시지가 올 때 바로 알림",
    },
    {
      id: 2,
      title: "같은 채팅방 묶어서 받기",
      desc: "같은 방 알림을 묶어서 한 번에 표시",
    },
    {
      id: 3,
      title: "알림 끄기",
      desc: "해당 채팅방 알림을 받지 않음",
    },
  ];

  // 공용 헤더 설정
  useSetHeader({
    title: "채팅방 알림 설정",
  });

  const handleSelectOption = (optionId: number) => {
    setSelectedId(optionId);
    alert("알림 설정이 변경되었습니다.");
    // 피그마 시안 동작 흐름에 맞춰 설정 변경 시 이전 화면(참여 인원)으로 복귀
    navigate(-1);
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Heading>알림 방식 선택</Heading>
        <OptionList>
          {options.map((opt) => {
            const isActive = selectedId === opt.id;
            return (
              <OptionCard 
                key={opt.id} 
                $active={isActive}
                onClick={() => handleSelectOption(opt.id)}
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
