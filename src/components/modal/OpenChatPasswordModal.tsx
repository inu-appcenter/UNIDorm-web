import { useState } from "react";
import styled from "styled-components";
import { OpenChatRoom } from "@/types/openchat";

interface Props {
  isOpen: boolean;
  room: OpenChatRoom | null;
  onClose: () => void;
  onJoin: (password: string) => Promise<boolean>;
  isJoining?: boolean;
}

export default function OpenChatPasswordModal({
  isOpen,
  room,
  onClose,
  onJoin,
  isJoining = false,
}: Props) {
  const [password, setPassword] = useState("");

  if (!isOpen || !room) return null;

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  const handleJoin = async () => {
    if (!password.trim() || isJoining) return;

    const joined = await onJoin(password.trim());
    if (joined) setPassword("");
  };

  return (
    <Overlay>
      <ModalBox>
        <Title>비밀번호 입력</Title>

        <InfoGroup>
          <Label>방 이름</Label>
          <Value>{room.name}</Value>

          <Label>입장 비밀번호</Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            type="password"
            disabled={isJoining}
          />
        </InfoGroup>

        <ButtonRow>
          <CancelButton
            type="button"
            onClick={handleClose}
            disabled={isJoining}
          >
            닫기
          </CancelButton>

          <JoinButton
            type="button"
            onClick={handleJoin}
            disabled={!password.trim() || isJoining}
          >
            {isJoining ? "입장 중..." : "입장하기"}
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
  width: 320px;
  padding: 30px 24px 22px;
  border-radius: 24px;
  background: #ffffff;
`;

const Title = styled.h2`
  margin: 0 0 22px;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.35;
  color: #1f2430;
`;

const InfoGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.p`
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
`;

const Value = styled.p`
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: #4b5563;
`;

const PasswordInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #d8dde8;
  border-radius: 16px;
  font-size: 14px;
  color: #1f2430;
  outline: none;

  &::placeholder {
    color: #a1a8b5;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
`;

const BaseButton = styled.button`
  flex: 1;
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
