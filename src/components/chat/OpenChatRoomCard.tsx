import styled from "styled-components";
import { OpenChatRoom, OpenChatTab } from "@/types/openchat";

interface Props {
  room: OpenChatRoom;
  tab: OpenChatTab;
  onClick: () => void;
}

export default function OpenChatRoomCard({ room, tab, onClick }: Props) {
  const isMyChatRoom = tab === "MY";

  if (isMyChatRoom) {
    return (
      <Card type="button" onClick={onClick}>
        <MyTopRow>
          <TextArea>
            <RoomName>{room.name}</RoomName>
            <LastMessage>{room.lastMessage || room.description}</LastMessage>
          </TextArea>

          <RightArea>
            <TimeText>{room.lastMessageAt ? "방금" : ""}</TimeText>

            {room.unreadCount > 0 && (
              <UnreadBadge>{room.unreadCount}</UnreadBadge>
            )}
          </RightArea>
        </MyTopRow>
      </Card>
    );
  }

  return (
    <OpenCard type="button" onClick={onClick}>
      <OpenTopArea>
        <RoomName>{room.name}</RoomName>
        <Description>{room.description}</Description>
      </OpenTopArea>

      <OpenBottomRow>
        <MetaArea>
          <MetaText>{room.currentParticipants}명</MetaText>
          <Divider />
          <MetaText>{room.lastMessageAt ? "방금 대화" : "대화 없음"}</MetaText>
        </MetaArea>

        <JoinButtonText>참여하기</JoinButtonText>
      </OpenBottomRow>

      <PublicBadge>{room.public ? "공개" : "비공개"}</PublicBadge>
    </OpenCard>
  );
}

const Card = styled.button`
  width: 100%;
  min-height: 108px;
  padding: 16px;
  border: 1px solid #e4e7ec;
  border-radius: 16px;
  background-color: #ffffff;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
`;

const OpenCard = styled(Card)`
  min-height: 132px;
  position: relative;
`;

const MyTopRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 16px;
`;

const TextArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoomName = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.3;
  color: #111827;
  word-break: keep-all;
`;

const LastMessage = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  line-height: 1.45;
  word-break: keep-all;
`;

const RightArea = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
`;

const TimeText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #a1a8b5;
`;

const UnreadBadge = styled.span`
  min-width: 36px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background-color: #2563eb;
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OpenTopArea = styled.div`
  margin-bottom: 24px;
`;

const Description = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  line-height: 1.45;
  word-break: keep-all;
`;

const OpenBottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MetaArea = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const MetaText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
`;

const Divider = styled.span`
  width: 1px;
  height: 18px;
  background-color: #d1d5db;
`;

const JoinButtonText = styled.span`
  width: 86px;
  height: 40px;
  border: 1px solid #2563eb;
  border-radius: 999px;
  color: #3f6bff;
  font-size: 15px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PublicBadge = styled.span`
  position: absolute;
  left: 16px;
  bottom: 16px;
  min-width: 58px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid #d8dde8;
  border-radius: 999px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
`;
