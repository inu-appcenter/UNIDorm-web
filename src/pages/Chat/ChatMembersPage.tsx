import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { User, ChevronRight } from "lucide-react";
import { useSetHeader } from "@/hooks/useSetHeader";
import useUserStore from "@/stores/useUserStore";
import { deleteRoommateChatRoom } from "@/apis/roommate";
import { Drawer } from "vaul";

interface ParticipantType {
  id: number;
  nickname: string;
  isMe: boolean;
  desc: string;
}

export default function ChatMembersPage() {
  const { chatType, id } = useParams();
  const roomId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();

  const partnerName = location.state?.partnerName ?? "상대방";
  const { userInfo } = useUserStore();

  // 바텀시트 상태 관리: "profile" | "create" | null
  const [activeSheet, setActiveSheet] = useState<"profile" | "create" | null>(null);
  const [selectedUser, setSelectedUser] = useState<ParticipantType | null>(null);

  // 1:1 대화 만들기 방 설정 인풋 상태
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");

  // 참여자 목록 정의
  const getParticipants = (): ParticipantType[] => {
    if (chatType === "open") {
      return [
        { id: 101, nickname: "방장횃불이", isMe: false, desc: "1긱 오픈채팅 참여중" },
        { id: 102, nickname: "동네UNI", isMe: false, desc: "1긱 오픈채팅 참여중" },
        { id: userInfo.id, nickname: userInfo.name || "나 자신", isMe: true, desc: "나" },
        { id: 103, nickname: "익명 03", isMe: false, desc: "1긱 오픈채팅 참여중" },
        { id: 104, nickname: "익명 04", isMe: false, desc: "1긱 오픈채팅 참여중" },
        { id: 105, nickname: "익명 05", isMe: false, desc: "1긱 오픈채팅 참여중" },
      ];
    } else {
      // 룸메이트 및 1대1 대화의 경우
      return [
        { id: userInfo.id, nickname: userInfo.name || "나 자신", isMe: true, desc: "나" },
        { id: 999, nickname: partnerName, isMe: false, desc: chatType === "roommate" ? "내 룸메이트" : "대화 상대방" },
      ];
    }
  };

  const participants = getParticipants();

  // 공용 헤더 설정
  useSetHeader({
    title: "참여중인 인원",
    headerRightElement: (
      <HeaderRightContainer>
        <User size={16} color="#8b8b8b" />
        <span className="count-text">{chatType === "open" ? "18" : "2"}</span>
      </HeaderRightContainer>
    ),
  });

  // 참여자 클릭 핸들러
  const handleUserClick = (user: ParticipantType) => {
    if (user.isMe) return; // 나 자신은 1:1 신청 불가
    setSelectedUser(user);
    setActiveSheet("profile");
  };

  // 1대1 대화방 개설 생성 완료 처리
  const handleCreateChat = () => {
    if (chatType === "open" && !roomName.trim()) {
      alert("방 이름을 입력해주세요.");
      return;
    }
    alert(`${selectedUser?.nickname}님과의 1대1 대화방이 생성되었습니다!`);
    setActiveSheet(null);
    setRoomName("");
    setRoomPassword("");
    // 생성 완료 후 가상의 1대1 대화방 페이지로 이동
    navigate(`/chat/personal/100`, {
      state: { partnerName: selectedUser?.nickname ?? "상대방" },
    });
  };

  // 채팅방 퇴장 처리
  const handleLeaveRoom = async () => {
    const confirmed = window.confirm(
      "정말 채팅방을 나갈까요?\n나간 채팅방은 대화 목록에서 사라지며 복구할 수 없습니다."
    );
    if (!confirmed) return;

    if (chatType === "roommate") {
      try {
        const response = await deleteRoommateChatRoom(roomId);
        if (response.status === 201) {
          alert("채팅방에서 퇴장하였습니다.");
          navigate("/chat");
        }
      } catch (error) {
        alert("퇴장에 실패했습니다. " + String(error));
      }
    } else {
      // 오픈채팅 및 1대1 대화 퇴장 목업 처리
      alert("채팅방에서 퇴장하였습니다.");
      navigate("/chat");
    }
  };

  return (
    <PageContainer>
      <ScrollContainer>
        <ListContainer>
          {participants.map((user) => (
            <UserCard 
              key={user.id} 
              $isMe={user.isMe}
              onClick={() => handleUserClick(user)}
            >
              <UserName>{user.nickname} {user.isMe && "(나)"}</UserName>
              {!user.isMe && (
                <ChevronRight size={18} color="#8b8b8b" />
              )}
            </UserCard>
          ))}
        </ListContainer>
      </ScrollContainer>

      {/* 하단 고정 제어 바 */}
      <BottomControlBar>
        {chatType === "roommate" && (
          <SecondaryButton onClick={() => navigate("/roommate/list/opponent", { state: { partnerName, roomId } })}>
            상대방 체크리스트 보기
          </SecondaryButton>
        )}
        <SecondaryButton onClick={() => navigate(`/chat/${chatType}/${roomId}/notifications`, { state: { partnerName } })}>
          알림 설정
        </SecondaryButton>
        <DangerButton onClick={handleLeaveRoom}>
          채팅방 나가기
        </DangerButton>
      </BottomControlBar>

      {/* 1. 프로필 바텀시트 (vaul 사용) */}
      <Drawer.Root
        open={activeSheet === "profile"}
        onOpenChange={(open) => {
          if (!open) setActiveSheet(null);
        }}
      >
        <Drawer.Portal>
          <Overlay />
          <Content>
            <SwipeHandle />
            {selectedUser && (
              <SheetBody>
                <UserInfoArea>
                  <Drawer.Title asChild>
                    <UserNameText>{selectedUser.nickname}</UserNameText>
                  </Drawer.Title>
                  <Drawer.Description asChild>
                    <UserDescText>{selectedUser.desc}</UserDescText>
                  </Drawer.Description>
                </UserInfoArea>
                <PrimaryButton onClick={() => setActiveSheet("create")}>
                  1:1 채팅하기
                </PrimaryButton>
              </SheetBody>
            )}
          </Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* 2. 1:1 대화 만들기 바텀시트 (vaul 사용) */}
      <Drawer.Root
        open={activeSheet === "create"}
        onOpenChange={(open) => {
          if (!open) setActiveSheet(null);
        }}
      >
        <Drawer.Portal>
          <Overlay />
          <Content>
            <SwipeHandle />
            {selectedUser && (
              <SheetBody>
                <FormContainer>
                  <FormHeader>
                    <Drawer.Title asChild>
                      <FormTitle>1:1 채팅 만들기</FormTitle>
                    </Drawer.Title>
                    <Drawer.Description asChild>
                      <FormSub>
                        <span className="label">상대</span>
                        <span className="value">{selectedUser.nickname}</span>
                      </FormSub>
                    </Drawer.Description>
                  </FormHeader>

                  <InputGroup>
                    <InputLabel>방 이름</InputLabel>
                    <TextInput 
                      type="text" 
                      placeholder="예: 공동구매 관련 대화" 
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLabel>비밀번호 (선택)</InputLabel>
                    <TextInput 
                      type="password" 
                      placeholder="비밀번호 입력" 
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                    />
                  </InputGroup>

                  <WarningBox>
                    <WarningTitle>주의</WarningTitle>
                    <WarningText>
                      개인정보 공개 및 외부 연락처 교환은 사용자 책임 하에 이루어집니다.
                    </WarningText>
                  </WarningBox>

                  <PrimaryButton onClick={handleCreateChat}>
                    만들기
                  </PrimaryButton>
                </FormContainer>
              </SheetBody>
            )}
          </Content>
        </Drawer.Portal>
      </Drawer.Root>
    </PageContainer>
  );
}

/* Styled Components */
const PageContainer = styled.div`
  width: 100%;
  height: calc(100vh - 70px);
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  /* 하단 고정 버튼 영역 패딩 확보 */
  padding-bottom: 220px; 
  box-sizing: border-box;
`;

const HeaderRightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 8px;

  .count-text {
    font-family: "Pretendard", sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #8b8b8b;
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const UserCard = styled.div<{ $isMe: boolean }>`
  background-color: #ffffff;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  cursor: ${({ $isMe }) => ($isMe ? "default" : "pointer")};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ $isMe }) => ($isMe ? "#ffffff" : "#f5f5f5")};
  }
`;

const UserName = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #3d3d3d;
`;

const BottomControlBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  border-top: 1px solid #dfdfdf;
  padding: 16px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
`;

const PrimaryButton = styled.button`
  width: 100%;
  height: 48px;
  background-color: #1677ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #0958d9;
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  height: 48px;
  background-color: white;
  color: #1677ff;
  border: 1px solid #1677ff;
  border-radius: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #e6f4ff;
  }
`;

const DangerButton = styled.button`
  width: 100%;
  height: 48px;
  background-color: white;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  border-radius: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #fff2f0;
  }
`;

/* vaul Drawer 스타일 */
const Overlay = styled(({ ...props }) => (
  <Drawer.Overlay {...props} />
))`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 20000;
`;

const Content = styled(({ ...props }) => (
  <Drawer.Content {...props} />
))`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20001;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background-color: white;
  max-width: 420px;
  margin: 0 auto;
  outline: none;
`;

const SwipeHandle = styled.div`
  margin: 12px auto;
  width: 60px;
  height: 4px;
  flex-shrink: 0;
  border-radius: 4px;
  background-color: #dfdfdf;
`;

const SheetBody = styled.div`
  width: 100%;
  padding: 0 20px 48px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UserInfoArea = styled.div`
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
`;

const UserNameText = styled.h3`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #3d3d3d;
`;

const UserDescText = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  color: #8b8b8b;
`;

const FormContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
`;

const FormTitle = styled.h3`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #3d3d3d;
`;

const FormSub = styled.div`
  display: flex;
  gap: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  
  .label {
    color: #3d3d3d;
  }
  
  .value {
    color: #8b8b8b;
  }
`;

const InputGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
`;

const InputLabel = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #3d3d3d;
`;

const TextInput = styled.input`
  width: 100%;
  height: 40px;
  background-color: #f7f7f7;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  box-sizing: border-box;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  outline: none;
  color: #3d3d3d;

  &::placeholder {
    color: #8b8b8b;
  }
`;

const WarningBox = styled.div`
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
`;

const WarningTitle = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ad6800;
`;

const WarningText = styled.p`
  margin: 0;
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: #613400;
`;
