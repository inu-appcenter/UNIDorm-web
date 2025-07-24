import styled from "styled-components";
import RoundSquareButton from "../button/RoundSquareButton.tsx";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createRoommateChatRoom } from "../../apis/chat.ts";

const RoomMateBottomBar = () => {
  const { boardId } = useParams<{ boardId: string }>();

  const [liked, setLiked] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChatClick = async () => {
    if (!boardId) return;

    try {
      const res = await createRoommateChatRoom(Number(boardId));
      const chatRoomId = res.data;

      navigate(`/chat/roommate/${chatRoomId}`);
    } catch (error) {
      console.error("채팅방 생성 실패", error);
      alert("채팅방을 생성할 수 없습니다.");
    }
  };

  return (
    <RoomMateBottomBarWrapper>
      <HeartIconWrapper onClick={() => setLiked(!liked)}>
        {liked ? <FaHeart color="red" size={24} /> : <FaRegHeart size={24} />}
      </HeartIconWrapper>

      <ChatButtonWrapper onClick={handleChatClick}>
        <RoundSquareButton btnName={"채팅하기"} />
      </ChatButtonWrapper>
    </RoomMateBottomBarWrapper>
  );
};

export default RoomMateBottomBar;

const RoomMateBottomBarWrapper = styled.div`
  width: 100%;
  height: 64px;
  padding: 8px 16px;
  box-sizing: border-box;
  border-top: rgba(0, 0, 0, 0.1) 0.5px solid;

  position: fixed;
  bottom: 0;
  left: 0;

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const HeartIconWrapper = styled.div`
  flex-shrink: 0;
`;

const ChatButtonWrapper = styled.div`
  flex-grow: 1;
`;
