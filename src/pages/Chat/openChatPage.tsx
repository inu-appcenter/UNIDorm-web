import { useEffect, useState } from "react";
import styled from "styled-components";
import { getOpenChatRooms, joinOpenChatRoom } from "@/apis/openchat";
import { getRoommateChatRooms, patchRoommateChatRead } from "@/apis/chat";
import OpenChatRoomCard from "@/components/chat/OpenChatRoomCard";
import OpenChatTab from "@/components/chat/OpenChatTab";
import OpenChatEmptyState from "@/components/chat/OpenChatEmptyState";
import OpenChatJoinModal from "@/components/modal/OpenChatJoinModal";
import OpenChatPasswordModal from "@/components/modal/OpenChatPasswordModal";
import ChatListItem from "@/components/chat/ChatListItem";
import { OpenChatRoom, OpenChatTab as OpenChatTabType } from "@/types/openchat";
import { RoommateChatRoom } from "@/types/chats";
import { useNavigate } from "react-router-dom";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";

export default function OpenChatPage() {
  const navigate = useNavigate();
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);

  useSetHeader({
    title: "채팅",
    showAlarm: true,
  });

  const [selectedTab, setSelectedTab] = useState<OpenChatTabType>("MY");
  const [rooms, setRooms] = useState<OpenChatRoom[]>([]);
  const [roommateRooms, setRoommateRooms] = useState<RoommateChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<OpenChatRoom | null>(null);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChatRooms = async () => {
    if (!isLoggedIn) {
      setRooms([]);
      setRoommateRooms([]);
      return;
    }

    try {
      setIsLoading(true);
      if (selectedTab === "MY") {
        const [openChatRes, roommateChatRes] = await Promise.all([
          getOpenChatRooms("MY"),
          getRoommateChatRooms(),
        ]);
        setRooms(openChatRes.data.content);
        setRoommateRooms(roommateChatRes.data);
      } else {
        setRoommateRooms([]);
        const response = await getOpenChatRooms(selectedTab);
        setRooms(response.data.content);
      }
    } catch (error) {
      console.error("채팅방 목록 조회 실패", error);
      setRooms([]);
      setRoommateRooms([]);
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
    }
  };

  const handleCloseModal = () => {
    setIsJoinModalOpen(false);
    setIsPasswordModalOpen(false);
    setSelectedRoom(null);
  };

  const mergedMyRooms = [
    ...roommateRooms.map((room) => ({ ...room, itemType: "roommate" as const })),
    ...rooms.map((room) => ({ ...room, itemType: "open" as const })),
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

  return (
    <PageContainer>
      <Content>
        <OpenChatTab selectedTab={selectedTab} onChangeTab={setSelectedTab} />

        <SearchBox>
          <SearchPlaceholder>방 이름/설명 검색</SearchPlaceholder>
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
                    <ChatListItem
                      key={`roommate-${item.chatRoomId}`}
                      chatRoomId={item.chatRoomId}
                      selectedTab="룸메이트"
                      onClick={() =>
                        handleRoommateClick(
                          item.chatRoomId,
                          item.partnerName,
                          item.partnerProfileImageUrl,
                        )
                      }
                      title={item.partnerName}
                      message={item.lastMessage}
                      time={item.lastMessageTime}
                      partnerProfileImageUrl={item.partnerProfileImageUrl}
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
        ) : rooms.length === 0 ? (
          <OpenChatEmptyState
            tab={selectedTab}
            onClickMoveDormitory={() => setSelectedTab("DORMITORY")}
          />
        ) : (
          <RoomList>
            {rooms.map((room) => (
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
        <Plus>＋</Plus>방 만들기
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
  background-color: #ffffff;
  color: #222222;
`;

const Content = styled.main`
  padding: 24px 20px 120px;
`;

const SearchBox = styled.div`
  width: 100%;
  height: 42px;
  margin: 14px 0 22px;
  border: 1px solid #d8dde8;
  border-radius: 999px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  background-color: #ffffff;
`;

const SearchPlaceholder = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #a1a8b5;
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
  height: 52px;
  padding: 0 24px;
  border: none;
  border-radius: 999px;
  background-color: #2563eb;
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(63, 107, 255, 0.28);

  @media (min-width: 769px) {
    right: calc((100vw - 480px) / 2 + 24px);
  }
`;

const Plus = styled.span`
  font-size: 20px;
  line-height: 1;
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
