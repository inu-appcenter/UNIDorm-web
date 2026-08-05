import styled from "styled-components";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createRoommateChatRoom } from "@/apis/chat";
import useUserStore from "../../stores/useUserStore.ts";
import {
  getRoommateLiked,
  likeRoommateBoard,
  unlikeRoommateBoard,
} from "@/apis/roommate";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { colors, typography } from "@/styles/tokens";
import HeartToggleButton from "@/components/common/HeartToggleButton";
import { getBlockedUsers } from "@/apis/block";
import { useRoommateMatchingStatus } from "@/hooks/useRoommateMatchingStatus";

const RoomMateBottomBar = ({
  partnerName,
  userProfileImageUrl,
  postDormType,
  postTitle,
  currentPeriod,
  partnerId,
  postYear,
  postSemester,
}: {
  partnerName: string;
  userProfileImageUrl: string;
  postDormType?: string;
  postTitle?: string;
  currentPeriod?: boolean;
  partnerId: number;
  postYear?: number;
  postSemester?: string | number;
}) => {
  const { boardId } = useParams<{ boardId: string }>();
  const queryClient = useQueryClient();

  const { tokenInfo, userInfo } = useUserStore();
  const { data: matchingStatus } = useRoommateMatchingStatus();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  const isCurrentMatchingPeriod =
    !matchingStatus ||
    !postYear ||
    !postSemester ||
    (matchingStatus.year === postYear &&
      String(matchingStatus.semester) === String(postSemester));

  const isSameDorm =
    !isLoggedIn ||
    !userInfo.dormType ||
    !postDormType ||
    userInfo.dormType === postDormType;
  const isCurrentPeriod = currentPeriod !== false;

  const [liked, setLiked] = useState<boolean>(false);
  const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);
  const [isBlockedPartner, setIsBlockedPartner] = useState(false);
  const [isBlockStatusLoading, setIsBlockStatusLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    if (!isLoggedIn || !partnerId || partnerId === userInfo.id) {
      setIsBlockedPartner(false);
      setIsBlockStatusLoading(false);
      return;
    }

    const fetchBlockStatus = async () => {
      setIsBlockStatusLoading(true);

      try {
        const response = await getBlockedUsers();
        const isBlocked = response.data.some(
          (blockedUser) => Number(blockedUser.blockedUserId) === partnerId,
        );

        if (isActive) {
          setIsBlockedPartner(isBlocked);
        }
      } catch (error) {
        console.error("차단 상태를 확인하지 못했습니다.", error);
        if (isActive) {
          setIsBlockedPartner(false);
        }
      } finally {
        if (isActive) {
          setIsBlockStatusLoading(false);
        }
      }
    };

    void fetchBlockStatus();

    return () => {
      isActive = false;
    };
  }, [isLoggedIn, partnerId, userInfo.id]);

  // 좋아요 상태 초기값 세팅이 필요하면 API로 받아오는 로직 추가 가능
  useEffect(() => {
    const fetchisLiked = async () => {
      try {
        const response = await getRoommateLiked(Number(boardId));
        console.log(response);
        setLiked(response.data);
      } catch (error) {
        console.log("좋아요 정보를 가져오는 중 오류가 발생했습니다.", error);
      }
    };
    if (isLoggedIn && boardId) {
      fetchisLiked();
    }
  }, [boardId, isLoggedIn]);

  const handleLikeClick = async () => {
    if (isLikeSubmitting) return;

    if (!isLoggedIn) {
      alert("로그인 후 이용해주세요.");
      navigate("/login");
      return;
    }

    if (!isCurrentMatchingPeriod) {
      alert("이번 학기 모집 게시물이 아니에요.");
      return;
    }

    if (!isSameDorm) {
      alert("나와 같은 기숙사생이 아니에요.\n기숙사 정보를 확인해주세요.");
      return;
    }

    if (!boardId) return;

    try {
      setIsLikeSubmitting(true);

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

      await queryClient.invalidateQueries({
        queryKey: ["roommates", "scroll"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["memberLikePosts"],
      });
    } catch (error) {
      if (isAxiosError(error) && error.response) {
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
    } finally {
      setIsLikeSubmitting(false);
    }
  };

  const handleChatClick = async () => {
    if (isBlockStatusLoading) return;

    if (isBlockedPartner) {
      alert("차단한 사람과는 대화할 수 없습니다.");
      return;
    }

    if (!isCurrentPeriod) {
      alert("지난 학기 게시글에는 메시지를 보낼 수 없어요.");
      return;
    }

    if (!isLoggedIn) {
      alert("로그인 후 이용해주세요.");
      navigate("/login");
      return;
    }

    if (!isCurrentMatchingPeriod) {
      alert("이번 학기 모집 게시물이 아니에요.");
      return;
    }

    if (!isSameDorm) {
      alert("나와 같은 기숙사생이 아니에요.\n기숙사 정보를 확인해주세요.");
      return;
    }

    if (!userInfo.roommateCheckList) {
      alert("먼저 체크리스트를 작성해주세요!");
      navigate("/roommate/checklist");
      return;
    }

    if (!boardId) return;

    try {
      const res = await createRoommateChatRoom(Number(boardId));
      const chatRoomId = res.data;
      console.log(userProfileImageUrl);
      navigate(`/chat/roommate/${chatRoomId}`, {
        state: {
          partnerName,
          partnerProfileImageUrl: userProfileImageUrl,
          roommateBoardTitle: postTitle,
          roommateBoardOwner: "opponent",
          roommateBoardId: Number(boardId),
        },
      });
    } catch (error) {
      console.error("채팅방 생성 실패", error);
      alert("채팅방을 생성할 수 없습니다.");
    }
  };

  return (
    <RoomMateBottomBarWrapper>
      <MessageButton
        type="button"
        onClick={handleChatClick}
        disabled={
          !isCurrentPeriod || isBlockedPartner || isBlockStatusLoading
        }
      >
        {isBlockedPartner
          ? "차단한 사람과는 대화할 수 없습니다."
          : isBlockStatusLoading
          ? "차단 상태를 확인하고 있어요."
          : !isCurrentPeriod
          ? "지난 학기 게시글입니다"
          : isSameDorm
          ? "메시지 보내기"
          : "나와 같은 기숙사생에게만 보낼 수 있어요."}
      </MessageButton>

      <HeartToggleButton
        onClick={handleLikeClick}
        aria-label={liked ? "좋아요 취소" : "좋아요"}
        liked={liked}
        disabled={isLikeSubmitting}
      />
    </RoomMateBottomBarWrapper>
  );
};

export default RoomMateBottomBar;

const RoomMateBottomBarWrapper = styled.div`
  width: 100%;
  max-width: 480px;
  height: calc(64px + env(safe-area-inset-bottom, 0px));
  padding: 8px 16px calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  z-index: 100;
`;

const MessageButton = styled.button`
  ${typography.label1Normal}
  height: 40px;
  min-width: 0;
  padding: 8px 16px;
  border: 0;
  border-radius: 32px;
  background: ${colors.gray.gray0};
  box-shadow: 0 2px 5px ${colors.gray.gray200};
  color: ${colors.gray.gray400};
  display: flex;
  align-items: center;
  //justify-content: center;
  flex: 1 1 auto;
  cursor: pointer;

  color: var(--Text-Text3, #a5a5a5);

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;
