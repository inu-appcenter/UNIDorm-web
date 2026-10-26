import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  createDormOfficialRoom,
  deleteDormOfficialRoom,
  sendOpenChatBotMessage,
  updateDormOfficialRoom,
} from "@/apis/openchat";
import { useAdminOpenChatRooms } from "@/queries/admin";
import AdminModal from "@/components/modal/AdminModal";
import AdminBottomSheet from "@/components/modal/AdminBottomSheet";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useUserRole } from "@/hooks/useUserRole";
import useUserStore from "@/stores/useUserStore";
import { useCountUp } from "@/hooks/useCountUp";
import { complainDormitory } from "@/constants/constants";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminEmptyDescription,
  AdminEmptyState,
  AdminEmptyTitle,
  AdminField,
  AdminInput,
  AdminLabel,
  AdminMiniStat,
  AdminMiniStatLabel,
  AdminMiniStatValue,
  AdminNotice,
  AdminPage,
  AdminScrollableArea,
  AdminSelect,
  AdminShell,
  AdminStack,
  AdminSubtleText,
  AdminTextarea,
} from "@/pages/Admin/adminPageStyles";
import type {
  AdminOpenChatRoom,
  CreateDormOfficialRoomRequest,
  UpdateDormOfficialRoomRequest,
} from "@/types/openchat";

const INITIAL_CREATE_FORM: CreateDormOfficialRoomRequest = {
  dormType: complainDormitory[0] ?? "1기숙사",
  name: "",
  description: "",
};

const INITIAL_EDIT_FORM: UpdateDormOfficialRoomRequest = {
  name: "",
  description: "",
};

const OpenChatAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { isMainAdmin } = useUserRole();
  const { isLoading: isUserLoading } = useUserStore();

  const {
    data: rooms = [],
    isLoading: loading,
    refetch: fetchRooms,
  } = useAdminOpenChatRooms({ enabled: isMainAdmin });
  const [searchKeyword, setSearchKeyword] = useState("");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateDormOfficialRoomRequest>(INITIAL_CREATE_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRoomForEdit, setSelectedRoomForEdit] =
    useState<AdminOpenChatRoom | null>(null);
  const [editForm, setEditForm] =
    useState<UpdateDormOfficialRoomRequest>(INITIAL_EDIT_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");

  // Bot Message Modal State
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [selectedRoomForBot, setSelectedRoomForBot] =
    useState<AdminOpenChatRoom | null>(null);
  const [botContent, setBotContent] = useState("");
  const [isSendingBot, setIsSendingBot] = useState(false);
  const [botError, setBotError] = useState("");
  const [botSuccess, setBotSuccess] = useState("");

  // Mobile Action Sheet State
  const [mobileActionRoom, setMobileActionRoom] =
    useState<AdminOpenChatRoom | null>(null);

  // Deleting State
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);

  useSetHeader({ title: "오픈채팅방 관리" });

  useEffect(() => {
    if (!isUserLoading && !isMainAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isMainAdmin, isUserLoading, navigate]);

  const filteredRooms = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return rooms;
    return rooms.filter(
      (room) =>
        room.roomName.toLowerCase().includes(keyword) ||
        String(room.roomId).includes(keyword),
    );
  }, [rooms, searchKeyword]);

  const animatedTotalRooms = useCountUp(rooms.length);
  const animatedFilteredRooms = useCountUp(filteredRooms.length);

  // Create Handlers
  const handleOpenCreate = () => {
    setCreateForm({
      dormType: complainDormitory[0] ?? "1기숙사",
      name: "",
      description: "",
    });
    setCreateError("");
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = createForm.name.trim();
    const trimmedDesc = createForm.description.trim();

    if (!trimmedName) {
      setCreateError("채팅방 이름을 입력해 주세요.");
      return;
    }

    if (!trimmedDesc) {
      setCreateError("채팅방 설명을 입력해 주세요.");
      return;
    }

    setCreateError("");
    setIsCreating(true);
    try {
      await createDormOfficialRoom({
        dormType: createForm.dormType,
        name: trimmedName,
        description: trimmedDesc,
      });
      alert("기숙사 공식 채팅방을 생성했습니다.");
      setIsCreateOpen(false);
      await fetchRooms();
    } catch (error) {
      console.error("공식 채팅방 생성 실패:", error);
      if (isAxiosError(error) && error.response?.status === 403) {
        setCreateError("관리자 권한이 없습니다.");
      } else {
        setCreateError("공식 채팅방 생성에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Edit Handlers
  const handleOpenEdit = (room: AdminOpenChatRoom) => {
    setMobileActionRoom(null);
    setSelectedRoomForEdit(room);
    setEditForm({
      name: room.roomName,
      description: "",
    });
    setEditError("");
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForEdit) return;

    const trimmedName = editForm.name.trim();
    const trimmedDesc = editForm.description.trim();

    if (!trimmedName) {
      setEditError("수정할 채팅방 이름을 입력해 주세요.");
      return;
    }

    if (!trimmedDesc) {
      setEditError("수정할 채팅방 설명을 입력해 주세요.");
      return;
    }

    setEditError("");
    setIsEditing(true);
    try {
      await updateDormOfficialRoom(selectedRoomForEdit.roomId, {
        name: trimmedName,
        description: trimmedDesc,
      });
      alert("기숙사 공식 채팅방 정보를 수정했습니다.");
      setIsEditOpen(false);
      setSelectedRoomForEdit(null);
      await fetchRooms();
    } catch (error) {
      console.error("공식 채팅방 수정 실패:", error);
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          setEditError("관리자 권한이 없습니다.");
        } else if (error.response?.status === 404) {
          setEditError("해당 기숙사 공식 채팅방을 찾을 수 없습니다.");
        } else {
          setEditError("공식 채팅방 수정에 실패했습니다. 다시 시도해 주세요.");
        }
      } else {
        setEditError("공식 채팅방 수정에 실패했습니다.");
      }
    } finally {
      setIsEditing(false);
    }
  };

  // Delete Handlers
  const handleDeleteRoom = async (room: AdminOpenChatRoom) => {
    setMobileActionRoom(null);
    if (
      !window.confirm(
        `"${room.roomName}" (ID: ${room.roomId}) 공식 채팅방을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`,
      )
    ) {
      return;
    }

    setDeletingRoomId(room.roomId);
    try {
      await deleteDormOfficialRoom(room.roomId);
      alert("기숙사 공식 채팅방을 삭제했습니다.");
      await fetchRooms();
    } catch (error) {
      console.error("공식 채팅방 삭제 실패:", error);
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          alert("관리자 권한이 없습니다.");
        } else if (error.response?.status === 404) {
          alert("삭제할 기숙사 공식 채팅방을 찾을 수 없습니다.");
        } else {
          alert("공식 채팅방 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
      } else {
        alert("공식 채팅방 삭제에 실패했습니다.");
      }
    } finally {
      setDeletingRoomId(null);
    }
  };

  // Bot Message Handlers
  const handleOpenBotModal = (room?: AdminOpenChatRoom) => {
    setMobileActionRoom(null);
    setSelectedRoomForBot(room ?? rooms[0] ?? null);
    setBotContent("");
    setBotError("");
    setBotSuccess("");
    setIsBotModalOpen(true);
  };

  const handleBotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForBot) return;

    const trimmedContent = botContent.trim();
    if (!trimmedContent) {
      setBotError("챗봇 메시지 내용을 입력해 주세요.");
      return;
    }

    setBotError("");
    setBotSuccess("");
    setIsSendingBot(true);
    try {
      await sendOpenChatBotMessage(selectedRoomForBot.roomId, trimmedContent);
      setBotSuccess("챗봇 메시지를 성공적으로 발송했습니다.");
      setBotContent("");
      setTimeout(() => {
        setIsBotModalOpen(false);
        setBotSuccess("");
      }, 1000);
    } catch (error) {
      console.error("챗봇 메시지 발송 실패:", error);
      if (isAxiosError(error)) {
        if (error.response?.status === 400) {
          setBotError("개인 채팅방에는 챗봇 메시지를 전송할 수 없습니다.");
        } else if (error.response?.status === 403) {
          setBotError("관리자 권한이 없습니다.");
        } else if (error.response?.status === 404) {
          setBotError("선택한 채팅방을 찾을 수 없습니다.");
        } else {
          setBotError("챗봇 메시지 발송에 실패했습니다.");
        }
      } else {
        setBotError("챗봇 메시지 발송에 실패했습니다.");
      }
    } finally {
      setIsSendingBot(false);
    }
  };

  return (
    <AdminShell>
      <AdminPage>
        {/* 상단 통계 수치 (CountUp) */}
        <MetricsGrid>
          <AdminMiniStat>
            <AdminMiniStatLabel>전체 오픈채팅방</AdminMiniStatLabel>
            <AdminMiniStatValue>{animatedTotalRooms}개</AdminMiniStatValue>
          </AdminMiniStat>
          <AdminMiniStat>
            <AdminMiniStatLabel>검색된 채팅방</AdminMiniStatLabel>
            <AdminMiniStatValue style={{ color: "#3182f6" }}>
              {animatedFilteredRooms}개
            </AdminMiniStatValue>
          </AdminMiniStat>
        </MetricsGrid>

        <AdminStack>
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitleGroup>
                <AdminCardTitle>오픈채팅방 목록</AdminCardTitle>
                <AdminCardDescription>
                  기숙사 공식 오픈채팅방을 생성 및 관리하고, 참여자들에게 챗봇 공지 메시지를 발송할 수 있습니다.
                </AdminCardDescription>
              </AdminCardTitleGroup>

              <HeaderActions>
                <AdminButton
                  $tone="secondary"
                  onClick={() => void fetchRooms()}
                  disabled={loading}
                >
                  새로고침
                </AdminButton>
                <AdminButton
                  $tone="secondary"
                  onClick={() => handleOpenBotModal()}
                  disabled={rooms.length === 0}
                >
                  챗봇 메시지 발송
                </AdminButton>
                <DesktopCreateButton
                  $tone="primary"
                  onClick={handleOpenCreate}
                >
                  공식 채팅방 생성
                </DesktopCreateButton>
              </HeaderActions>
            </AdminCardHeader>

            {/* 검색창 */}
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="채팅방 이름이나 방 번호(ID)로 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              {searchKeyword && (
                <ClearSearchBtn type="button" onClick={() => setSearchKeyword("")}>
                  초기화
                </ClearSearchBtn>
              )}
            </SearchContainer>

            {loading ? (
              <LoadingContainer>
                <LoadingSpinner />
              </LoadingContainer>
            ) : filteredRooms.length === 0 ? (
              <AdminEmptyState>
                <AdminEmptyTitle>
                  {searchKeyword ? "검색 결과가 없습니다." : "등록된 오픈채팅방이 없습니다."}
                </AdminEmptyTitle>
                <AdminEmptyDescription>
                  {searchKeyword
                    ? `"${searchKeyword}" 키워드와 일치하는 채팅방이 없습니다.`
                    : "새로운 기숙사 공식 채팅방을 생성해 보세요."}
                </AdminEmptyDescription>
                {!searchKeyword && (
                  <AdminButton $tone="primary" onClick={handleOpenCreate}>
                    공식 채팅방 만들기
                  </AdminButton>
                )}
              </AdminEmptyState>
            ) : (
              <AdminScrollableArea $maxHeight="680px">
                <RoomListContainer>
                  {filteredRooms.map((room) => (
                    <RoomItemCard key={room.roomId}>
                      <RoomItemMain>
                        <RoomItemHeader>
                          <AdminBadge $tone="blue">방 #{room.roomId}</AdminBadge>
                        </RoomItemHeader>
                        <RoomItemTitle>{room.roomName}</RoomItemTitle>
                      </RoomItemMain>

                      {/* PC 전용 인라인 액션 버튼 (Zero-Icon) */}
                      <DesktopActionGroup>
                        <AdminButton
                          $tone="ghost"
                          onClick={() => handleOpenBotModal(room)}
                          style={{ padding: "8px 14px", minHeight: "38px", fontSize: "0.85rem" }}
                        >
                          챗봇 발송
                        </AdminButton>
                        <AdminButton
                          $tone="secondary"
                          onClick={() => handleOpenEdit(room)}
                          style={{ padding: "8px 14px", minHeight: "38px", fontSize: "0.85rem" }}
                        >
                          공식방 수정
                        </AdminButton>
                        <AdminButton
                          $tone="danger"
                          onClick={() => void handleDeleteRoom(room)}
                          disabled={deletingRoomId === room.roomId}
                          style={{ padding: "8px 14px", minHeight: "38px", fontSize: "0.85rem" }}
                        >
                          {deletingRoomId === room.roomId ? "삭제 중..." : "삭제"}
                        </AdminButton>
                      </DesktopActionGroup>

                      {/* 모바일 전용 액션 시트 호출 버튼 */}
                      <MobileActionOpenButton
                        type="button"
                        onClick={() => setMobileActionRoom(room)}
                      >
                        관리 옵션 열기
                      </MobileActionOpenButton>
                    </RoomItemCard>
                  ))}
                </RoomListContainer>
              </AdminScrollableArea>
            )}
          </AdminCard>
        </AdminStack>

        {/* 모바일 전용 룸 액션 바텀시트 */}
        <AdminBottomSheet
          isOpen={Boolean(mobileActionRoom)}
          setIsOpen={(open) => {
            if (!open) setMobileActionRoom(null);
          }}
          title={mobileActionRoom?.roomName ?? "채팅방 관리"}
          description={`방 번호 #${mobileActionRoom?.roomId}`}
        >
          {mobileActionRoom && (
            <MobileActionMenuContainer>
              <MobileActionItem
                type="button"
                onClick={() => handleOpenBotModal(mobileActionRoom)}
              >
                챗봇 공지 메시지 발송하기
              </MobileActionItem>
              <MobileActionItem
                type="button"
                onClick={() => handleOpenEdit(mobileActionRoom)}
              >
                공식 채팅방 정보 수정하기
              </MobileActionItem>
              <MobileActionItem
                type="button"
                $danger
                onClick={() => void handleDeleteRoom(mobileActionRoom)}
              >
                공식 채팅방 삭제하기
              </MobileActionItem>
            </MobileActionMenuContainer>
          )}
        </AdminBottomSheet>

        {/* 공식 채팅방 생성 모달 */}
        <AdminModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          maxWidth="520px"
        >
          <ModalContainer as="form" onSubmit={handleCreateSubmit}>
            <ModalHeader>
              <ModalTitle>기숙사 공식 채팅방 생성</ModalTitle>
              <ModalSubtitle>기숙사 구분과 방 이름, 설명을 입력해 공식 채팅방을 생성합니다.</ModalSubtitle>
            </ModalHeader>

            <ModalBody>
              <AdminField>
                <AdminLabel htmlFor="create-dorm-type">기숙사 구분</AdminLabel>
                <AdminSelect
                  id="create-dorm-type"
                  value={createForm.dormType}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, dormType: e.target.value }))}
                  disabled={isCreating}
                >
                  {complainDormitory.map((dorm) => (
                    <option key={dorm} value={dorm}>
                      {dorm}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>

              <AdminField>
                <AdminLabel htmlFor="create-room-name">채팅방 이름</AdminLabel>
                <AdminInput
                  id="create-room-name"
                  type="text"
                  placeholder="예: 1기숙사 공식 오픈채팅방"
                  value={createForm.name}
                  maxLength={100}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={isCreating}
                />
              </AdminField>

              <AdminField>
                <AdminLabel htmlFor="create-room-desc">채팅방 설명</AdminLabel>
                <AdminTextarea
                  id="create-room-desc"
                  placeholder="공식 채팅방에 대한 안내 및 운영 공지를 입력해 주세요."
                  value={createForm.description}
                  maxLength={500}
                  style={{ minHeight: "120px" }}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={isCreating}
                />
                <AdminSubtleText>{createForm.description.length}/500자</AdminSubtleText>
              </AdminField>

              {createError && <AdminNotice $tone="error">{createError}</AdminNotice>}
            </ModalBody>

            <ModalFooter>
              <AdminButton
                type="button"
                $tone="ghost"
                onClick={() => setIsCreateOpen(false)}
                disabled={isCreating}
              >
                취소
              </AdminButton>
              <AdminButton
                type="submit"
                $tone="primary"
                disabled={!createForm.name.trim() || !createForm.description.trim() || isCreating}
              >
                {isCreating ? "생성하고 있어요..." : "공식 채팅방 생성하기"}
              </AdminButton>
            </ModalFooter>
          </ModalContainer>
        </AdminModal>

        {/* 공식 채팅방 수정 모달 */}
        <AdminModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          maxWidth="520px"
        >
          <ModalContainer as="form" onSubmit={handleEditSubmit}>
            <ModalHeader>
              <ModalTitle>기숙사 공식 채팅방 수정</ModalTitle>
              <ModalSubtitle>
                채팅방 #{selectedRoomForEdit?.roomId} ({selectedRoomForEdit?.roomName})
              </ModalSubtitle>
            </ModalHeader>

            <ModalBody>
              <AdminField>
                <AdminLabel htmlFor="edit-room-name">수정할 채팅방 이름</AdminLabel>
                <AdminInput
                  id="edit-room-name"
                  type="text"
                  placeholder="새로운 채팅방 이름을 입력하세요"
                  value={editForm.name}
                  maxLength={100}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={isEditing}
                />
              </AdminField>

              <AdminField>
                <AdminLabel htmlFor="edit-room-desc">수정할 채팅방 설명</AdminLabel>
                <AdminTextarea
                  id="edit-room-desc"
                  placeholder="새로운 채팅방 설명을 입력하세요"
                  value={editForm.description}
                  maxLength={500}
                  style={{ minHeight: "120px" }}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={isEditing}
                />
                <AdminSubtleText>{editForm.description.length}/500자</AdminSubtleText>
              </AdminField>

              {editError && <AdminNotice $tone="error">{editError}</AdminNotice>}
            </ModalBody>

            <ModalFooter>
              <AdminButton
                type="button"
                $tone="ghost"
                onClick={() => setIsEditOpen(false)}
                disabled={isEditing}
              >
                취소
              </AdminButton>
              <AdminButton
                type="submit"
                $tone="primary"
                disabled={!editForm.name.trim() || !editForm.description.trim() || isEditing}
              >
                {isEditing ? "수정하고 있어요..." : "수정 완료하기"}
              </AdminButton>
            </ModalFooter>
          </ModalContainer>
        </AdminModal>

        {/* 챗봇 메시지 발송 모달 */}
        <AdminModal
          isOpen={isBotModalOpen}
          onClose={() => setIsBotModalOpen(false)}
          maxWidth="520px"
        >
          <ModalContainer as="form" onSubmit={handleBotSubmit}>
            <ModalHeader>
              <ModalTitle>챗봇 메시지 발송</ModalTitle>
              <ModalSubtitle>
                방에 직접 참여하지 않고 안내 챗봇 메시지를 안전하게 발송합니다.
              </ModalSubtitle>
            </ModalHeader>

            <ModalBody>
              <AdminField>
                <AdminLabel htmlFor="bot-target-room">발송 대상 오픈채팅방</AdminLabel>
                <AdminSelect
                  id="bot-target-room"
                  value={selectedRoomForBot?.roomId ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const found = rooms.find((r) => r.roomId === id) ?? null;
                    setSelectedRoomForBot(found);
                  }}
                  disabled={isSendingBot || rooms.length === 0}
                >
                  {rooms.length === 0 ? (
                    <option>선택 가능한 채팅방이 없습니다</option>
                  ) : (
                    rooms.map((room) => (
                      <option key={room.roomId} value={room.roomId}>
                        [방 #{room.roomId}] {room.roomName}
                      </option>
                    ))
                  )}
                </AdminSelect>
              </AdminField>

              <AdminField>
                <AdminLabel htmlFor="modal-bot-content">메시지 내용</AdminLabel>
                <AdminTextarea
                  id="modal-bot-content"
                  placeholder="입주 준비, 수칙 안내, 공동구매 등 채팅방에 안내할 내용을 입력해 주세요."
                  value={botContent}
                  maxLength={1000}
                  style={{ minHeight: "140px" }}
                  onChange={(e) => setBotContent(e.target.value)}
                  disabled={isSendingBot}
                />
                <AdminSubtleText>{botContent.length}/1000자</AdminSubtleText>
              </AdminField>

              {botError && <AdminNotice $tone="error">{botError}</AdminNotice>}
              {botSuccess && <AdminNotice $tone="success">{botSuccess}</AdminNotice>}
            </ModalBody>

            <ModalFooter>
              <AdminButton
                type="button"
                $tone="ghost"
                onClick={() => setIsBotModalOpen(false)}
                disabled={isSendingBot}
              >
                닫기
              </AdminButton>
              <AdminButton
                type="submit"
                $tone="primary"
                disabled={!selectedRoomForBot || !botContent.trim() || isSendingBot}
              >
                {isSendingBot ? "메시지를 보내고 있어요..." : "메시지 발송하기"}
              </AdminButton>
            </ModalFooter>
          </ModalContainer>
        </AdminModal>

        {/* 모바일 전용 하단 고정 CTA */}
        <MobileCTAContainer>
          <MobileCTAButton type="button" onClick={handleOpenCreate}>
            공식 채팅방 만들기
          </MobileCTAButton>
        </MobileCTAContainer>
      </AdminPage>
    </AdminShell>
  );
};

export default OpenChatAdminPage;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 768px) {
    gap: 16px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const DesktopCreateButton = styled(AdminButton)`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const SearchInput = styled(AdminInput)`
  height: 44px;
  font-size: 0.9rem;
`;

const ClearSearchBtn = styled.button`
  font-size: 0.8rem;
  font-weight: 700;
  color: #3182f6;
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 0;
`;

const RoomListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RoomItemCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  transition: all 0.15s ease-out;

  &:hover {
    border-color: #3182f6;
    background-color: #f9fbff;
  }

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }
`;

const RoomItemMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const RoomItemHeader = styled.div`
  display: flex;
  align-items: center;
`;

const RoomItemTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #191f28;
  letter-spacing: -0.01em;
  word-break: break-all;
`;

const DesktopActionGroup = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
`;

const MobileActionOpenButton = styled.button`
  width: 100%;
  height: 42px;
  border-radius: 12px;
  background: #f2f4f6;
  color: #4e5968;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileActionMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px 24px;
`;

const MobileActionItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  height: 50px;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  background: ${({ $danger }) => ($danger ? "#fdf2f2" : "#f2f4f6")};
  color: ${({ $danger }) => ($danger ? "#f04452" : "#191f28")};
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #191f28;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  font-size: 0.88rem;
  color: #8b95a1;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
`;

const MobileCTAContainer = styled.div`
  display: block;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  max-width: 600px;
  margin: 0 auto;
  pointer-events: none;
  background: linear-gradient(to top, #ffffff 65%, rgba(255, 255, 255, 0));
  padding: 16px 20px calc(14px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCTAButton = styled.button`
  pointer-events: auto;
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background: #3182f6;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  border: none;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.28);
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;
