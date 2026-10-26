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
import { useSetHeader } from "@/hooks/useSetHeader";
import { useUserRole } from "@/hooks/useUserRole";
import useUserStore from "@/stores/useUserStore";
import { useCountUp } from "@/hooks/useCountUp";
import { complainDormitory } from "@/constants/constants";
import type {
  AdminOpenChatRoom,
  CreateDormOfficialRoomRequest,
  UpdateDormOfficialRoomRequest,
} from "@/types/openchat";

const PAGE_SIZE = 10;

const INITIAL_CREATE_FORM: CreateDormOfficialRoomRequest = {
  dormType: complainDormitory[0] ?? "1기숙사",
  name: "",
  description: "",
};

const INITIAL_EDIT_FORM: UpdateDormOfficialRoomRequest = {
  name: "",
  description: "",
};

export default function OpenChatAdminPage() {
  const navigate = useNavigate();
  const { isMainAdmin } = useUserRole();
  const { isLoading: isUserLoading } = useUserStore();

  useSetHeader({ title: "오픈채팅방 관리" });

  useEffect(() => {
    if (!isUserLoading && !isMainAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isMainAdmin, isUserLoading, navigate]);

  const {
    data: rooms = [],
    isLoading: loading,
    refetch: fetchRooms,
  } = useAdminOpenChatRooms({ enabled: isMainAdmin });

  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 모달 상태
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateDormOfficialRoomRequest>(INITIAL_CREATE_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<AdminOpenChatRoom | null>(null);
  const [editForm, setEditForm] = useState<UpdateDormOfficialRoomRequest>(INITIAL_EDIT_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");

  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [selectedRoomForBot, setSelectedRoomForBot] = useState<AdminOpenChatRoom | null>(null);
  const [botContent, setBotContent] = useState("");
  const [isSendingBot, setIsSendingBot] = useState(false);
  const [botError, setBotError] = useState("");
  const [botSuccess, setBotSuccess] = useState("");

  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);

  // 검색 필터링
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

  // 슬라이딩 윈도우 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const currentSafePage = Math.min(currentPage, totalPages);

  const paginatedRooms = useMemo(() => {
    const start = (currentSafePage - 1) * PAGE_SIZE;
    return filteredRooms.slice(start, start + PAGE_SIZE);
  }, [filteredRooms, currentSafePage]);

  const visiblePages = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, currentSafePage - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - windowSize + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentSafePage, totalPages]);

  // 생성 핸들러
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
      alert("기숙사 공식 채팅방을 만들었어요.");
      setIsCreateOpen(false);
      await fetchRooms();
    } catch (error) {
      console.error("공식 채팅방 생성 실패:", error);
      if (isAxiosError(error) && error.response?.status === 403) {
        setCreateError("관리자 권한이 없어요.");
      } else {
        setCreateError("공식 채팅방을 만들지 못했어요. 다시 시도해 주세요.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // 수정 핸들러
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
      alert("기숙사 공식 채팅방 정보를 수정했어요.");
      setIsEditOpen(false);
      setSelectedRoomForEdit(null);
      await fetchRooms();
    } catch (error) {
      console.error("공식 채팅방 수정 실패:", error);
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          setEditError("관리자 권한이 없어요.");
        } else if (error.response?.status === 404) {
          setEditError("해당 기숙사 공식 채팅방을 찾을 수 없어요.");
        } else {
          setEditError("공식 채팅방 정보를 수정하지 못했어요. 다시 시도해 주세요.");
        }
      } else {
        setEditError("공식 채팅방 정보를 수정하지 못했어요.");
      }
    } finally {
      setIsEditing(false);
    }
  };

  // 삭제 핸들러
  const handleDeleteRoom = async (room: AdminOpenChatRoom) => {
    if (
      !window.confirm(
        `"${room.roomName}" (ID: ${room.roomId}) 공식 채팅방을 삭제할까요?\n삭제하면 되돌릴 수 없어요.`,
      )
    ) {
      return;
    }

    setDeletingRoomId(room.roomId);
    try {
      await deleteDormOfficialRoom(room.roomId);
      alert("기숙사 공식 채팅방을 삭제했어요.");
      await fetchRooms();
    } catch (error) {
      console.error("공식 채팅방 삭제 실패:", error);
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          alert("관리자 권한이 없어요.");
        } else if (error.response?.status === 404) {
          alert("삭제할 기숙사 공식 채팅방을 찾을 수 없어요.");
        } else {
          alert("공식 채팅방을 삭제하지 못했어요. 다시 시도해 주세요.");
        }
      } else {
        alert("공식 채팅방을 삭제하지 못했어요.");
      }
    } finally {
      setDeletingRoomId(null);
    }
  };

  // 챗봇 메시지 모달
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
      setBotSuccess("챗봇 메시지를 보냈어요.");
      setBotContent("");
      setTimeout(() => {
        setIsBotModalOpen(false);
        setBotSuccess("");
      }, 1000);
    } catch (error) {
      console.error("챗봇 메시지 발송 실패:", error);
      if (isAxiosError(error)) {
        if (error.response?.status === 400) {
          setBotError("개인 채팅방에는 챗봇 메시지를 보낼 수 없어요.");
        } else if (error.response?.status === 403) {
          setBotError("관리자 권한이 없어요.");
        } else if (error.response?.status === 404) {
          setBotError("선택한 채팅방을 찾을 수 없어요.");
        } else {
          setBotError("챗봇 메시지를 보내지 못했어요. 다시 시도해 주세요.");
        }
      } else {
        setBotError("챗봇 메시지를 보내지 못했어요.");
      }
    } finally {
      setIsSendingBot(false);
    }
  };

  return (
    <PageRoot>
      <ContentContainer>
        {/* 상단 통계 칩 */}
        <StatsGrid>
          <StatMiniCard>
            <StatMiniLabel>전체 오픈채팅방</StatMiniLabel>
            <StatMiniValue>{animatedTotalRooms}개</StatMiniValue>
          </StatMiniCard>
          <StatMiniCard>
            <StatMiniLabel>검색된 채팅방</StatMiniLabel>
            <StatMiniValue style={{ color: "#3182f6" }}>
              {animatedFilteredRooms}개
            </StatMiniValue>
          </StatMiniCard>
        </StatsGrid>

        {/* 메인 관리 카드 */}
        <MainCard>
          <ToolbarArea>
            <SearchWrapper>
              <SearchInput
                type="text"
                placeholder="채팅방 이름 또는 방 번호(#ID) 검색..."
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchKeyword && (
                <ClearButton
                  type="button"
                  onClick={() => {
                    setSearchKeyword("");
                    setCurrentPage(1);
                  }}
                  aria-label="검색어 지우기"
                >
                  ✕
                </ClearButton>
              )}
            </SearchWrapper>

            <ActionButtonsGroup>
              <SecondaryActionButton
                type="button"
                onClick={() => void fetchRooms()}
                disabled={loading}
              >
                새로고침
              </SecondaryActionButton>
              <SecondaryActionButton
                type="button"
                onClick={() => handleOpenBotModal()}
                disabled={rooms.length === 0}
              >
                챗봇 공지 발송
              </SecondaryActionButton>
              <DesktopPrimaryButton type="button" onClick={handleOpenCreate}>
                공식 채팅방 생성
              </DesktopPrimaryButton>
            </ActionButtonsGroup>
          </ToolbarArea>

          {/* 목록 본문 */}
          {loading ? (
            <LoadingContainer>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </LoadingContainer>
          ) : filteredRooms.length === 0 ? (
            <EmptyState>
              <EmptyTitle>
                {searchKeyword
                  ? "검색 결과와 일치하는 채팅방이 없어요"
                  : "등록된 기숙사 공식 채팅방이 없어요"}
              </EmptyTitle>
              <EmptyDescription>
                {searchKeyword
                  ? "검색 키워드를 확인하거나 초기화해 보세요."
                  : "새로운 기숙사 공식 오픈채팅방을 만들어 보세요."}
              </EmptyDescription>
              {!searchKeyword && (
                <PrimaryActionButton type="button" onClick={handleOpenCreate}>
                  공식 채팅방 만들기
                </PrimaryActionButton>
              )}
            </EmptyState>
          ) : (
            <>
              {/* PC 전용 와이드 데이터 테이블 */}
              <DesktopTableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ width: "12%" }}>방 번호</Th>
                      <Th style={{ width: "50%" }}>채팅방 이름</Th>
                      <Th style={{ width: "38%", textAlign: "right" }}>관리 옵션</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRooms.map((room) => (
                      <tr key={room.roomId}>
                        <Td>
                          <RoomIdBadge>#{room.roomId}</RoomIdBadge>
                        </Td>
                        <Td>
                          <RoomNameText>{room.roomName}</RoomNameText>
                        </Td>
                        <Td style={{ textAlign: "right" }}>
                          <TableActions>
                            <GhostButton
                              type="button"
                              onClick={() => handleOpenBotModal(room)}
                            >
                              챗봇 발송
                            </GhostButton>
                            <TableSecondaryButton
                              type="button"
                              onClick={() => handleOpenEdit(room)}
                            >
                              수정
                            </TableSecondaryButton>
                            <DangerButton
                              type="button"
                              onClick={() => void handleDeleteRoom(room)}
                              disabled={deletingRoomId === room.roomId}
                            >
                              {deletingRoomId === room.roomId ? "삭제 중..." : "삭제"}
                            </DangerButton>
                          </TableActions>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </DesktopTableWrapper>

              {/* 모바일 전용 ListRow 카드 */}
              <MobileListWrapper>
                {paginatedRooms.map((room) => (
                  <MobileRow key={room.roomId}>
                    <MobileRowInfo>
                      <MobileMetaRow>
                        <RoomIdBadge>#{room.roomId}</RoomIdBadge>
                      </MobileMetaRow>
                      <RoomNameText>{room.roomName}</RoomNameText>
                    </MobileRowInfo>

                    <MobileActionButtons>
                      <GhostButton
                        type="button"
                        onClick={() => handleOpenBotModal(room)}
                      >
                        챗봇
                      </GhostButton>
                      <TableSecondaryButton
                        type="button"
                        onClick={() => handleOpenEdit(room)}
                      >
                        수정
                      </TableSecondaryButton>
                      <DangerButton
                        type="button"
                        onClick={() => void handleDeleteRoom(room)}
                        disabled={deletingRoomId === room.roomId}
                      >
                        {deletingRoomId === room.roomId ? "삭제 중" : "삭제"}
                      </DangerButton>
                    </MobileActionButtons>
                  </MobileRow>
                ))}
              </MobileListWrapper>

              {/* 슬라이딩 윈도우 페이지네이션 */}
              {totalPages > 1 && (
                <PaginationContainer>
                  <PageNavButton
                    type="button"
                    disabled={currentSafePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-label="이전 페이지"
                  >
                    이전
                  </PageNavButton>

                  <PageNumbersWrapper>
                    {visiblePages.map((pageNum) => (
                      <PageNumberButton
                        key={pageNum}
                        type="button"
                        $isActive={pageNum === currentSafePage}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PageNumberButton>
                    ))}
                  </PageNumbersWrapper>

                  <PageNavButton
                    type="button"
                    disabled={currentSafePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="다음 페이지"
                  >
                    다음
                  </PageNavButton>
                </PaginationContainer>
              )}
            </>
          )}
        </MainCard>
      </ContentContainer>

      {/* 모바일 하단 고정 CTA */}
      <MobileFixedCTA>
        <MobileCTAButton type="button" onClick={handleOpenCreate}>
          공식 채팅방 만들기
        </MobileCTAButton>
      </MobileFixedCTA>

      {/* 공식 채팅방 생성 모달 */}
      {isCreateOpen && (
        <ModalOverlay onClick={() => setIsCreateOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitleGroup>
                <ModalTitle>공식 오픈채팅방 만들기</ModalTitle>
                <ModalSubtitle>기숙사별 공식 오픈채팅방을 새로 개설해요.</ModalSubtitle>
              </ModalTitleGroup>
              <ModalCloseButton type="button" onClick={() => setIsCreateOpen(false)}>
                ✕
              </ModalCloseButton>
            </ModalHeader>

            <ModalForm onSubmit={handleCreateSubmit}>
              <FormGroup>
                <FieldLabel htmlFor="create-dorm-type">대상 기숙사</FieldLabel>
                <SelectInput
                  id="create-dorm-type"
                  value={createForm.dormType}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, dormType: e.target.value }))
                  }
                >
                  {complainDormitory.map((dorm) => (
                    <option key={dorm} value={dorm}>
                      {dorm}
                    </option>
                  ))}
                </SelectInput>
              </FormGroup>

              <FormGroup>
                <FieldLabel htmlFor="create-room-name">채팅방 이름</FieldLabel>
                <TextInput
                  id="create-room-name"
                  type="text"
                  placeholder="예: 제1기숙사 공식 오픈채팅방"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <FieldLabel htmlFor="create-room-desc">채팅방 설명</FieldLabel>
                <TextareaInput
                  id="create-room-desc"
                  placeholder="방의 목적과 기본 수칙을 간결하게 작성해 주세요."
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                />
              </FormGroup>

              {createError && <ErrorMessage>{createError}</ErrorMessage>}

              <ModalActionGroup>
                <SecondaryButton
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                >
                  취소
                </SecondaryButton>
                <PrimarySubmitButton type="submit" disabled={isCreating}>
                  {isCreating ? "개설하고 있어요..." : "공식방 만들기"}
                </PrimarySubmitButton>
              </ModalActionGroup>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 공식 채팅방 수정 모달 */}
      {isEditOpen && selectedRoomForEdit && (
        <ModalOverlay onClick={() => setIsEditOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitleGroup>
                <ModalTitle>공식 채팅방 정보 수정</ModalTitle>
                <ModalSubtitle>방 #{selectedRoomForEdit.roomId}의 정보를 변경해요.</ModalSubtitle>
              </ModalTitleGroup>
              <ModalCloseButton type="button" onClick={() => setIsEditOpen(false)}>
                ✕
              </ModalCloseButton>
            </ModalHeader>

            <ModalForm onSubmit={handleEditSubmit}>
              <FormGroup>
                <FieldLabel htmlFor="edit-room-name">채팅방 이름</FieldLabel>
                <TextInput
                  id="edit-room-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <FieldLabel htmlFor="edit-room-desc">채팅방 설명</FieldLabel>
                <TextareaInput
                  id="edit-room-desc"
                  placeholder="새로운 설명을 입력해 주세요."
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                />
              </FormGroup>

              {editError && <ErrorMessage>{editError}</ErrorMessage>}

              <ModalActionGroup>
                <SecondaryButton
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isEditing}
                >
                  취소
                </SecondaryButton>
                <PrimarySubmitButton type="submit" disabled={isEditing}>
                  {isEditing ? "수정하고 있어요..." : "수정 완료"}
                </PrimarySubmitButton>
              </ModalActionGroup>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 챗봇 메시지 발송 모달 */}
      {isBotModalOpen && (
        <ModalOverlay onClick={() => setIsBotModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitleGroup>
                <ModalTitle>오픈채팅 챗봇 메시지 발송</ModalTitle>
                <ModalSubtitle>지정한 공식 오픈채팅방에 안내 챗봇 공지를 보내요.</ModalSubtitle>
              </ModalTitleGroup>
              <ModalCloseButton type="button" onClick={() => setIsBotModalOpen(false)}>
                ✕
              </ModalCloseButton>
            </ModalHeader>

            <ModalForm onSubmit={handleBotSubmit}>
              <FormGroup>
                <FieldLabel htmlFor="bot-target-room">발송 대상 오픈채팅방</FieldLabel>
                <SelectInput
                  id="bot-target-room"
                  value={selectedRoomForBot?.roomId ?? ""}
                  onChange={(e) => {
                    const found = rooms.find((r) => r.roomId === Number(e.target.value));
                    setSelectedRoomForBot(found ?? null);
                  }}
                >
                  {rooms.map((room) => (
                    <option key={room.roomId} value={room.roomId}>
                      [방 #{room.roomId}] {room.roomName}
                    </option>
                  ))}
                </SelectInput>
              </FormGroup>

              <FormGroup>
                <FieldLabel htmlFor="bot-msg-content">챗봇 메시지 내용</FieldLabel>
                <TextareaInput
                  id="bot-msg-content"
                  rows={5}
                  placeholder="입주 준비물 안내, 공동시설 이용 수칙 등 채팅방에 알릴 내용을 입력해 주세요."
                  value={botContent}
                  onChange={(e) => setBotContent(e.target.value)}
                  maxLength={1000}
                  required
                />
                <FieldCaption>{botContent.length}/1000자</FieldCaption>
              </FormGroup>

              {botError && <ErrorMessage>{botError}</ErrorMessage>}
              {botSuccess && <SuccessMessage>{botSuccess}</SuccessMessage>}

              <ModalActionGroup>
                <SecondaryButton
                  type="button"
                  onClick={() => setIsBotModalOpen(false)}
                  disabled={isSendingBot}
                >
                  취소
                </SecondaryButton>
                <PrimarySubmitButton
                  type="submit"
                  disabled={isSendingBot || !selectedRoomForBot || !botContent.trim()}
                >
                  {isSendingBot ? "발송하고 있어요..." : "챗봇 메시지 보내기"}
                </PrimarySubmitButton>
              </ModalActionGroup>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageRoot>
  );
}

/* ================= Styled Components ================= */

const PageRoot = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 16px 20px calc(90px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: 1024px) {
    padding: 24px 32px 60px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const StatMiniCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatMiniLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #4e5968;
`;

const StatMiniValue = styled.span`
  font-size: 1.35rem;
  font-weight: 800;
  color: #191f28;
  letter-spacing: -0.02em;
`;

/* 메인 카드 */
const MainCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 1024px) {
    padding: 24px;
  }
`;

const ToolbarArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 36px 0 14px;
  font-size: 0.9rem;
  color: #191f28;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }

  &::placeholder {
    color: #8b95a1;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #8b95a1;
  font-size: 0.88rem;
  cursor: pointer;
  padding: 4px;
`;

const ActionButtonsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const SecondaryActionButton = styled.button`
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  color: #4e5968;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease-out;

  &:hover:not(:disabled) {
    background: #f2f4f6;
    color: #191f28;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DesktopPrimaryButton = styled.button`
  display: none;

  @media (min-width: 768px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 18px;
    border-radius: 12px;
    background: #3182f6;
    color: #ffffff;
    font-size: 0.92rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s ease-out;

    &:hover {
      background: #1b64da;
    }
  }
`;

/* PC 테이블 */
const DesktopTableWrapper = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
    width: 100%;
    overflow-x: auto;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 12px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #8b95a1;
  border-bottom: 1px solid #e5e8eb;
`;

const Td = styled.td`
  padding: 16px 14px;
  border-bottom: 1px solid #f2f4f6;
  font-size: 0.92rem;
  vertical-align: middle;
`;

const RoomIdBadge = styled.span`
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 6px;
  background: #e8f3ff;
  color: #3182f6;
  font-size: 0.78rem;
  font-weight: 800;
  font-family: monospace;
`;

const RoomNameText = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: #191f28;
`;

const TableActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
`;

const GhostButton = styled.button`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: none;
  background: #f2f4f6;
  color: #4e5968;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #e5e8eb;
    color: #191f28;
  }
`;

const TableSecondaryButton = styled.button`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #f9fafb;
    color: #191f28;
  }
`;

const DangerButton = styled.button`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: none;
  background: #feecee;
  color: #f04452;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #fdd8db;
  }

  &:disabled {
    opacity: 0.5;
    cursor: wait;
  }
`;

/* 모바일 ListRow */
const MobileListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  divide-y: 1px solid #f2f4f6;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 4px;
  border-bottom: 1px solid #f2f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const MobileRowInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const MobileMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MobileActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

/* 슬라이딩 페이지네이션 */
const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f2f4f6;
  overflow-x: hidden;
`;

const PageNumbersWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageNavButton = styled.button`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;
  color: #4e5968;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #f9fafb;
    color: #191f28;
  }
`;

const PageNumberButton = styled.button<{ $isActive: boolean }>`
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ $isActive }) => ($isActive ? "#3182f6" : "#e5e8eb")};
  background: ${({ $isActive }) => ($isActive ? "#3182f6" : "#ffffff")};
  color: ${({ $isActive }) => ($isActive ? "#ffffff" : "#4e5968")};
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: #3182f6;
    color: ${({ $isActive }) => ($isActive ? "#ffffff" : "#3182f6")};
  }
`;

/* 상태 안내 */
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 0;
`;

const SkeletonRow = styled.div`
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f2f4f6 25%, #e5e8eb 50%, #f2f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 16px;
  text-align: center;
`;

const EmptyTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const EmptyDescription = styled.p`
  font-size: 0.88rem;
  color: #8b95a1;
  margin: 0 0 16px;
`;

const PrimaryActionButton = styled.button`
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  background: #3182f6;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease-out;

  &:hover {
    background: #1b64da;
  }
`;

/* 모바일 하단 고정 CTA */
const MobileFixedCTA = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: linear-gradient(to top, #ffffff 70%, rgba(255, 255, 255, 0));
  padding: 12px 20px calc(14px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCTAButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background: #3182f6;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.28);
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:active {
    transform: scale(0.98);
  }
`;

/* 모달 컴포넌트 */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 640px) {
    max-width: 100%;
    border-radius: 24px 24px 0 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f2f4f6;
`;

const ModalTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ModalTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 800;
  color: #191f28;
  margin: 0;
`;

const ModalSubtitle = styled.p`
  font-size: 0.82rem;
  color: #8b95a1;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: #f2f4f6;
  color: #6b7684;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #e5e8eb;
    color: #191f28;
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 0.86rem;
  font-weight: 700;
  color: #333d4b;
`;

const TextInput = styled.input`
  height: 46px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 14px;
  font-size: 0.92rem;
  color: #191f28;
  outline: none;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const SelectInput = styled.select`
  height: 46px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 0 12px;
  font-size: 0.9rem;
  color: #191f28;
  outline: none;

  &:focus {
    border-color: #3182f6;
  }
`;

const TextareaInput = styled.textarea`
  min-height: 100px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 12px 14px;
  font-size: 0.92rem;
  color: #191f28;
  outline: none;
  resize: vertical;
  line-height: 1.5;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const FieldCaption = styled.span`
  font-size: 0.78rem;
  color: #8b95a1;
  text-align: right;
`;

const ErrorMessage = styled.div`
  padding: 10px 14px;
  border-radius: 10px;
  background: #feecee;
  color: #f04452;
  font-size: 0.84rem;
  font-weight: 600;
`;

const SuccessMessage = styled.div`
  padding: 10px 14px;
  border-radius: 10px;
  background: #e6f8ef;
  color: #04b05c;
  font-size: 0.84rem;
  font-weight: 600;
`;

const ModalActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
`;

const SecondaryButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`;

const PrimarySubmitButton = styled.button`
  flex: 2;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease-out;

  &:hover {
    background: #1b64da;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
