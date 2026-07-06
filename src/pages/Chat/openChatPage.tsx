import { useEffect, useState } from "react";
import styled from "styled-components";
import { getOpenChatRooms, joinOpenChatRoom } from "@/apis/openchat";
import OpenChatRoomCard from "@/components/chat/OpenChatRoomCard";
import OpenChatTab from "@/components/chat/OpenChatTab";
import OpenChatEmptyState from "@/components/chat/OpenChatEmptyState";
import OpenChatJoinModal from "@/components/modal/OpenChatJoinModal";
import OpenChatPasswordModal from "@/components/modal/OpenChatPasswordModal";
import { OpenChatRoom, OpenChatTab as OpenChatTabType } from "@/types/openchat";
import { useNavigate } from "react-router-dom";
import { useSetHeader } from "@/hooks/useSetHeader";

export default function OpenChatPage() {
  const navigate = useNavigate();

  useSetHeader({
    title: "오픈채팅",
    showAlarm: true,
  });

  const [selectedTab, setSelectedTab] = useState<OpenChatTabType>("MY");
  const [rooms, setRooms] = useState<OpenChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<OpenChatRoom | null>(null);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOpenChatRooms = async () => {
    try {
      setIsLoading(true);
      const response = await getOpenChatRooms(selectedTab);
      setRooms(response.data.content);
    } catch (error) {
      console.error("오픈채팅방 목록 조회 실패", error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenChatRooms();
  }, [selectedTab]);

  const handleClickRoom = (room: OpenChatRoom) => {
    if (room.joined) {
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
      setSelectedRoom(null);
      fetchOpenChatRooms();
    } catch (error) {
      console.error("오픈채팅방 참여 실패", error);
    }
  };

  const handleJoinPasswordRoom = async (password: string) => {
    if (!selectedRoom) return;

    try {
      await joinOpenChatRoom(selectedRoom.roomId, password);
      setIsPasswordModalOpen(false);
      setSelectedRoom(null);
      fetchOpenChatRooms();
    } catch (error) {
      console.error("비밀번호 오픈채팅방 참여 실패", error);
    }
  };

  const handleCloseModal = () => {
    setIsJoinModalOpen(false);
    setIsPasswordModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <PageContainer>
      <Content>
        <OpenChatTab selectedTab={selectedTab} onChangeTab={setSelectedTab} />

        <SearchBox>
          <SearchPlaceholder>방 이름/설명 검색</SearchPlaceholder>
        </SearchBox>

        {isLoading ? (
          <LoadingText>채팅방을 불러오는 중입니다.</LoadingText>
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
