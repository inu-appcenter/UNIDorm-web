import styled from "styled-components";
import RoundSquareBlueButton from "../button/RoundSquareBlueButton.tsx";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createRoommateChatRoom } from "../../apis/chat.ts";
import useUserStore from "../../stores/useUserStore.ts";

const RoomMateBottomBar = () => {
  const { boardId } = useParams<{ boardId: string }>();

  const { tokenInfo, userInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [liked, setLiked] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChatClick = async () => {
    if (!isLoggedIn) {
      alert("로그인 후 이용해주세요.");
      navigate("/login");
      return;
    }
    if (!userInfo.roommateCheckList) {
      alert("먼저 체크리스트를 작성해주세요!");
      navigate("/roommatechecklist");
      return;
    }

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
        <RoundSquareBlueButton btnName={"채팅하기"} />
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

  background: rgba(244, 244, 244, 0.6); /* 반투명 */
  backdrop-filter: blur(10px); /* 블러 효과 */
  -webkit-backdrop-filter: blur(10px); /* Safari 지원 */
`;

const HeartIconWrapper = styled.div`
  flex-shrink: 0;
`;

const ChatButtonWrapper = styled.div`
  flex-grow: 1;
`;
