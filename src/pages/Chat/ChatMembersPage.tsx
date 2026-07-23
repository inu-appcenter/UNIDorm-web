import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { ChevronRight, User } from "lucide-react";
import { Drawer } from "vaul";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import { deleteRoommateChatRoom } from "@/apis/roommate";
import { getRoommateChatRooms } from "@/apis/chat";
import {
  createPersonalOpenChatRoom,
  getOpenChatParticipants,
  leaveOpenChatRoom,
  transferOpenChatHost,
} from "@/apis/openchat";
import { OpenChatParticipant } from "@/types/openchat";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { blockUser } from "@/apis/block";
import { requestStudentIdDisclosure } from "@/apis/studentIdDisclosure";
import { isAxiosError } from "axios";

type Sheet = "profile" | "create" | null;

export default function ChatMembersPage() {
  const { chatType, id } = useParams();
  const roomId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const partnerName = location.state?.partnerName ?? "상대방";
  const partnerProfileImageUrl =
    location.state?.partnerProfileImageUrl ?? undefined;
  const routePartnerId = Number(location.state?.partnerId) || null;
  const { userInfo } = useUserStore();
  const isOpenChatRoom = chatType === "open" || chatType === "personal";

  const [participants, setParticipants] = useState<OpenChatParticipant[]>([]);
  const [directChatPartner, setDirectChatPartner] =
    useState<OpenChatParticipant | null>(
      routePartnerId
        ? {
            userId: routePartnerId,
            nickname: partnerName,
            joinedAt: "",
            isHost: false,
            isAdmin: false,
          }
        : null,
    );
  const [loading, setLoading] = useState(
    isOpenChatRoom || chatType === "roommate",
  );
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
    if (!isOpenChatRoom && chatType !== "roommate") return;
    setLoading(true);
    try {
      if (chatType === "roommate") {
        const response = await getRoommateChatRooms();
        const currentRoom = response.data.find(
          (room) => room.chatRoomId === roomId,
        );

        if (currentRoom) {
          setDirectChatPartner({
            userId: currentRoom.partnerId,
            nickname:
              currentRoom.partnerName ||
              currentRoom.opponentNickname ||
              partnerName,
            joinedAt: "",
            isHost: false,
            isAdmin: false,
          });
        }
      } else {
        const response = await getOpenChatParticipants(roomId);
        setParticipants(response.data.participants);
      }
    } catch (error) {
      console.error("참여자 목록 조회 실패:", error);
      if (chatType !== "roommate" || !routePartnerId) {
        alert("참여자 목록을 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [chatType, isOpenChatRoom, partnerName, routePartnerId, roomId]);

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
        state: {
          partnerName: selectedUser.nickname,
          partnerId: selectedUser.userId,
        },
      });
    } catch (error) {
      console.error("1:1 채팅 생성 실패:", error);
      alert("1:1 채팅방 생성에 실패했습니다. 이미 대화방이 존재할 수 있어요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser || submitting) return;

    const targetUser = selectedUser;
    if (
      !window.confirm(
        `${targetUser.nickname}님을 차단할까요?\n차단 후 해당 사용자와 1:1 채팅방 생성 및 메시지 전송이 제한됩니다.`,
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await blockUser(targetUser.userId);
      setActiveSheet(null);
      setSelectedUser(null);
      alert(`${targetUser.nickname}님을 차단했습니다.`);
    } catch (error) {
      console.error("사용자 차단 실패:", error);

      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/login");
        } else if (error.response?.status === 404) {
          alert("차단할 사용자를 찾을 수 없습니다.");
        } else if (error.response?.status === 409) {
          alert("이미 차단한 사용자입니다.");
        } else {
          alert("사용자 차단에 실패했습니다. 다시 시도해 주세요.");
        }
      } else {
        alert("사용자 차단 중 오류가 발생했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestStudentIdDisclosure = async () => {
    if (
      !selectedUser ||
      submitting ||
      (chatType !== "personal" && chatType !== "roommate")
    ) {
      return;
    }

    if (
      !window.confirm(`${selectedUser.nickname}님에게 학번 공유를 요청할까요?`)
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await requestStudentIdDisclosure(
        roomId,
        selectedUser.userId,
      );

      navigate(`/chat/${chatType}/${roomId}`, {
        replace: true,
        state: {
          partnerName: selectedUser.nickname,
          partnerId: selectedUser.userId,
          partnerProfileImageUrl,
          disclosureRequestId: response.data.requestId,
        },
      });
    } catch (error) {
      console.error("학번 공유 요청 실패:", error);
      alert(
        "학번 공유 요청에 실패했습니다. 이미 요청을 보냈거나 처리 중일 수 있습니다.",
      );
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

    if (chatType === "open" && me?.isHost && others.length > 0) {
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
              <ParticipantCard
                as="button"
                type="button"
                $selectable={Boolean(directChatPartner)}
                disabled={!directChatPartner || submitting}
                onClick={() =>
                  directChatPartner && handleUserClick(directChatPartner)
                }
              >
                <ParticipantName>
                  {directChatPartner?.nickname || partnerName}
                </ParticipantName>
                {directChatPartner && <ChevronRight size={18} color="#555" />}
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
                <Drawer.Description>
                  {chatType === "open"
                    ? "1긱 오픈채팅 참여중"
                    : chatType === "roommate"
                      ? "룸메이트 채팅 참여중"
                      : "1:1 채팅 참여중"}
                </Drawer.Description>
                <SheetButtons>
                  {chatType === "open" ? (
                    <ProfileActionRow>
                      <BlockButton
                        type="button"
                        disabled={submitting}
                        onClick={handleBlockUser}
                      >
                        {submitting ? "처리 중..." : "차단하기"}
                      </BlockButton>
                      <PrimaryButton
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          setRoomName("");
                          setRoomPassword("");
                          setActiveSheet("create");
                        }}
                      >
                        1:1 채팅하기
                      </PrimaryButton>
                    </ProfileActionRow>
                  ) : (
                    <ProfileActionRow>
                      <BlockButton
                        type="button"
                        disabled={submitting}
                        onClick={handleBlockUser}
                      >
                        {submitting ? "처리 중..." : "차단하기"}
                      </BlockButton>
                      <PrimaryButton
                        type="button"
                        disabled={submitting}
                        onClick={handleRequestStudentIdDisclosure}
                      >
                        {submitting ? "처리 중..." : "학번 공유하기"}
                      </PrimaryButton>
                    </ProfileActionRow>
                  )}
                  {chatType === "open" &&
                    me?.isHost &&
                    !selectedUser.isHost && (
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
                  placeholder="방 이름을 입력해주세요"
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
const ProfileActionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.4fr);
  gap: 10px;
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
