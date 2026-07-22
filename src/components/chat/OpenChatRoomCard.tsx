import styled from "styled-components";
import { OpenChatRoom, OpenChatTab } from "@/types/openchat";
import { Lock, Unlock, User } from "lucide-react";

interface Props {
  room: OpenChatRoom;
  tab: OpenChatTab;
  onClick: () => void;
}

export default function OpenChatRoomCard({ room, tab, onClick }: Props) {
  const isMyChatRoom = tab === "MY";

  const formatActivityTime = (isoString: string) => {
    if (!isoString) return "대화 없음";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "방금 대화";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return date.toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (isMyChatRoom) {
    return (
      <Card type="button" onClick={onClick}>
        <LeftArea>
          <TextArea>
            <RoomName>{room.name}</RoomName>
            <LastMessage>{room.lastMessage || room.description}</LastMessage>
          </TextArea>

          <MetaArea>
            <MetaItem>
              {(room.isPublic ?? room.public) ? <Unlock size={14} /> : <Lock size={14} />}
              <span>{(room.isPublic ?? room.public) ? "공개" : "비공개"}</span>
            </MetaItem>

            <MetaItem>
              <User size={14} />
              <span>{room.currentParticipants}</span>
            </MetaItem>
          </MetaArea>
        </LeftArea>

        <RightArea>
          <TimeText>{room.lastMessageAt ? formatActivityTime(room.lastMessageAt) : ""}</TimeText>
          {room.unreadCount > 0 && (
            <UnreadBadge>{room.unreadCount > 99 ? "99+" : room.unreadCount}</UnreadBadge>
          )}
        </RightArea>
      </Card>
    );
  }

  return (
    <Card type="button" onClick={onClick}>
      <LeftArea>
        <TextArea>
          <RoomName>{room.name}</RoomName>
          <Description>{room.description}</Description>
        </TextArea>

        <MetaArea>
          <MetaItem>
            {(room.isPublic ?? room.public) ? <Unlock size={14} /> : <Lock size={14} />}
            <span>{(room.isPublic ?? room.public) ? "공개" : "비공개"}</span>
          </MetaItem>

          <MetaItem>
            <User size={14} />
            <span>{room.currentParticipants}</span>
          </MetaItem>

          <Divider />

          <TimeText className="activity">
            {formatActivityTime(room.lastMessageAt)}
          </TimeText>
        </MetaArea>
      </LeftArea>

      {room.joined ? (
        <JoinedButtonText>참여 중</JoinedButtonText>
      ) : (
        <JoinButtonText>참여하기</JoinButtonText>
      )}
    </Card>
  );
}

const Card = styled.button`
  width: 100%;
  padding: 16px;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  background-color: #ffffff;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  box-sizing: border-box;
`;

const LeftArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-width: 0;
`;

const TextArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RoomName = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: #3d3d3d;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastMessage = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: #8b8b8b;
  line-height: 1.5;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Description = styled(LastMessage)``;

const MetaArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #8b8b8b;
`;

const Divider = styled.span`
  width: 1px;
  height: 14px;
  background-color: #dfdfdf;
`;

const TimeText = styled.span`
  font-size: 12px;
  color: #8b8b8b;

  &.activity {
    color: #555555;
  }
`;

const RightArea = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-left: 12px;
`;

const UnreadBadge = styled.span`
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background-color: #1677ff;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

const JoinButtonText = styled.span`
  background-color: #1677ff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 12px;
`;

const JoinedButtonText = styled(JoinButtonText)`
  background-color: transparent;
  color: #1677ff;
  border: 1px solid #1677ff;
`;
