import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Bot,
  CheckCircle2,
  MessageSquare,
  PencilLine,
  PlusCircle,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  createDormOfficialRoom,
  deleteDormOfficialRoom,
  getAdminOpenChatRooms,
  sendOpenChatBotMessage,
  updateDormOfficialRoom,
} from "@/apis/openchat";
import AdminModal from "@/components/modal/AdminModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useUserRole } from "@/hooks/useUserRole";
import useUserStore from "@/stores/useUserStore";
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
  AdminHero,
  AdminHeroContent,
  AdminHeroDescription,
  AdminHeroEyebrow,
  AdminHeroMetricGrid,
  AdminHeroTitle,
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

  const [rooms, setRooms] = useState<AdminOpenChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Deleting State
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);

  useSetHeader({ title: "오픈채팅방 관리" });

  useEffect(() => {
    if (!isUserLoading && !isMainAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isMainAdmin, isUserLoading, navigate]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await getAdminOpenChatRooms();
      setRooms(response.data);
    } catch (error) {
      console.error("오픈채팅방 목록 조회 실패:", error);
      alert("오픈채팅방 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMainAdmin) {
      void fetchRooms();
    }
  }, [isMainAdmin]);

  const filteredRooms = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return rooms;
    return rooms.filter(
      (room) =>
        room.roomName.toLowerCase().includes(keyword) ||
        String(room.roomId).includes(keyword),
    );
  }, [rooms, searchKeyword]);

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
      alert("기숙사 공식 채팅방을 수정했습니다.");
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
      setBotSuccess("챗봇 메시지를 발송했습니다.");
      setBotContent("");
      setTimeout(() => {
        setIsBotModalOpen(false);
        setBotSuccess("");
      }, 1200);
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
        <AdminHero>
          <AdminHeroContent>
            <AdminHeroEyebrow>
              <MessageSquare size={14} /> Open Chat Management
            </AdminHeroEyebrow>
            <AdminHeroTitle>오픈채팅방 관리</AdminHeroTitle>
            <AdminHeroDescription>
              기숙사 공식 오픈채팅방을 생성·수정·삭제하고, 전체 오픈채팅방 목록을 조회하며 챗봇 메시지를 발송할 수 있습니다.
            </AdminHeroDescription>
          </AdminHeroContent>
          <AdminHeroMetricGrid>
            <AdminMiniStat>
              <AdminMiniStatLabel>전체 오픈채팅방</AdminMiniStatLabel>
              <AdminMiniStatValue>{rooms.length}개</AdminMiniStatValue>
            </AdminMiniStat>
            <AdminMiniStat>
              <AdminMiniStatLabel>검색된 채팅방</AdminMiniStatLabel>
              <AdminMiniStatValue>{filteredRooms.length}개</AdminMiniStatValue>
            </AdminMiniStat>
          </AdminHeroMetricGrid>
        </AdminHero>

        <AdminStack>
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitleGroup>
                <AdminCardTitle>채팅방 목록</AdminCardTitle>
                <AdminCardDescription>
                  개인 채팅방을 제외한 전체 오픈채팅방 목록입니다. 공식 채팅방 수정/삭제 및 챗봇 메시지 전송이 가능합니다.
                </AdminCardDescription>
              </AdminCardTitleGroup>
              <HeaderButtonRow>
                <AdminButton $tone="secondary" onClick={() => void fetchRooms()} disabled={loading}>
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  새로고침
                </AdminButton>
                <AdminButton $tone="secondary" onClick={() => handleOpenBotModal()} disabled={rooms.length === 0}>
                  <Bot size={16} />
                  챗봇 메시지 발송
                </AdminButton>
                <AdminButton $tone="primary" onClick={handleOpenCreate}>
                  <PlusCircle size={16} />
                  공식 채팅방 생성
                </AdminButton>
              </HeaderButtonRow>
            </AdminCardHeader>

            <SearchWrapper>
              <SearchIconWrapper>
                <Search size={18} />
              </SearchIconWrapper>
              <AdminInput
                type="text"
                placeholder="채팅방 이름 또는 방 번호(ID)로 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ paddingLeft: "42px" }}
              />
              {searchKeyword && (
                <ClearSearchButton onClick={() => setSearchKeyword("")} type="button">
                  <X size={16} />
                </ClearSearchButton>
              )}
            </SearchWrapper>

            {loading ? (
              <LoadingContainer>
                <LoadingSpinner />
              </LoadingContainer>
            ) : filteredRooms.length === 0 ? (
              <AdminEmptyState>
                <AdminEmptyTitle>
                  {searchKeyword ? "검색 결과가 없습니다" : "등록된 오픈채팅방이 없습니다"}
                </AdminEmptyTitle>
                <AdminEmptyDescription>
                  {searchKeyword
                    ? `"${searchKeyword}" 키워드와 일치하는 오픈채팅방이 없습니다. 다른 검색어를 입력해 보세요.`
                    : "현재 등록된 오픈채팅방이 없습니다. 공식 채팅방을 생성해 보세요."}
                </AdminEmptyDescription>
                {!searchKeyword && (
                  <AdminButton $tone="primary" onClick={handleOpenCreate} style={{ marginTop: "12px" }}>
                    <PlusCircle size={16} />
                    기숙사 공식 채팅방 생성하기
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
                          <AdminBadge $tone="blue">ID: {room.roomId}</AdminBadge>
                        </RoomItemHeader>
                        <RoomItemTitle>{room.roomName}</RoomItemTitle>
                      </RoomItemMain>

                      <RoomItemActions>
                        <ActionButton
                          $tone="ghost"
                          onClick={() => handleOpenBotModal(room)}
                          title="챗봇 메시지 발송"
                        >
                          <Bot size={16} color="#7c3aed" />
                          <span>챗봇 발송</span>
                        </ActionButton>
                        <ActionButton
                          $tone="secondary"
                          onClick={() => handleOpenEdit(room)}
                          title="공식 채팅방 수정"
                        >
                          <PencilLine size={16} />
                          <span>공식방 수정</span>
                        </ActionButton>
                        <ActionButton
                          $tone="danger"
                          onClick={() => void handleDeleteRoom(room)}
                          disabled={deletingRoomId === room.roomId}
                          title="공식 채팅방 삭제"
                        >
                          <Trash2 size={16} />
                          <span>{deletingRoomId === room.roomId ? "삭제 중..." : "공식방 삭제"}</span>
                        </ActionButton>
                      </RoomItemActions>
                    </RoomItemCard>
                  ))}
                </RoomListContainer>
              </AdminScrollableArea>
            )}
          </AdminCard>
        </AdminStack>

        {/* Create Dorm Official Room Modal */}
        <AdminModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          maxWidth="560px"
        >
          <ModalFormContainer as="form" onSubmit={handleCreateSubmit}>
            <ModalFormHeader>
              <ModalTitleGroup>
                <ModalTitle>기숙사 공식 채팅방 생성</ModalTitle>
                <ModalSubtitle>기숙사 구분과 방 이름, 설명을 입력해 공식 채팅방을 생성합니다.</ModalSubtitle>
              </ModalTitleGroup>
              <ModalCloseButton type="button" onClick={() => setIsCreateOpen(false)}>
                <X size={20} />
              </ModalCloseButton>
            </ModalFormHeader>

            <ModalFormBody>
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
                  placeholder="공식 채팅방에 대한 안내 및 공지사항을 입력해 주세요."
                  value={createForm.description}
                  maxLength={500}
                  style={{ minHeight: "120px" }}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={isCreating}
                />
                <AdminSubtleText>{createForm.description.length}/500</AdminSubtleText>
              </AdminField>

              {createError && <AdminNotice $tone="error">{createError}</AdminNotice>}
            </ModalFormBody>

            <ModalFormFooter>
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
                <PlusCircle size={18} />
                {isCreating ? "생성 중..." : "공식 채팅방 생성"}
              </AdminButton>
            </ModalFormFooter>
          </ModalFormContainer>
        </AdminModal>

        {/* Update Dorm Official Room Modal */}
        <AdminModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          maxWidth="560px"
        >
          <ModalFormContainer as="form" onSubmit={handleEditSubmit}>
            <ModalFormHeader>
              <ModalTitleGroup>
                <ModalTitle>기숙사 공식 채팅방 수정</ModalTitle>
                <ModalSubtitle>
                  채팅방 ID: {selectedRoomForEdit?.roomId} ({selectedRoomForEdit?.roomName})
                </ModalSubtitle>
              </ModalTitleGroup>
              <ModalCloseButton type="button" onClick={() => setIsEditOpen(false)}>
                <X size={20} />
              </ModalCloseButton>
            </ModalFormHeader>

            <ModalFormBody>
              <AdminField>
                <AdminLabel htmlFor="edit-room-name">수정할 채팅방 이름</AdminLabel>
                <AdminInput
                  id="edit-room-name"
                  type="text"
                  placeholder="수정할 채팅방 이름을 입력하세요"
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
                  placeholder="수정할 채팅방 설명을 입력하세요"
                  value={editForm.description}
                  maxLength={500}
                  style={{ minHeight: "120px" }}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={isEditing}
                />
                <AdminSubtleText>{editForm.description.length}/500</AdminSubtleText>
              </AdminField>

              {editError && <AdminNotice $tone="error">{editError}</AdminNotice>}
            </ModalFormBody>

            <ModalFormFooter>
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
                <PencilLine size={18} />
                {isEditing ? "수정 중..." : "수정 완료"}
              </AdminButton>
            </ModalFormFooter>
          </ModalFormContainer>
        </AdminModal>

        {/* Send Bot Message Modal */}
        <AdminModal
          isOpen={isBotModalOpen}
          onClose={() => setIsBotModalOpen(false)}
          maxWidth="560px"
        >
          <ModalFormContainer as="form" onSubmit={handleBotSubmit}>
            <ModalFormHeader>
              <ModalTitleGroup>
                <ModalTitle>챗봇 메시지 발송</ModalTitle>
                <ModalSubtitle>방에 참여하지 않고 보라색 챗봇 말풍선으로 안내 메시지를 발송합니다.</ModalSubtitle>
              </ModalTitleGroup>
              <ModalCloseButton type="button" onClick={() => setIsBotModalOpen(false)}>
                <X size={20} />
              </ModalCloseButton>
            </ModalFormHeader>

            <ModalFormBody>
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
                        [ID: {room.roomId}] {room.roomName}
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
                <AdminSubtleText>{botContent.length}/1000</AdminSubtleText>
              </AdminField>

              {botError && <AdminNotice $tone="error">{botError}</AdminNotice>}
              {botSuccess && (
                <AdminNotice $tone="success">
                  <CheckCircle2 size={18} />
                  {botSuccess}
                </AdminNotice>
              )}
            </ModalFormBody>

            <ModalFormFooter>
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
                <Send size={18} />
                {isSendingBot ? "발송 중..." : "메시지 발송"}
              </AdminButton>
            </ModalFormFooter>
          </ModalFormContainer>
        </AdminModal>
      </AdminPage>
    </AdminShell>
  );
};

export default OpenChatAdminPage;

const HeaderButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  @media (max-width: 640px) {
    width: 100%;
    > button {
      flex: 1 1 auto;
    }
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  pointer-events: none;
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 999px;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
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
  gap: 14px;
  padding: 18px 20px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  transition: all 0.2s ease;

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 10px 24px -16px rgba(37, 99, 235, 0.15);
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
  gap: 6px;
  min-width: 0;
  flex: 1;
`;

const RoomItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RoomItemTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
`;

const RoomItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    > button {
      flex: 1 1 auto;
    }
  }
`;

const ActionButton = styled.button<{
  $tone?: "primary" | "secondary" | "danger" | "ghost";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $tone }) => {
    switch ($tone) {
      case "danger":
        return `
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
          &:hover:not(:disabled) {
            background: #ffe4e6;
            border-color: #fb7185;
          }
        `;
      case "secondary":
        return `
          background: #f8fafc;
          color: #0f172a;
          border: 1px solid #cbd5e1;
          &:hover:not(:disabled) {
            background: #eef4ff;
            border-color: #93c5fd;
          }
        `;
      case "ghost":
      default:
        return `
          background: #f5f3ff;
          color: #6d28d9;
          border: 1px solid #ddd6fe;
          &:hover:not(:disabled) {
            background: #ede9fe;
            border-color: #c4b5fd;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 20px;
  max-height: 80vh;
  overflow-y: auto;

  @media (min-width: 768px) {
    padding: 28px;
  }
`;

const ModalFormHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const ModalTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
`;

const ModalCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 12px;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
`;

const ModalFormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModalFormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
`;
