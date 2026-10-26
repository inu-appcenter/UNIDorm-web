import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { sendOpenChatBotMessage } from "@/apis/openchat";
import { useAdminOpenChatRooms } from "@/queries/admin";
import { useInitFromQuery } from "@/hooks/useInitFromQuery";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useUserRole } from "@/hooks/useUserRole";
import useUserStore from "@/stores/useUserStore";

export default function OpenChatBotPage() {
  const navigate = useNavigate();
  const { isMainAdmin } = useUserRole();
  const { isLoading: isUserLoading } = useUserStore();

  useSetHeader({ title: "오픈채팅 챗봇" });

  useEffect(() => {
    if (!isUserLoading && !isMainAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isMainAdmin, isUserLoading, navigate]);

  const {
    data: rooms = [],
    isLoading: isLoadingRooms,
    isError: isRoomsError,
  } = useAdminOpenChatRooms({ enabled: isMainAdmin });

  const [roomId, setRoomId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sentMessage, setSentMessage] = useState("");

  useInitFromQuery(rooms, (data) => {
    if (data.length > 0) {
      setRoomId(data[0].roomId);
    }
  });

  useEffect(() => {
    if (isRoomsError) {
      setError("오픈채팅방 목록을 불러오지 못했어요.");
    }
  }, [isRoomsError]);

  const selectedRoom = rooms.find((r) => r.roomId === roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!roomId || !trimmedContent || isSubmitting) return;

    setError("");
    setSentMessage("");
    setIsSubmitting(true);

    try {
      await sendOpenChatBotMessage(roomId, trimmedContent);
      setContent("");
      setSentMessage("챗봇 메시지를 보냈어요.");
      setTimeout(() => setSentMessage(""), 4000);
    } catch (requestError) {
      setError(
        isAxiosError(requestError) && requestError.response?.status === 404
          ? "선택한 채팅방을 찾을 수 없어요. 목록을 새로고침해 주세요."
          : "챗봇 메시지를 보내지 못했어요. 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !roomId || !content.trim() || isSubmitting || isLoadingRooms;

  return (
    <PageRoot>
      <ContentContainer>
        {/* PC 2열 스플릿 뷰 / 모바일 단일 뷰 */}
        <LayoutSplit>
          {/* 좌측: 발송 설정 폼 */}
          <FormCard as="form" onSubmit={handleSubmit}>
            <FormGroup>
              <FieldLabel htmlFor="open-chat-room">발송 대상 채팅방</FieldLabel>
              <SelectInput
                id="open-chat-room"
                value={roomId ?? ""}
                disabled={isLoadingRooms || rooms.length === 0 || isSubmitting}
                onChange={(e) => setRoomId(Number(e.target.value))}
              >
                {isLoadingRooms ? (
                  <option>채팅방 목록을 불러오는 중입니다...</option>
                ) : rooms.length === 0 ? (
                  <option>발송 가능한 오픈채팅방이 없어요</option>
                ) : (
                  rooms.map((room) => (
                    <option key={room.roomId} value={room.roomId}>
                      [방 #{room.roomId}] {room.roomName}
                    </option>
                  ))
                )}
              </SelectInput>
            </FormGroup>

            <FormGroup>
              <FieldLabel htmlFor="bot-content">공지 내용 작성</FieldLabel>
              <TextareaInput
                id="bot-content"
                value={content}
                maxLength={1000}
                placeholder="입주 준비물 안내, 공동생활 수칙 등 채팅방 참여자에게 알릴 공지 메시지를 입력해 주세요."
                disabled={isSubmitting}
                onChange={(e) => setContent(e.target.value)}
              />
              <FieldCaption>{content.length}/1000자</FieldCaption>
            </FormGroup>

            {error && <NoticeBox $tone="error">{error}</NoticeBox>}
            {sentMessage && <NoticeBox $tone="success">{sentMessage}</NoticeBox>}

            <DesktopActionRow>
              <SecondaryButton
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                이전으로
              </SecondaryButton>
              <PrimarySubmitButton type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? "발송하고 있어요..." : "챗봇 메시지 보내기"}
              </PrimarySubmitButton>
            </DesktopActionRow>
          </FormCard>

          {/* 우측: 챗봇 말풍선 미리보기 (PC 와이드) */}
          <PreviewCard>
            <PreviewHeader>
              <PreviewTitle>채팅방 미리보기</PreviewTitle>
              <PreviewSubtitle>
                {selectedRoom
                  ? `[방 #${selectedRoom.roomId}] ${selectedRoom.roomName}`
                  : "선택된 채팅방이 없어요"}
              </PreviewSubtitle>
            </PreviewHeader>

            <ChatSimulatorWindow>
              <ChatDateDivider>오늘</ChatDateDivider>

              <ChatMessageGroup>
                <BotAvatar>🤖</BotAvatar>
                <ChatContentArea>
                  <BotSenderName>유니돔 공식 챗봇</BotSenderName>
                  <ChatBubble>
                    {content.trim() ||
                      "작성한 메시지가 채팅방에 표시되는 형태입니다."}
                  </ChatBubble>
                  <ChatTimeText>
                    {new Date().toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </ChatTimeText>
                </ChatContentArea>
              </ChatMessageGroup>
            </ChatSimulatorWindow>
          </PreviewCard>
        </LayoutSplit>
      </ContentContainer>

      {/* 모바일 하단 고정 CTA */}
      <MobileFixedCTA>
        <MobileCTAButton
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? "메시지 발송 중..." : "챗봇 메시지 보내기"}
        </MobileCTAButton>
      </MobileFixedCTA>
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
`;

const LayoutSplit = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`;

const FormCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label`
  font-size: 0.88rem;
  font-weight: 700;
  color: #333d4b;
`;

const SelectInput = styled.select`
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
  }
`;

const TextareaInput = styled.textarea`
  min-height: 180px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  padding: 14px;
  font-size: 0.92rem;
  color: #191f28;
  outline: none;
  resize: vertical;
  line-height: 1.55;

  &:focus {
    border-color: #3182f6;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }

  &::placeholder {
    color: #8b95a1;
  }
`;

const FieldCaption = styled.span`
  font-size: 0.78rem;
  color: #8b95a1;
  text-align: right;
`;

const NoticeBox = styled.div<{ $tone: "error" | "success" }>`
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.86rem;
  font-weight: 600;
  background: ${({ $tone }) => ($tone === "error" ? "#feecee" : "#e6f8ef")};
  color: ${({ $tone }) => ($tone === "error" ? "#f04452" : "#04b05c")};
`;

const DesktopActionRow = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
  }
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
    color: #191f28;
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

  &:hover:not(:disabled) {
    background: #1b64da;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* 미리보기 카드 */
const PreviewCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PreviewHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PreviewTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 800;
  color: #191f28;
  margin: 0;
`;

const PreviewSubtitle = styled.span`
  font-size: 0.82rem;
  color: #8b95a1;
`;

const ChatSimulatorWindow = styled.div`
  background: #b2c7da;
  border-radius: 18px;
  padding: 20px 16px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ChatDateDivider = styled.div`
  align-self: center;
  background: rgba(0, 0, 0, 0.12);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
`;

const ChatMessageGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const BotAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 14px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const ChatContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 80%;
`;

const BotSenderName = styled.span`
  font-size: 0.76rem;
  font-weight: 700;
  color: #333d4b;
`;

const ChatBubble = styled.div`
  background: #ffffff;
  color: #191f28;
  border-radius: 2px 14px 14px 14px;
  padding: 10px 14px;
  font-size: 0.88rem;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
`;

const ChatTimeText = styled.span`
  font-size: 0.68rem;
  color: #6b7684;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
