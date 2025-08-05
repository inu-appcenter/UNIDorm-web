import styled from "styled-components";
import RoundSquareBlueButton from "../button/RoundSquareBlueButton.tsx";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createRoommateChatRoom } from "../../apis/chat.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { getRoommateLiked, likeRoommateBoard, unlikeRoommateBoard } from "../../apis/roommate.ts";

const RoomMateBottomBar = () => {
  const { boardId } = useParams<{ boardId: string }>();

  const { tokenInfo, userInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const [liked, setLiked] = useState<boolean>(false);
  const navigate = useNavigate();

  // 좋아요 상태 초기값 세팅이 필요하면 API로 받아오는 로직 추가 가능
  useEffect(() => {
    const fetchisLiked = async () => {
      try {
        const response = await getRoommateLiked(Number(boardId));
        console.log(response);
        setLiked(response.data);
      } catch (error: any) {
        console.log("좋아요 정보를 가져오는 중 오류가 발생했습니다.", error);
      }
    };
    if (isLoggedIn && boardId) {
      fetchisLiked();
    }
  }, [boardId]);

  const handleLikeClick = async () => {
    if (!isLoggedIn) {
      alert("로그인 후 이용해주세요.");
      navigate("/login");
      return;
    }
    if (!boardId) return;

    try {
      if (!liked) {
        // 좋아요 추가
        const res = await likeRoommateBoard(Number(boardId));
        console.log(res);
        setLiked(true);
        // 현재 좋아요 개수(res.data)를 필요하면 활용 가능
      } else {
        // 좋아요 취소
        const res = await unlikeRoommateBoard(Number(boardId));
        console.log(res);

        setLiked(false);
        // 현재 좋아요 개수(res.data)를 필요하면 활용 가능
      }
    } catch (error: any) {
      if (error.response) {
        const code = error.response.status;
        if (code === 401) {
          alert("이미 좋아요를 누른 상태입니다.");
        } else if (code === 404) {
          alert("게시글이나 유저 정보를 찾을 수 없습니다.");
        } else {
          alert("오류가 발생했습니다.");
        }
      } else {
        alert("서버와 통신할 수 없습니다.");
      }
      console.error(error);
    }
  };

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
      <HeartIconWrapper onClick={handleLikeClick}>
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
  cursor: pointer;
`;

const ChatButtonWrapper = styled.div`
  flex-grow: 1;
`;
