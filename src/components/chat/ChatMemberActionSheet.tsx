import { useState } from "react";
import { Drawer } from "vaul";
import styled from "styled-components";
import { OpenChatParticipant } from "@/types/openchat";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: OpenChatParticipant | null;
  chatType: "open" | "personal" | "roommate" | string;
  isHost: boolean;
  isBlocked: boolean;
  onBlockUser: () => Promise<void>;
  onCreatePersonalChat?: () => Promise<void>;
  onTransferHost?: () => Promise<void>;
  onKickUser?: () => Promise<void>;
  onRequestStudentIdDisclosure?: () => Promise<void> | void;
}

export default function ChatMemberActionSheet({
  open,
  onOpenChange,
  selectedUser,
  chatType,
  isHost,
  isBlocked,
  onBlockUser,
  onCreatePersonalChat,
  onTransferHost,
  onKickUser,
  onRequestStudentIdDisclosure,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);

  const handleAction = async (actionFn?: () => Promise<void> | void) => {
    if (!actionFn || submitting) return;
    setSubmitting(true);
    try {
      await actionFn();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedUser) return null;

  return (
    <>
      <Drawer.Root
        open={open && !isCreateConfirmOpen}
        onOpenChange={onOpenChange}
        repositionInputs={false}
      >
        <Drawer.Portal>
          <Overlay />
          <Sheet>
            <Handle />
            <SheetBody>
              <Drawer.Title>{selectedUser.nickname}</Drawer.Title>
              <Drawer.Description>
                {chatType === "open"
                  ? "오픈채팅 참여중"
                  : chatType === "roommate"
                    ? "룸메이트 채팅 참여중"
                    : "1:1 채팅 참여중"}
              </Drawer.Description>
              <SheetButtons>
                {chatType === "open" ? (
                  <>
                    <OpenChatPrimaryActions
                      $single={!isHost || selectedUser.isHost}
                    >
                      <PrimaryButton
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          setIsCreateConfirmOpen(true);
                        }}
                      >
                        1:1 채팅하기
                      </PrimaryButton>
                      {isHost && !selectedUser.isHost && (
                        <DarkButton
                          type="button"
                          disabled={submitting}
                          onClick={() => handleAction(onTransferHost)}
                        >
                          방장 위임하기
                        </DarkButton>
                      )}
                    </OpenChatPrimaryActions>
                    <DangerActionList>
                      {isHost && !selectedUser.isHost && (
                        <DangerActionButton
                          type="button"
                          disabled={submitting}
                          onClick={() => handleAction(onKickUser)}
                        >
                          강퇴시키기
                        </DangerActionButton>
                      )}
                      <DangerActionButton
                        type="button"
                        disabled={submitting || isBlocked}
                        onClick={() => handleAction(onBlockUser)}
                      >
                        {isBlocked
                          ? "차단됨"
                          : submitting
                            ? "처리 중..."
                            : "차단하기"}
                      </DangerActionButton>
                    </DangerActionList>
                  </>
                ) : (
                  <ProfileActionRow>
                    <BlockButton
                      type="button"
                      disabled={submitting || isBlocked}
                      onClick={() => handleAction(onBlockUser)}
                    >
                      {isBlocked
                        ? "차단됨"
                        : submitting
                          ? "처리 중..."
                          : "차단하기"}
                    </BlockButton>
                    <PrimaryButton
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        onOpenChange(false);
                        onRequestStudentIdDisclosure?.();
                      }}
                    >
                      {submitting ? "처리 중..." : "학번 공유하기"}
                    </PrimaryButton>
                  </ProfileActionRow>
                )}
              </SheetButtons>
            </SheetBody>
          </Sheet>
        </Drawer.Portal>
      </Drawer.Root>

      <Drawer.Root
        open={isCreateConfirmOpen}
        onOpenChange={(nextOpen) => {
          setIsCreateConfirmOpen(nextOpen);
          if (!nextOpen) {
            onOpenChange(false);
          }
        }}
        repositionInputs={false}
      >
        <Drawer.Portal>
          <Overlay />
          <Sheet>
            <Handle />
            <SheetBody>
              <Drawer.Title>1:1 채팅 만들기</Drawer.Title>
              <Drawer.Description>
                {selectedUser.nickname}님과 1:1 채팅을 시작합니다.
              </Drawer.Description>
              <PrimaryButton
                disabled={submitting}
                onClick={async () => {
                  if (!onCreatePersonalChat || submitting) return;
                  setSubmitting(true);
                  try {
                    await onCreatePersonalChat();
                    setIsCreateConfirmOpen(false);
                    onOpenChange(false);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? "생성 중..." : "만들기"}
              </PrimaryButton>
            </SheetBody>
          </Sheet>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

const Overlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 20000;
  background: rgba(0, 0, 0, 0.4);
`;

const Sheet = styled(Drawer.Content)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20001;
  max-width: 420px;
  margin: 0 auto;
  border-radius: 16px 16px 0 0;
  background: white;
  outline: none;
`;

const Handle = styled.div`
  width: 60px;
  height: 4px;
  margin: 12px auto 16px;
  border-radius: 4px;
  background: #dfdfdf;
`;

const SheetBody = styled.div`
  padding: 0 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  h2 {
    margin: 0;
    color: #3d3d3d;
    font:
      600 20px/1.5 Pretendard,
      sans-serif;
  }
  p {
    margin: -12px 0 16px;
    color: #8b8b8b;
    font:
      400 12px/1.5 Pretendard,
      sans-serif;
  }
`;

const SheetButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProfileActionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.4fr);
  gap: 10px;
`;

const OpenChatPrimaryActions = styled.div<{ $single: boolean }>`
  display: grid;
  grid-template-columns: ${({ $single }) =>
    $single ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))"};
  gap: 8px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 8px;
  background: #1677ff;
  color: white;
  font:
    600 16px/1.5 Pretendard,
    sans-serif;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
  }
`;

const BlockButton = styled.button`
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 8px;
  background: #f7f7f7;
  color: #ff4242;
  font:
    600 16px/1.5 Pretendard,
    sans-serif;
  cursor: pointer;

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

const DarkButton = styled(PrimaryButton)`
  background: #0958d9;
`;

const DangerActionList = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid #efefef;
`;

const DangerActionButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  padding: 8px;
  border: 0;
  background: transparent;
  color: #eb0000;
  font:
    400 16px/1.6 Pretendard,
    sans-serif;
  text-align: left;
  cursor: pointer;

  &:first-child {
    padding-top: 16px;
  }

  &:last-child {
    padding-bottom: 16px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;
