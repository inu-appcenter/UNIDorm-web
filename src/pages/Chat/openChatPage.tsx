import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { isAxiosError } from "axios";
import {
  getOpenChatMessages,
  getOpenChatRooms,
  joinOpenChatRoom,
} from "@/apis/openchat";
import {
  getRoommateChatRooms,
  patchRoommateChatRead,
  getRoommateChatUnreadCount,
  getAllRoommateChatUnreadCount,
} from "@/apis/chat";
import OpenChatRoomCard from "@/components/chat/OpenChatRoomCard";
import OpenChatTab from "@/components/chat/OpenChatTab";
import OpenChatEmptyState from "@/components/chat/OpenChatEmptyState";
import OpenChatJoinModal from "@/components/modal/OpenChatJoinModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { OpenChatRoom, OpenChatTab as OpenChatTabType } from "@/types/openchat";
import { RoommateChatRoom } from "@/types/chats";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import { Search, Plus, MapPin } from "lucide-react";
import { formatChatMessagePreview } from "@/utils/chatMessagePreview";

const formatTime = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "방금";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
};

function RoommateChatCard({
  room,
  onClick,
}: {
  room: RoommateChatRoom;
  onClick: () => void;
}) {
  const [unreadCount, setUnreadCount] = useState(room.unreadCount ?? 0);

  useEffect(() => {
    setUnreadCount(room.unreadCount ?? 0);
    getRoommateChatUnreadCount(room.chatRoomId)
      .then((res) => setUnreadCount(res.data))
      .catch((err) =>
        console.error("룸메이트 안 읽은 메시지 수 조회 실패", err),
      );
  }, [room.chatRoomId, room.unreadCount]);

  const isMyRoommate = Boolean(
    room.roommate ||
      room.isMyRoommate ||
      room.myRoommate ||
      room.matched ||
      room.isRoommate,
  );

  return (
    <RoommateCard type="button" onClick={onClick} $isMyRoommate={isMyRoommate}>
      <CardLeft>
        {isMyRoommate && (
          <RoommateBadge>
            <MapPin size={12} color="#1677ff" style={{ marginRight: 4 }} />내
            룸메이트
          </RoommateBadge>
        )}
        <RoomName>
          {room.partnerName || room.opponentNickname || "익명"}
        </RoomName>
        <LastMessage>
          {formatChatMessagePreview(room.lastMessage, "대화 내역이 없습니다.")}
        </LastMessage>
      </CardLeft>
      <CardRight>
        <TimeText>
          {room.lastMessageTime ? formatTime(room.lastMessageTime) : ""}
        </TimeText>
        {unreadCount > 0 && (
          <UnreadBadge>{unreadCount > 99 ? "99+" : unreadCount}</UnreadBadge>
        )}
      </CardRight>
    </RoommateCard>
  );
}

const VALID_TABS: OpenChatTabType[] = ["MY", "DORMITORY", "ALL"];

type MyChatRoomFilter = "ALL" | "OPEN_CHAT" | "ROOMMATE";

const MY_CHAT_ROOM_FILTERS: {
  value: MyChatRoomFilter;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "OPEN_CHAT", label: "오픈채팅" },
  { value: "ROOMMATE", label: "룸메채팅" },
];

export default function OpenChatPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);

  const tabParam = searchParams.get("tab") as OpenChatTabType | null;
  const selectedTab: OpenChatTabType =
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : "MY";

  const filterParam = searchParams.get("filter") as MyChatRoomFilter | null;
  const myChatRoomFilter: MyChatRoomFilter =
    filterParam && ["ALL", "OPEN_CHAT", "ROOMMATE"].includes(filterParam)
      ? filterParam
      : "ALL";

  const [rooms, setRooms] = useState<OpenChatRoom[]>([]);
  const [roommateRooms, setRoommateRooms] = useState<RoommateChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<OpenChatRoom | null>(null);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [roommateUnreadTotal, setRoommateUnreadTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = useCallback(
    (tab: OpenChatTabType) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("tab", tab);
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleFilterChange = useCallback(
    (filter: MyChatRoomFilter) => {
      const nextParams = new URLSearchParams(searchParams);
      if (filter === "ALL") {
        nextParams.delete("filter");
      } else {
        nextParams.set("filter", filter);
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const fillMissingPersonalLastMessages = useCallback(
    async (chatRooms: OpenChatRoom[]) =>
      Promise.all(
        chatRooms.map(async (room) => {
          const needsMessageFallback = !String(room.lastMessage ?? "").trim();
          if (room.roomType !== "PERSONAL" || !needsMessageFallback)
            return room;

          try {
            const messagesResponse = await getOpenChatMessages(
              room.roomId,
              null,
              1,
            );
            const latestMessage = messagesResponse.data.messages[0];

            return {
              ...room,
              lastMessage: latestMessage?.content || "",
              lastMessageAt: latestMessage?.createdAt || room.lastMessageAt,
            };
          } catch (error) {
            console.error("개인 채팅 최신 메시지 조회 실패:", error);
            return room;
          }
        }),
      ),
    [],
  );

  const fetchChatRooms = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!isLoggedIn) {
        setRooms([]);
        setRoommateRooms([]);
        setRoommateUnreadTotal(0);
        return;
      }

      try {
        if (!silent) setIsLoading(true);
        if (selectedTab === "MY") {
          const [openChatRes, roommateChatRes, unreadRes] = await Promise.all([
            getOpenChatRooms("MY", 0, 20, searchQuery || undefined),
            getRoommateChatRooms(),
            getAllRoommateChatUnreadCount(),
          ]);
          const openChatRooms = openChatRes.data.content.filter(
            (room) => room.chatCategory === "OPEN_CHAT",
          );
          const dedicatedRoommateRooms = roommateChatRes.data;
          const dedicatedRoommateRoomIds = new Set(
            dedicatedRoommateRooms.map((room) => room.chatRoomId),
          );
          const restoredRoommateRooms: RoommateChatRoom[] =
            openChatRes.data.content
              .filter(
                (room) =>
                  room.chatCategory === "ROOMMATE" &&
                  !dedicatedRoommateRoomIds.has(room.roomId),
              )
              .map((room) => ({
                chatRoomId: room.roomId,
                opponentNickname: room.name,
                lastMessage: room.lastMessage,
                lastMessageTime: room.lastMessageAt,
                partnerId: 0,
                partnerName: room.name,
                partnerProfileImageUrl: "",
                unreadCount: room.unreadCount,
              }));
          setRooms(await fillMissingPersonalLastMessages(openChatRooms));
          setRoommateRooms([
            ...dedicatedRoommateRooms,
            ...restoredRoommateRooms,
          ]);
          setRoommateUnreadTotal(unreadRes.data);
        } else {
          setRoommateRooms([]);
          const [openChatRes, unreadRes] = await Promise.all([
            getOpenChatRooms(
              selectedTab,
              0,
              20,
              searchQuery || undefined,
              "createdAt,desc",
            ),
            getAllRoommateChatUnreadCount(),
          ]);
          setRooms(
            openChatRes.data.content.filter(
              (room) => room.chatCategory === "OPEN_CHAT",
            ),
          );
          setRoommateUnreadTotal(unreadRes.data);
        }
      } catch (error) {
        console.error("채팅방 목록 조회 실패", error);
        setRooms([]);
        setRoommateRooms([]);
        setRoommateUnreadTotal(0);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [fillMissingPersonalLastMessages, isLoggedIn, searchQuery, selectedTab],
  );

  useEffect(() => {
    void fetchChatRooms();
  }, [fetchChatRooms]);

  useEffect(() => {
    if (!isLoggedIn || selectedTab !== "MY") return;

    const refreshSilently = () => {
      void fetchChatRooms({ silent: true });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshSilently();
    };

    window.addEventListener("focus", refreshSilently);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const refreshTimer = window.setInterval(refreshSilently, 10_000);

    return () => {
      window.removeEventListener("focus", refreshSilently);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(refreshTimer);
    };
  }, [fetchChatRooms, isLoggedIn, selectedTab]);

  const handleRoommateClick = async (room: RoommateChatRoom) => {
    try {
      await patchRoommateChatRead(room.chatRoomId);
    } catch (err) {
      console.error("채팅 읽음 처리 실패", err);
    }

    const opponentBoardTitle = room.opponentBoardTitle?.trim();
    const myBoardTitle = room.myBoardTitle?.trim();

    navigate(`/chat/roommate/${room.chatRoomId}`, {
      state: {
        partnerName: room.partnerName,
        partnerProfileImageUrl: room.partnerProfileImageUrl,
        roommateBoardTitle: opponentBoardTitle || myBoardTitle,
        roommateBoardOwner: opponentBoardTitle
          ? "opponent"
          : myBoardTitle
            ? "me"
            : undefined,
      },
    });
  };

  const handleClickRoom = (room: OpenChatRoom) => {
    if (room.joined) {
      const chatRoute = room.roomType === "PERSONAL" ? "personal" : "open";
      navigate(`/chat/${chatRoute}/${room.roomId}`, {
        state: {
          partnerName: room.roomType === "PERSONAL" ? room.name : undefined,
          roomName: room.name,
          roomDescription: room.description,
          room,
        },
      });
      return;
    }

    setSelectedRoom(room);
    setIsJoinModalOpen(true);
  };

  const joinSelectedRoom = async (): Promise<boolean> => {
    if (!selectedRoom || isJoining) return false;

    try {
      setIsJoining(true);
      const roomToJoin = selectedRoom;
      const response = await joinOpenChatRoom(roomToJoin.roomId);
      const targetRoomId = response.data?.roomId ?? roomToJoin.roomId;
      const targetRoomName = response.data?.name ?? roomToJoin.name;
      const joinedRoom: OpenChatRoom = {
        ...roomToJoin,
        ...response.data,
        roomId: targetRoomId,
        name: targetRoomName,
        joined: true,
      };

      setIsJoinModalOpen(false);
      setSelectedRoom(null);
      setIsJoining(false);

      navigate(`/chat/open/${targetRoomId}`, {
        state: {
          roomName: targetRoomName,
          roomDescription: joinedRoom.description,
          room: joinedRoom,
        },
      });
      return true;
    } catch (error) {
      console.error("오픈채팅방 참여 실패", error);
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400) {
          alert("채팅방에 참여할 수 없습니다.");
        } else if (status === 401) {
          alert("로그인이 필요합니다.");
          navigate("/login");
        } else if (status === 404) {
          alert("채팅방을 찾을 수 없습니다.");
        } else if (status === 409) {
          alert("참여 인원이 가득 찼습니다. (최대 인원 초과)");
        } else {
          alert("채팅방 입장에 실패했습니다. 다시 시도해 주세요.");
        }
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinRoom = () => joinSelectedRoom();

  const handleCloseModal = () => {
    if (isJoining) return;
    setIsJoinModalOpen(false);
    setSelectedRoom(null);
  };

  const openChatUnreadTotal = rooms.reduce(
    (acc, r) => acc + (r.unreadCount || 0),
    0,
  );
  const totalUnreadCount = roommateUnreadTotal + openChatUnreadTotal;
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");
  const includesSearchQuery = (value: unknown) =>
    String(value ?? "")
      .toLocaleLowerCase("ko-KR")
      .includes(normalizedSearchQuery);

  const filteredRoommateRooms = roommateRooms.filter(
    (room) =>
      includesSearchQuery(room.partnerName || room.opponentNickname) ||
      includesSearchQuery(formatChatMessagePreview(room.lastMessage)),
  );

  const filteredRooms = rooms.filter(
    (room) =>
      includesSearchQuery(room.name) ||
      includesSearchQuery(room.description) ||
      includesSearchQuery(formatChatMessagePreview(room.lastMessage)),
  );
  const latestPublicRooms = [...filteredRooms].sort(
    (firstRoom, secondRoom) => secondRoom.roomId - firstRoom.roomId,
  );

  const categoryFilteredRoommateRooms =
    myChatRoomFilter === "ALL" || myChatRoomFilter === "ROOMMATE"
      ? filteredRoommateRooms
      : [];
  const categoryFilteredRooms =
    myChatRoomFilter === "ALL" || myChatRoomFilter === "OPEN_CHAT"
      ? filteredRooms
      : [];

  const mergedMyRooms = [
    ...categoryFilteredRoommateRooms.map((room) => ({
      ...room,
      itemType: "roommate" as const,
    })),
    ...categoryFilteredRooms.map((room) => ({
      ...room,
      itemType: "open" as const,
    })),
  ].sort((a, b) => {
    const isPinnedRoommate = (room: typeof a | typeof b): boolean =>
      room.itemType === "roommate" &&
      Boolean(
        (room as RoommateChatRoom).isMyRoommate ||
          (room as RoommateChatRoom).roommate ||
          (room as RoommateChatRoom).myRoommate ||
          (room as RoommateChatRoom).matched ||
          (room as RoommateChatRoom).isRoommate,
      );
    const pinnedDifference =
      Number(isPinnedRoommate(b)) - Number(isPinnedRoommate(a));
    if (pinnedDifference !== 0) return pinnedDifference;

    const timeA =
      a.itemType === "roommate"
        ? (a as RoommateChatRoom).lastMessageTime
        : (a as OpenChatRoom).lastMessageAt;
    const timeB =
      b.itemType === "roommate"
        ? (b as RoommateChatRoom).lastMessageTime
        : (b as OpenChatRoom).lastMessageAt;

    const timestampA = timeA ? Date.parse(timeA) : 0;
    const timestampB = timeB ? Date.parse(timeB) : 0;
    const safeTimestampA = Number.isFinite(timestampA) ? timestampA : 0;
    const safeTimestampB = Number.isFinite(timestampB) ? timestampB : 0;

    return safeTimestampB - safeTimestampA;
  });

  useSetHeader({
    title: "채팅",
    showAlarm: isLoggedIn,
    headerRightElement: !isLoggedIn ? (
      <HeaderSearchButton
        type="button"
        aria-label="채팅방 검색"
        onClick={() => searchInputRef.current?.focus()}
      >
        <Search size={28} />
      </HeaderSearchButton>
    ) : null,
    secondHeader: (
      <OpenChatTab
        selectedTab={selectedTab}
        onChangeTab={handleTabChange}
        unreadCount={totalUnreadCount}
      />
    ),
  });

  return (
    <PageContainer>
      <Content>
        <SearchBox>
          <SearchInput
            ref={searchInputRef}
            type="text"
            placeholder="방 이름/설명 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={20} color="#1677ff" />
        </SearchBox>

        {isLoggedIn && selectedTab === "MY" && (
          <MyChatFilterList aria-label="채팅방 유형">
            {MY_CHAT_ROOM_FILTERS.map((filter) => (
              <MyChatFilterButton
                key={filter.value}
                type="button"
                aria-pressed={myChatRoomFilter === filter.value}
                $active={myChatRoomFilter === filter.value}
                onClick={() => handleFilterChange(filter.value)}
              >
                {filter.label}
              </MyChatFilterButton>
            ))}
          </MyChatFilterList>
        )}

        {!isLoggedIn ? (
          <LoginPromptWrapper>
            <LoginTitle>로그인이 필요합니다.</LoginTitle>
            <LoginDescription>
              내 기숙사 방이나 전체 방에서
              <br />
              설명을 보고 참여해보세요
            </LoginDescription>
            <LoginButton type="button" onClick={() => navigate("/login")}>
              참여하기
            </LoginButton>
          </LoginPromptWrapper>
        ) : isLoading ? (
          <LoadingSpinner message="채팅방을 불러오는 중입니다." />
        ) : selectedTab === "MY" ? (
          mergedMyRooms.length === 0 ? (
            searchQuery.trim() || myChatRoomFilter !== "ALL" ? (
              <FilteredEmptyMessage>
                {searchQuery.trim()
                  ? "검색 결과가 없습니다."
                  : "해당 유형의 채팅방이 없습니다."}
              </FilteredEmptyMessage>
            ) : (
              <OpenChatEmptyState
                tab={selectedTab}
                onClickMoveDormitory={() => handleTabChange("DORMITORY")}
              />
            )
          ) : (
            <RoomList>
              {mergedMyRooms.map((item) => {
                if (item.itemType === "roommate") {
                  return (
                    <RoommateChatCard
                      key={`roommate-${item.chatRoomId}`}
                      room={item}
                      onClick={() => handleRoommateClick(item)}
                    />
                  );
                } else {
                  return (
                    <OpenChatRoomCard
                      key={`open-${item.roomId}`}
                      room={item}
                      tab={selectedTab}
                      onClick={() => handleClickRoom(item)}
                    />
                  );
                }
              })}
            </RoomList>
          )
        ) : latestPublicRooms.length === 0 ? (
          <OpenChatEmptyState
            tab={selectedTab}
            onClickMoveDormitory={() => handleTabChange("DORMITORY")}
          />
        ) : (
          <RoomList>
            {latestPublicRooms.map((room) => (
              <OpenChatRoomCard
                key={room.roomId}
                room={room}
                tab={selectedTab}
                onClick={() => handleClickRoom(room)}
              />
            ))}
          </RoomList>
        )}
      </Content>

      {isLoggedIn && (
        <CreateButton
          type="button"
          onClick={() => navigate("/chat/open/create")}
        >
          <Plus size={20} color="white" />
          <ButtonText>방만들기</ButtonText>
        </CreateButton>
      )}

      <OpenChatJoinModal
        isOpen={isJoinModalOpen}
        room={selectedRoom}
        onClose={handleCloseModal}
        onJoin={handleJoinRoom}
        isJoining={isJoining}
      />

    </PageContainer>
  );
}

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  color: #222222;
`;

const Content = styled.main`
  padding: 40px 20px 100px;
`;

const SearchBox = styled.div`
  width: 100%;
  height: 40px;
  margin: 16px 0;
  border: 1px solid #dfdfdf;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  box-sizing: border-box;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  color: #3d3d3d;
  background-color: transparent;
  padding: 0;

  &::placeholder {
    color: #8b8b8b;
  }
`;

const HeaderSearchButton = styled.button`
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #242424;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const MyChatFilterList = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MyChatFilterButton = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  padding: 0;
  border: none;
  border-radius: 24px;
  background: transparent;
  color: ${({ $active }) => ($active ? "#1677ff" : "#8b8b8b")};
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  cursor: pointer;
`;

const FilteredEmptyMessage = styled.p`
  margin: 64px 0 0;
  color: #8b8b8b;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
`;

const RoomList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CreateButton = styled.button`
  position: fixed;
  right: max(16px, env(safe-area-inset-right));
  bottom: calc(88px + env(safe-area-inset-bottom));
  z-index: 100;
  width: 62px;
  height: 62px;
  border: none;
  border-radius: 50%;
  background-color: #ffc53d;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  padding: 8px;
  box-sizing: border-box;
`;

const ButtonText = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
`;

const LoginPromptWrapper = styled.div`
  width: 100%;
  min-height: 304px;
  margin: 28px auto 0;
  padding: 44px 20px 38px;
  border: none;
  border-radius: 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
`;

const LoginTitle = styled.h3`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.5;
  text-align: center;
  color: #1f2430;
  word-break: keep-all;
`;

const LoginDescription = styled.p`
  margin: 20px 0 40px;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #8b8b8b;
  text-align: center;
  word-break: keep-all;
`;

const LoginButton = styled.button`
  width: min(230px, 100%);
  height: 60px;
  border: none;
  border-radius: 999px;
  background: #1677ff;
  color: #ffffff;
  font-size: 18px;
  font-weight: 400;
  cursor: pointer;
`;

const RoommateCard = styled.button<{ $isMyRoommate?: boolean }>`
  width: 100%;
  padding: 16px;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  background-color: ${({ $isMyRoommate }) =>
    $isMyRoommate ? "#e6f4ff" : "#ffffff"};
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  box-sizing: border-box;
  transition: background-color 0.2s ease;
`;

const CardLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
`;

const RoommateBadge = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  color: #1677ff;
  margin-bottom: 8px;
`;

const CardRight = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-left: 12px;
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
  width: 100%;
`;

const LastMessage = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  font-weight: 400;
  color: #8b8b8b;
  line-height: 1.5;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const TimeText = styled.span`
  font-size: 12px;
  color: #8b8b8b;
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
