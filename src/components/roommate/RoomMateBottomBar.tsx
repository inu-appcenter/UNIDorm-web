import styled from "styled-components";
import RoundSquareButton from "../button/RoundSquareButton.tsx";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RoomMateBottomBar = () => {
  const [liked, setLiked] = useState<boolean>(false);
  const navigate = useNavigate();
  return (
    <RoomMateBottomBarWrapper>
      <HeartIconWrapper onClick={() => setLiked(!liked)}>
        {liked ? <FaHeart color="red" size={24} /> : <FaRegHeart size={24} />}
      </HeartIconWrapper>

      <ChatButtonWrapper onClick={() => navigate("/chat/roommate/1")}>
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
  gap: 16px; /* 간격 조절 */
`;

const HeartIconWrapper = styled.div`
  flex-shrink: 0; /* 아이콘 크기 고정 */
`;

const ChatButtonWrapper = styled.div`
  flex-grow: 1; /* 버튼이 남은 공간 모두 차지 */
`;
