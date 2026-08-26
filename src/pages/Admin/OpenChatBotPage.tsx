import { useEffect, useState } from "react";
import { Bot, CheckCircle2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { getAdminOpenChatRooms, sendOpenChatBotMessage } from "@/apis/openchat";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useUserRole } from "@/hooks/useUserRole";
import useUserStore from "@/stores/useUserStore";
import type { AdminOpenChatRoom } from "@/types/openchat";
import * as S from "./adminPageStyles";

const OpenChatBotPage = () => {
  const navigate = useNavigate();
  const { isMainAdmin } = useUserRole();
  const { isLoading } = useUserStore();
  const [rooms, setRooms] = useState<AdminOpenChatRoom[]>([]);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sentMessage, setSentMessage] = useState("");

  useSetHeader({ title: "챗봇" });

  useEffect(() => {
    if (!isLoading && !isMainAdmin) navigate("/admin", { replace: true });
  }, [isLoading, isMainAdmin, navigate]);

  useEffect(() => {
    if (!isMainAdmin) return;
    getAdminOpenChatRooms()
      .then((response) => {
        setRooms(response.data);
        setRoomId(response.data[0]?.roomId ?? null);
      })
      .catch(() => setError("오픈채팅방 목록을 불러오지 못했습니다."))
      .finally(() => setIsLoadingRooms(false));
  }, [isMainAdmin]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!roomId || !trimmedContent || isSubmitting) return;
    setError("");
    setSentMessage("");
    setIsSubmitting(true);
    try {
      await sendOpenChatBotMessage(roomId, trimmedContent);
      setContent("");
      setSentMessage("챗봇 메시지를 발송했습니다.");
    } catch (requestError) {
      setError(
        isAxiosError(requestError) && requestError.response?.status === 404
          ? "선택한 채팅방을 찾을 수 없습니다. 목록을 새로고침해 주세요."
          : "챗봇 메시지 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <S.AdminShell>
      <S.AdminPage>
        <S.AdminHero>
          <S.AdminHeroContent>
            <S.AdminHeroEyebrow><Bot size={14} /> Open chat bot</S.AdminHeroEyebrow>
            <S.AdminHeroTitle>오픈채팅 챗봇</S.AdminHeroTitle>
            <S.AdminHeroDescription>방에 참여하지 않고 안내 메시지를 발송할 수 있습니다. 개인 채팅방은 목록에 표시되지 않습니다.</S.AdminHeroDescription>
          </S.AdminHeroContent>
        </S.AdminHero>
        <S.AdminCard as="form" onSubmit={handleSubmit}>
          <S.AdminCardHeader><S.AdminCardTitleGroup><S.AdminCardTitle>메시지 작성</S.AdminCardTitle><S.AdminCardDescription>발송된 메시지는 채팅방에서 보라색 챗봇 말풍선으로 표시됩니다.</S.AdminCardDescription></S.AdminCardTitleGroup></S.AdminCardHeader>
          <S.AdminField>
            <S.AdminLabel htmlFor="open-chat-room">발송할 오픈채팅방</S.AdminLabel>
            <S.AdminSelect id="open-chat-room" value={roomId ?? ""} disabled={isLoadingRooms || rooms.length === 0 || isSubmitting} onChange={(event) => setRoomId(Number(event.target.value))}>
              {isLoadingRooms ? <option>채팅방을 불러오는 중입니다</option> : rooms.length === 0 ? <option>발송 가능한 오픈채팅방이 없습니다</option> : rooms.map((room) => <option key={room.roomId} value={room.roomId}>{room.roomName}</option>)}
            </S.AdminSelect>
          </S.AdminField>
          <S.AdminField>
            <S.AdminLabel htmlFor="bot-content">챗봇 메시지</S.AdminLabel>
            <S.AdminTextarea id="bot-content" value={content} maxLength={1000} placeholder="입주 준비, 공동구매 등 채팅방에 안내할 내용을 입력해 주세요." disabled={isSubmitting} onChange={(event) => setContent(event.target.value)} />
            <S.AdminSubtleText>{content.length}/1000</S.AdminSubtleText>
          </S.AdminField>
          {error && <S.AdminNotice $tone="error">{error}</S.AdminNotice>}
          {sentMessage && <S.AdminNotice $tone="success"><CheckCircle2 size={18} />{sentMessage}</S.AdminNotice>}
          <S.AdminActionRow><S.AdminButton type="submit" disabled={!roomId || !content.trim() || isSubmitting || isLoadingRooms}><Send size={18} /> {isSubmitting ? "발송 중..." : "챗봇 메시지 발송"}</S.AdminButton></S.AdminActionRow>
        </S.AdminCard>
      </S.AdminPage>
    </S.AdminShell>
  );
};

export default OpenChatBotPage;
