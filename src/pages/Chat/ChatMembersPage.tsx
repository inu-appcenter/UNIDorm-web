import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { ChevronRight, User } from "lucide-react";
import { Drawer } from "vaul";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import { deleteRoommateChatRoom } from "@/apis/roommate";
import {
  createPersonalOpenChatRoom,
  getOpenChatParticipants,
  leaveOpenChatRoom,
  transferOpenChatHost,
} from "@/apis/openchat";
import { OpenChatParticipant } from "@/types/openchat";
import LoadingSpinner from "@/components/common/LoadingSpinner";

type Sheet = "profile" | "create" | null;

export default function ChatMembersPage() {
  const { chatType, id } = useParams();
  const roomId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const partnerName = location.state?.partnerName ?? "상대방";
  const { userInfo } = useUserStore();
  const isOpenChatRoom = chatType === "open" || chatType === "personal";

  const [participants, setParticipants] = useState<OpenChatParticipant[]>([]);
  const [loading, setLoading] = useState(isOpenChatRoom);
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);
  const [selectedUser, setSelectedUser] = useState<OpenChatParticipant | null>(
    null,
  );
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [leavePromptOpen, setLeavePromptOpen] = useState(false);
  const [selectingNewHost, setSelectingNewHost] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchParticipants = useCallback(async () => {
    if (!isOpenChatRoom) return;
    setLoading(true);
    try {
      const response = await getOpenChatParticipants(roomId);
      setParticipants(response.data.participants);
    } catch (error) {
      console.error("참여자 목록 조회 실패:", error);
      alert("참여자 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isOpenChatRoom, roomId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const me = useMemo(
    () =>
      participants.find((participant) => participant.userId === userInfo.id),
    [participants, userInfo.id],
  );
  const others = useMemo(
    () =>
      participants.filter((participant) => participant.userId !== userInfo.id),
    [participants, userInfo.id],
  );

  useSetHeader({
    title: "참여중인 인원",
    headerRightElement: (
      <HeaderRight>
        <User size={16} color="#8b8b8b" />
        <span>{isOpenChatRoom ? participants.length : 2}</span>
      </HeaderRight>
    ),
  });

  const handleUserClick = async (participant: OpenChatParticipant) => {
    if (participant.userId === userInfo.id) return;
    if (selectingNewHost) {
      const confirmed = window.confirm(
        `${participant.nickname}님에게 방장을 위임하고 채팅방을 나갈까요?`,
      );
      if (!confirmed) return;
      setSubmitting(true);
      try {
        await leaveOpenChatRoom(roomId, participant.userId);
        navigate("/chat");
      } catch (error) {
        console.error("방장 위임 후 나가기 실패:", error);
        alert("방장 위임 후 나가기에 실패했습니다.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setSelectedUser(participant);
    setActiveSheet("profile");
  };

  const handleCreatePersonalChat = async () => {
    if (!selectedUser || !roomName.trim() || submitting) {
      if (!roomName.trim()) alert("방 이름을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await createPersonalOpenChatRoom({
        name: roomName.trim(),
        targetUserId: selectedUser.userId,
        password: roomPassword.trim() || undefined,
      });
      navigate(`/chat/personal/${response.data.roomId}`, {
        state: { partnerName: selectedUser.nickname },
      });
    } catch (error) {
      console.error("1:1 채팅 생성 실패:", error);
      alert("1:1 채팅방 생성에 실패했습니다. 이미 대화방이 존재할 수 있어요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferHost = async () => {
    if (!selectedUser || submitting) return;
    if (!window.confirm(`${selectedUser.nickname}님에게 방장을 위임할까요?`))
      return;
    setSubmitting(true);
    try {
      await transferOpenChatHost(roomId, selectedUser.userId);
      setActiveSheet(null);
      await fetchParticipants();
    } catch (error) {
      console.error("방장 위임 실패:", error);
      alert("방장 위임에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (chatType === "roommate") {
      if (!window.confirm("정말 채팅방을 나갈까요?")) return;
      try {
        await deleteRoommateChatRoom(roomId);
        navigate("/chat");
      } catch (error) {
        console.error("채팅방 나가기 실패:", error);
        alert("채팅방 나가기에 실패했습니다.");
      }
      return;
    }

    if (!isOpenChatRoom) {
      navigate("/chat");
      return;
    }

    if (me?.isHost && others.length > 0) {
      setLeavePromptOpen(true);
      return;
    }

    if (!window.confirm("정말 채팅방을 나갈까요?")) return;
    try {
      await leaveOpenChatRoom(roomId);
      navigate("/chat");
    } catch (error) {
      console.error("오픈채팅방 나가기 실패:", error);
      alert("채팅방 나가기에 실패했습니다.");
    }
  };

  return (
    <Page>
      {selectingNewHost && (
        <Guide>새 방장으로 지정할 참여자를 선택해주세요.</Guide>
      )}
      <Scroll>
        {loading ? (
          <LoadingSpinner message="참여자를 불러오고 있습니다..." />
        ) : isOpenChatRoom ? (
          <>
            {me && (
              <Section>
                <SectionTitle>나</SectionTitle>
                <ParticipantCard $selectable={false}>
                  <NameArea>
                    <ParticipantName>{me.nickname}</ParticipantName>
                    {me.isHost && <HostBadge>방장</HostBadge>}
                  </NameArea>
                </ParticipantCard>
              </Section>
            )}
            <Section>
              <SectionTitle>다른 참여자</SectionTitle>
              <ParticipantList>
                {others.map((participant) => (
                  <ParticipantCard
                    as="button"
                    type="button"
                    key={participant.userId}
                    $selectable
                    disabled={submitting}
                    onClick={() => handleUserClick(participant)}
                  >
                    <NameArea>
                      <ParticipantName>{participant.nickname}</ParticipantName>
                      {participant.isHost && <HostBadge>방장</HostBadge>}
                    </NameArea>
                    <ChevronRight size={18} color="#555" />
                  </ParticipantCard>
                ))}
              </ParticipantList>
            </Section>
          </>
        ) : (
          <Section>
            <SectionTitle>참여자</SectionTitle>
            <ParticipantList>
              <ParticipantCard $selectable={false}>
                <ParticipantName>나</ParticipantName>
              </ParticipantCard>
              <ParticipantCard $selectable={false}>
                <ParticipantName>{partnerName}</ParticipantName>
              </ParticipantCard>
            </ParticipantList>
          </Section>
        )}
      </Scroll>

      <BottomActions>
        <TextAction
          onClick={() =>
            navigate(`/chat/${chatType}/${roomId}/notifications`, {
              state: { partnerName },
            })
          }
        >
          알림 설정
        </TextAction>
        <LeaveAction onClick={handleLeaveRoom}>채팅방 나가기</LeaveAction>
      </BottomActions>

      <Drawer.Root
        open={activeSheet === "profile"}
        onOpenChange={(open) => !open && setActiveSheet(null)}
      >
        <Drawer.Portal>
          <Overlay />
          <Sheet>
            <Handle />
            {selectedUser && (
              <SheetBody>
                <Drawer.Title>{selectedUser.nickname}</Drawer.Title>
                <Drawer.Description>1긱 오픈채팅 참여중</Drawer.Description>
                <SheetButtons>
                  {chatType === "open" && (
                    <PrimaryButton
                      onClick={() => {
                        setRoomName(`${selectedUser.nickname}님과의 대화`);
                        setActiveSheet("create");
                      }}
                    >
                      1:1 채팅하기
                    </PrimaryButton>
                  )}
                  {me?.isHost && !selectedUser.isHost && (
                    <DarkButton onClick={handleTransferHost}>
                      방장 위임하기
                    </DarkButton>
                  )}
                </SheetButtons>
              </SheetBody>
            )}
          </Sheet>
        </Drawer.Portal>
      </Drawer.Root>

      <Drawer.Root
        open={activeSheet === "create"}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        repositionInputs={false}
      >
        <Drawer.Portal>
          <Overlay />
          <Sheet>
            <Handle />
            <SheetBody>
              <Drawer.Title>1:1 채팅 만들기</Drawer.Title>
              <Drawer.Description>
                상대 {selectedUser?.nickname}
              </Drawer.Description>
              <FormField>
                <label>방 이름</label>
                <input
                  value={roomName}
                  maxLength={30}
                  onChange={(event) => setRoomName(event.target.value)}
                />
              </FormField>
              <FormField>
                <label>비밀번호 (선택)</label>
                <input
                  type="password"
                  value={roomPassword}
                  maxLength={50}
                  onChange={(event) => setRoomPassword(event.target.value)}
                />
              </FormField>
              <PrimaryButton
                disabled={submitting}
                onClick={handleCreatePersonalChat}
              >
                만들기
              </PrimaryButton>
            </SheetBody>
          </Sheet>
        </Drawer.Portal>
      </Drawer.Root>

      {leavePromptOpen && (
        <ModalOverlay role="presentation">
          <Modal role="dialog" aria-modal="true" aria-labelledby="leave-title">
            <h2 id="leave-title">새 방장을 먼저 위임해 주세요</h2>
            <p>
              방장은 위임 없이 채팅방 나가기가 불가해요.
              <br />
              확인 후 팀원에게 방장을 위임해 주세요.
            </p>
            <ModalButtons>
              <ModalCancel onClick={() => setLeavePromptOpen(false)}>
                취소
              </ModalCancel>
              <ModalConfirm
                onClick={() => {
                  setLeavePromptOpen(false);
                  setSelectingNewHost(true);
                }}
              >
                확인
              </ModalConfirm>
            </ModalButtons>
          </Modal>
        </ModalOverlay>
      )}
    </Page>
  );
}

const Page = styled.div`
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
  position: relative;
`;
const Guide = styled.div`
  padding: 10px 20px;
  background: #e6f4ff;
  color: #0958d9;
  font:
    400 14px/1.5 Pretendard,
    sans-serif;
`;
const Scroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 130px;
`;
const Section = styled.section`
  padding: 16px 20px 0;
`;
const SectionTitle = styled.h2`
  margin: 0 0 8px;
  color: #3d3d3d;
  font:
    400 14px/1.5 Pretendard,
    sans-serif;
`;
const ParticipantList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const ParticipantCard = styled.div<{ $selectable: boolean }>`
  width: 100%;
  min-height: 56px;
  box-sizing: border-box;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  background: white;
  color: #3d3d3d;
  text-align: left;
  cursor: ${({ $selectable }) => ($selectable ? "pointer" : "default")};
`;
const NameArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const ParticipantName = styled.span`
  font:
    600 16px/1.5 Pretendard,
    sans-serif;
`;
const HostBadge = styled.span`
  padding: 2px 8px;
  border-radius: 16px;
  background: #1677ff;
  color: #fff;
  font:
    400 12px/1.5 Pretendard,
    sans-serif;
`;
const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 8px;
  color: #8b8b8b;
  font:
    400 14px/1.5 Pretendard,
    sans-serif;
`;
const BottomActions = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px 20px 24px;
  border-top: 1px solid #efefef;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const TextAction = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  color: #3d3d3d;
  text-align: left;
  font:
    400 16px/1.5 Pretendard,
    sans-serif;
  cursor: pointer;
`;
const LeaveAction = styled(TextAction)`
  color: #f5222d;
`;
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
  gap: 12px;
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
const DarkButton = styled(PrimaryButton)`
  background: #0958d9;
`;
const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  label {
    color: #3d3d3d;
    font:
      500 14px/1.5 Pretendard,
      sans-serif;
  }
  input {
    height: 40px;
    box-sizing: border-box;
    padding: 8px 12px;
    border: 0;
    border-radius: 8px;
    background: #f7f7f7;
    color: #3d3d3d;
    font:
      400 14px/1.5 Pretendard,
      sans-serif;
    outline: none;
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 21000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
`;
const Modal = styled.div`
  width: min(320px, 100%);
  box-sizing: border-box;
  padding: 16px;
  border-radius: 16px;
  background: white;
  h2 {
    margin: 0;
    color: #3d3d3d;
    font:
      600 20px/1.5 Pretendard,
      sans-serif;
  }
  p {
    margin: 16px 0 24px;
    color: #8b8b8b;
    font:
      400 12px/1.75 Pretendard,
      sans-serif;
  }
`;
const ModalButtons = styled.div`
  display: flex;
  gap: 8px;
`;
const ModalButton = styled.button`
  flex: 1;
  height: 37px;
  border: 0;
  border-radius: 20px;
  font:
    400 14px/1.5 Pretendard,
    sans-serif;
  cursor: pointer;
`;
const ModalCancel = styled(ModalButton)`
  background: #f7f7f7;
  color: #8b8b8b;
`;
const ModalConfirm = styled(ModalButton)`
  background: #1677ff;
  color: white;
`;
