import { useEffect, useState } from "react";
import styled from "styled-components";
import { isAxiosError } from "axios";
import { getOpenChatRooms, joinOpenChatRoom } from "@/apis/openchat";
import { getRoommateChatRooms, patchRoommateChatRead, getRoommateChatUnreadCount, getAllRoommateChatUnreadCount } from "@/apis/chat";
import OpenChatRoomCard from "@/components/chat/OpenChatRoomCard";
import OpenChatTab from "@/components/chat/OpenChatTab";
import OpenChatEmptyState from "@/components/chat/OpenChatEmptyState";
import OpenChatJoinModal from "@/components/modal/OpenChatJoinModal";
import OpenChatPasswordModal from "@/components/modal/OpenChatPasswordModal";
import { OpenChatRoom, OpenChatTab as OpenChatTabType } from "@/types/openchat";
import { RoommateChatRoom } from "@/types/chats";
import { useNavigate } from "react-router-dom";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import { Search, User, Plus } from "lucide-react";

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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getRoommateChatUnreadCount(room.chatRoomId)
      .then((res) => setUnreadCount(res.data))
      .catch((err) => console.error("룸메이트 안 읽은 메시지 수 조회 실패", err));
  }, [room.chatRoomId]);

  return (
    <RoommateCard type="button" onClick={onClick}>
      <CardLeft>
        <RoommateBadge>
          <User size={12} color="#1677ff" style={{ marginRight: 4 }} />
          룸메 매칭
        </RoommateBadge>
        <RoomName>{room.partnerName || room.opponentNickname || "익명"}</RoomName>
        <LastMessage>{room.lastMessage || "대화 내역이 없습니다."}</LastMessage>
      </CardLeft>
      <CardRight>
        <TimeText>{room.lastMessageTime ? formatTime(room.lastMessageTime) : ""}</TimeText>
        {unreadCount > 0 && <UnreadBadge>{unreadCount > 99 ? "99+" : unreadCount}</UnreadBadge>}
      </CardRight>
    </RoommateCard>
  );
}

export default function OpenChatPage() {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);

  const [selectedTab, setSelectedTab] = useState<OpenChatTabType>("MY");
  const [rooms, setRooms] = useState<OpenChatRoom[]>([]);
  const [roommateRooms, setRoommateRooms] = useState<RoommateChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<OpenChatRoom | null>(null);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [roommateUnreadTotal, setRoommateUnreadTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChatRooms = async () => {
    if (!isLoggedIn) {
      setRooms([]);
      setRoommateRooms([]);
      setRoommateUnreadTotal(0);
      return;
    }

    try {
      setIsLoading(true);
      if (selectedTab === "MY") {
        const [openChatRes, roommateChatRes, unreadRes] = await Promise.all([
          getOpenChatRooms("MY"),
          getRoommateChatRooms(),
          getAllRoommateChatUnreadCount(),
        ]);
        setRooms(openChatRes.data.content);
        setRoommateRooms(roommateChatRes.data);
        setRoommateUnreadTotal(unreadRes.data);
      } else {
        setRoommateRooms([]);
        const [openChatRes, unreadRes] = await Promise.all([
          getOpenChatRooms(selectedTab),
          getAllRoommateChatUnreadCount(),
        ]);
        setRooms(openChatRes.data.content);
        setRoommateUnreadTotal(unreadRes.data);
      }
    } catch (error) {
      console.error("채팅방 목록 조회 실패", error);
      setRooms([]);
      setRoommateRooms([]);
      setRoommateUnreadTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, [selectedTab, isLoggedIn]);

  const handleRoommateClick = async (
    chatRoomId: number,
    partnerName?: string,
    partnerProfileImageUrl?: string,
  ) => {
    try {
      await patchRoommateChatRead(chatRoomId);
    } catch (err) {
      console.error("채팅 읽음 처리 실패", err);
    }

    navigate(`/chat/roommate/${chatRoomId}`, {
      state: { partnerName, partnerProfileImageUrl },
    });
  };

  const handleClickRoom = (room: OpenChatRoom) => {
    if (room.joined) {
      navigate(`/chat/open/${room.roomId}`);
      return;
    }

    setSelectedRoom(room);

    if (room.hasPassword) {
      setIsPasswordModalOpen(true);
    } else {
      setIsJoinModalOpen(true);
    }
  };

  const handleJoinRoom = async () => {
    if (!selectedRoom) return;

    try {
      await joinOpenChatRoom(selectedRoom.roomId);
      setIsJoinModalOpen(false);
      const targetRoomId = selectedRoom.roomId;
      setSelectedRoom(null);
      navigate(`/chat/open/${targetRoomId}`);
      fetchChatRooms();
    } catch (error) {
      console.error("오픈채팅방 참여 실패", error);
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400) {
          alert("비밀번호가 올바르지 않습니다.");
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
    }
  };

  const handleJoinPasswordRoom = async (password: string) => {
    if (!selectedRoom) return;

    try {
      await joinOpenChatRoom(selectedRoom.roomId, password);
      setIsPasswordModalOpen(false);
      const targetRoomId = selectedRoom.roomId;
      setSelectedRoom(null);
      navigate(`/chat/open/${targetRoomId}`);
      fetchChatRooms();
    } catch (error) {
      console.error("비밀번호 오픈채팅방 참여 실패", error);
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400) {
          alert("비밀번호가 일치하지 않습니다.");
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
    }
  };

  const handleCloseModal = () => {
    setIsJoinModalOpen(false);
    setIsPasswordModalOpen(false);
    setSelectedRoom(null);
  };

  const openChatUnreadTotal = rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);
  const totalUnreadCount = roommateUnreadTotal + openChatUnreadTotal;

  const filteredRoommateRooms = roommateRooms.filter((room) =>
    (room.partnerName || room.opponentNickname || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    (room.lastMessage || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mergedMyRooms = [
    ...filteredRoommateRooms.map((room) => ({ ...room, itemType: "roommate" as const })),
    ...filteredRooms.map((room) => ({ ...room, itemType: "open" as const })),
  ].sort((a, b) => {
    const timeA =
      a.itemType === "roommate"
        ? (a as RoommateChatRoom).lastMessageTime
        : (a as OpenChatRoom).lastMessageAt;
    const timeB =
      b.itemType === "roommate"
        ? (b as RoommateChatRoom).lastMessageTime
        : (b as OpenChatRoom).lastMessageAt;

    if (!timeA) return 1;
    if (!timeB) return -1;
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  });

  useSetHeader({
    title: "채팅",
    showAlarm: true,
    secondHeader: (
      <OpenChatTab selectedTab={selectedTab} onChangeTab={setSelectedTab} unreadCount={totalUnreadCount} />
    ),
  });

  return (
    <PageContainer>
      <Content>

        <SearchBox>
          <SearchInput
            type="text"
            placeholder="방 이름/설명 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={20} color="#8b8b8b" />
        </SearchBox>

        {!isLoggedIn ? (
          <LoginPromptWrapper>
            <LoginTitle>로그인이 필요합니다</LoginTitle>
            <LoginDescription>
              채팅방 목록을 확인하려면 로그인이 필요합니다.
            </LoginDescription>
            <LoginButton type="button" onClick={() => navigate("/login")}>
              로그인하러 가기
            </LoginButton>
          </LoginPromptWrapper>
        ) : isLoading ? (
          <LoadingText>채팅방을 불러오는 중입니다.</LoadingText>
        ) : selectedTab === "MY" ? (
          mergedMyRooms.length === 0 ? (
            <OpenChatEmptyState
              tab={selectedTab}
              onClickMoveDormitory={() => setSelectedTab("DORMITORY")}
            />
          ) : (
            <RoomList>
              {mergedMyRooms.map((item) => {
                if (item.itemType === "roommate") {
                  return (
                    <RoommateChatCard
                      key={`roommate-${item.chatRoomId}`}
                      room={item}
                      onClick={() =>
                        handleRoommateClick(
                          item.chatRoomId,
                          item.partnerName,
                          item.partnerProfileImageUrl,
                        )
                      }
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
        ) : filteredRooms.length === 0 ? (
          <OpenChatEmptyState
            tab={selectedTab}
            onClickMoveDormitory={() => setSelectedTab("DORMITORY")}
          />
        ) : (
          <RoomList>
            {filteredRooms.map((room) => (
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

      <CreateButton type="button" onClick={() => navigate("/chat/open/create")}>
        <Plus size={20} color="white" />
        <ButtonText>방만들기</ButtonText>
      </CreateButton>

      <OpenChatJoinModal
        isOpen={isJoinModalOpen}
        room={selectedRoom}
        onClose={handleCloseModal}
        onJoin={handleJoinRoom}
      />

      <OpenChatPasswordModal
        isOpen={isPasswordModalOpen}
        room={selectedRoom}
        onClose={handleCloseModal}
        onJoin={handleJoinPasswordRoom}
      />
    </PageContainer>
  );
}

const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  color: #222222;
`;

const Content = styled.main`
  padding: 64px 20px 120px;
`;

const SearchBox = styled.div`
  width: 100%;
  height: 40px;
  margin: 16px 0;
  border: 1px solid #dfdfdf;
  border-radius: 8px;
  padding: 8px 12px;
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

const RoomList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LoadingText = styled.p`
  margin: 48px 0 0;
  text-align: center;
  font-size: 14px;
  color: #9ca3af;
`;

const CreateButton = styled.button`
  position: fixed;
  right: 24px;
  bottom: 88px;
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

  @media (min-width: 769px) {
    right: calc((100vw - 480px) / 2 + 24px);
  }
`;

const ButtonText = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
`;

const LoginPromptWrapper = styled.div`
  width: 100%;
  max-width: 288px;
  min-height: 200px;
  margin: 48px auto 0;
  padding: 32px 20px;
  border: 1px solid #e4e7ec;
  border-radius: 20px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LoginTitle = styled.h3`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
  color: #1f2430;
  word-break: keep-all;
`;

const LoginDescription = styled.p`
  margin: 20px 0 28px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: #8a93a3;
  text-align: center;
  word-break: keep-all;
`;

const LoginButton = styled.button`
  width: 200px;
  height: 46px;
  border: none;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
`;

const RoommateCard = styled.button`
  width: 100%;
  padding: 16px;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  background-color: #e6f4ff;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  box-sizing: border-box;
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

