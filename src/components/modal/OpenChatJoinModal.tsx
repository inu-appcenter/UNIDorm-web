import styled from "styled-components";
import { OpenChatRoom } from "@/types/openchat";

interface Props {
  isOpen: boolean;
  room: OpenChatRoom | null;
  onClose: () => void;
  onJoin: () => Promise<boolean>;
  isJoining?: boolean;
}

export default function OpenChatJoinModal({
  isOpen,
  room,
  onClose,
  onJoin,
  isJoining = false,
}: Props) {
  if (!isOpen || !room) return null;

  return (
    <Overlay>
      <ModalBox>
        <Title>참여하시겠습니까?</Title>

        <InfoGroup>
          <Label>방 이름</Label>
          <Value>{room.name}</Value>

          <Label>방 설명</Label>
          <Value>{room.description}</Value>
        </InfoGroup>

        <ButtonRow>
          <CancelButton type="button" onClick={onClose} disabled={isJoining}>
            취소
          </CancelButton>

          <JoinButton type="button" onClick={onJoin} disabled={isJoining}>
            {isJoining ? "참여 중..." : "참여하기"}
          </JoinButton>
        </ButtonRow>
      </ModalBox>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(31, 36, 48, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  width: min(320px, calc(100vw - 32px));
  box-sizing: border-box;
  padding: 30px 24px 22px;
  border-radius: 24px;
  background: #ffffff;
  overflow: hidden;
`;

const Title = styled.h2`
  margin: 0 0 22px;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.35;
  color: #1f2430;
`;

const InfoGroup = styled.div`
  min-width: 0;
  margin-bottom: 24px;
`;

const Label = styled.p`
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
`;

const Value = styled.p`
  display: -webkit-box;
  margin: 0 0 16px;
  max-width: 100%;
  font-size: 15px;
  font-weight: 700;
  color: #4b5563;
  line-height: 1.45;
  overflow: hidden;
  overflow-wrap: anywhere;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  min-width: 0;
`;

const BaseButton = styled.button`
  flex: 1;
  min-width: 0;
  height: 46px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;

const CancelButton = styled(BaseButton)`
  border: 1px solid #3f6bff;
  background: #ffffff;
  color: #3f6bff;
`;

const JoinButton = styled(BaseButton)`
  border: none;
  background: #3f6bff;
  color: #ffffff;
`;
