import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { isAxiosError } from "axios";
import { getOpenChatRooms, updateOpenChatRoom } from "@/apis/openchat";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useSetHeader } from "@/hooks/useSetHeader";
import {
  OpenChatRoom,
  OpenChatScope,
  UpdateOpenChatRoomRequest,
} from "@/types/openchat";

type EditRouteState = {
  room?: OpenChatRoom;
};

export default function OpenChatEditPage() {
  const { id } = useParams();
  const roomId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as EditRouteState | null;

  const [room, setRoom] = useState<OpenChatRoom | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<OpenChatScope>("DORMITORY");
  const [maxParticipants, setMaxParticipants] = useState(2);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useSetHeader({
    title: "채팅방 수정",
    showAlarm: false,
  });

  const applyRoom = useCallback((nextRoom: OpenChatRoom) => {
    setRoom(nextRoom);
    setName(nextRoom.name ?? "");
    setDescription(nextRoom.description ?? "");
    setScope(nextRoom.scope ?? "DORMITORY");
    setMaxParticipants(
      Math.max(
        nextRoom.currentParticipants ?? 2,
        nextRoom.maxParticipants ?? 2,
      ),
    );
    setIsPublic(nextRoom.isPublic ?? nextRoom.public ?? true);
  }, []);

  useEffect(() => {
    if (!Number.isInteger(roomId) || roomId <= 0) {
      alert("잘못된 채팅방입니다.");
      navigate("/chat", { replace: true });
      return;
    }

    const routeRoom = routeState?.room;
    if (routeRoom?.roomId === roomId) {
      applyRoom(routeRoom);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchRoom = async () => {
      setIsLoading(true);
      try {
        let page = 0;
        let totalPages = 1;
        let foundRoom: OpenChatRoom | undefined;

        while (!foundRoom && page < totalPages) {
          const response = await getOpenChatRooms("MY", page, 100);
          foundRoom = response.data.content.find(
            (candidate) => candidate.roomId === roomId,
          );
          totalPages = Math.max(response.data.totalPages ?? 0, 1);
          page += 1;
        }

        if (!foundRoom) {
          throw new Error("채팅방 정보를 찾을 수 없습니다.");
        }

        if (!cancelled) applyRoom(foundRoom);
      } catch (error) {
        console.error("채팅방 정보 조회 실패:", error);
        if (!cancelled) {
          alert("채팅방 정보를 불러오지 못했습니다.");
          navigate(`/chat/open/${roomId}`, { replace: true });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchRoom();

    return () => {
      cancelled = true;
    };
  }, [applyRoom, navigate, roomId, routeState?.room]);

  const minimumParticipants = Math.max(room?.currentParticipants ?? 2, 2);
  const isDerivedRoom = room?.roomType === "DERIVED";
  const isValid =
    Boolean(name.trim()) &&
    description.trim().length <= 100 &&
    (isDerivedRoom ||
      (maxParticipants >= minimumParticipants && maxParticipants <= 100));

  const handleSubmit = async () => {
    if (!room || !isValid || isSubmitting) return;

    const request: UpdateOpenChatRoomRequest = {
      name: name.trim(),
      description: description.trim(),
      scope,
      isPublic,
      ...(isDerivedRoom ? {} : { maxParticipants }),
    };

    setIsSubmitting(true);
    try {
      await updateOpenChatRoom(roomId, request);

      const updatedRoom: OpenChatRoom = {
        ...room,
        name: request.name ?? room.name,
        description: request.description ?? room.description,
        scope: request.scope ?? room.scope,
        maxParticipants: request.maxParticipants ?? room.maxParticipants,
        isPublic: request.isPublic ?? room.isPublic,
        public: request.isPublic ?? room.public,
      };

      navigate(`/chat/open/${roomId}`, {
        replace: true,
        state: {
          roomName: updatedRoom.name,
          roomDescription: updatedRoom.description,
          room: updatedRoom,
        },
      });
      alert("채팅방 정보를 수정했습니다.");
    } catch (error) {
      console.error("채팅방 수정 실패:", error);
      if (isAxiosError(error) && error.response?.status === 403) {
        alert("방장만 채팅방 정보를 수정할 수 있습니다.");
      } else if (isAxiosError(error) && error.response?.status === 400) {
        alert("입력한 채팅방 정보를 다시 확인해주세요.");
      } else {
        alert("채팅방 정보 수정에 실패했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="채팅방 정보를 불러오고 있습니다..." />;
  }

  if (!room) return null;

  return (
    <Page>
      <Content>
        <NoticeBox>
          <NoticeTitle>주의</NoticeTitle>
          <NoticeText>
            거래, 정산, 외부 연락처 교환은 사용자 책임 하에 진행됩니다.
          </NoticeText>
        </NoticeBox>

        <FormGroup>
          <Label htmlFor="edit-room-name">방 이름</Label>
          <TextInput
            id="edit-room-name"
            value={name}
            maxLength={30}
            onChange={(event) => setName(event.target.value)}
          />
          <Helper $align="right">{name.length}/30</Helper>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="edit-room-description">방 설명</Label>
          <TextArea
            id="edit-room-description"
            value={description}
            maxLength={100}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Helper $align="right">{description.length}/100</Helper>
        </FormGroup>

        <FormGroup>
          <Label>공개 범위</Label>
          <ChoiceRow>
            <ChoiceButton
              type="button"
              $active={scope === "DORMITORY"}
              onClick={() => setScope("DORMITORY")}
            >
              내 기숙사
            </ChoiceButton>
            <ChoiceButton
              type="button"
              $active={scope === "ALL"}
              onClick={() => setScope("ALL")}
            >
              전체
            </ChoiceButton>
          </ChoiceRow>
        </FormGroup>

        {!isDerivedRoom && (
          <FormGroup>
            <Label htmlFor="edit-max-participants">최대 참여 인원</Label>
            <TextInput
              id="edit-max-participants"
              type="number"
              min={minimumParticipants}
              max={100}
              value={maxParticipants}
              onChange={(event) =>
                setMaxParticipants(Number(event.target.value) || 0)
              }
            />
            <Helper>
              현재 참여 인원보다 작게 설정할 수 없습니다. (최소{" "}
              {minimumParticipants}명)
            </Helper>
          </FormGroup>
        )}

        <FormGroup>
          <Label>{isDerivedRoom ? "노출 여부" : "공개 여부"}</Label>
          <ChoiceRow>
            <ChoiceButton
              type="button"
              $active={isPublic}
              onClick={() => setIsPublic(true)}
            >
              {isDerivedRoom ? "노출" : "공개"}
            </ChoiceButton>
            <ChoiceButton
              type="button"
              $active={!isPublic}
              onClick={() => setIsPublic(false)}
            >
              {isDerivedRoom ? "비노출" : "비공개"}
            </ChoiceButton>
          </ChoiceRow>
          <Helper>
            {isDerivedRoom ? "비노출" : "비공개"}로 설정해도 기존 채팅방의 공유
            링크를 통해 입장할 수 있습니다.
          </Helper>
        </FormGroup>
      </Content>

      <SubmitArea>
        <SubmitButton
          type="button"
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "저장 중..." : "저장하기"}
        </SubmitButton>
      </SubmitArea>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  box-sizing: border-box;
  background: #fff;
`;

const Content = styled.main`
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  padding: 16px 20px 112px;

  @media (min-width: 769px) {
    width: min(100%, 360px);
    margin: 0 auto;
  }
`;

const NoticeBox = styled.section`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: 8px;
  background: #fffbe6;
`;

const NoticeTitle = styled.strong`
  margin: 0;
  color: #ad6800;
  font:
    400 14px/1.5 Pretendard,
    sans-serif;
`;

const NoticeText = styled.p`
  margin: 0;
  color: #613400;
  font:
    400 12px/1.5 Pretendard,
    sans-serif;
  word-break: keep-all;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  color: #3d3d3d;
  font:
    400 14px/1.5 Pretendard,
    sans-serif;
`;

const TextInput = styled.input`
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  outline: none;
  background: #f7f7f7;
  color: #3d3d3d;
  font:
    400 14px/1.5 Pretendard,
    sans-serif;

  &:focus {
    border-color: #91caff;
    background: #fff;
  }

  &:disabled {
    color: #8b8b8b;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 72px;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  outline: none;
  resize: vertical;
  background: #f7f7f7;
  color: #3d3d3d;
  font:
    400 14px/1.5 Pretendard,
    sans-serif;

  &:focus {
    border-color: #91caff;
    background: #fff;
  }
`;

const Helper = styled.p<{ $align?: "left" | "right" }>`
  margin: 0;
  color: #8b8b8b;
  font:
    400 12px/1.5 Pretendard,
    sans-serif;
  text-align: ${({ $align = "left" }) => $align};
`;

const ChoiceRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ChoiceButton = styled.button<{ $active: boolean }>`
  min-height: 37px;
  padding: 8px 12px;
  border: 0;
  border-radius: 32px;
  background: ${({ $active }) => ($active ? "#1677ff" : "#f7f7f7")};
  color: ${({ $active }) => ($active ? "#fff" : "#3d3d3d")};
  font:
    400 14px/1.5 Pretendard,
    sans-serif;
  cursor: pointer;
`;

const SubmitArea = styled.div`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  padding: 16px 20px;
  border-top: 1px solid #efefef;
  background: #fff;

  @media (min-width: 769px) {
    width: min(100%, 360px);
    margin: 0 auto;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 8px;
  background: #1677ff;
  color: #fff;
  font:
    600 16px/1.5 Pretendard,
    sans-serif;
  cursor: pointer;

  &:disabled {
    background: #91caff;
    cursor: not-allowed;
  }
`;
