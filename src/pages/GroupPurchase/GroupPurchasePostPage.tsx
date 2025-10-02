import styled from "styled-components";
import { FaRegHeart } from "react-icons/fa";
import { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import { GroupOrderDetail, GroupOrderImage } from "../../types/grouporder.ts";
import {
  createGroupOrderComment,
  deleteGroupOrderComment,
  deleteGroupPurchase,
  getGroupPurchaseDetail,
  getGroupPurchaseImages,
  likeGroupPurchase,
  unlikeGroupPurchase,
} from "../../apis/groupPurchase.ts";
import { useNavigate, useParams } from "react-router-dom";
import RoundSquareBlueButton from "../../components/button/RoundSquareBlueButton.tsx";
import 궁금해하는횃불이 from "../../assets/roommate/궁금해하는횃불이.png";
import 사람 from "../../assets/chat/human.svg";
import RoundSquareWhiteButton from "../../components/button/RoundSquareWhiteButton.tsx";
import { useSwipeable } from "react-swipeable";
import { getDeadlineText } from "../../utils/dateUtils.ts";
import UserInfo from "../../components/common/UserInfo.tsx";
import CommentInputBox from "../../components/comment/CommentInputBox.tsx";
import { ReplyProps } from "../../types/comment.ts";
import useUserStore from "../../stores/useUserStore.ts";
import CommentSection from "../../components/comment/CommentSection.tsx";

export default function GroupPurchasePostPage() {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const [isneedupdate, setisneedupdate] = useState(false);

  const { boardId } = useParams<{ boardId: string }>(); // URL에서 id 가져오기
  const groupOrderId = Number(boardId); // string → number 변환
  const navigate = useNavigate();

  const [post, setPost] = useState<GroupOrderDetail | null>(null);
  const [images, setImages] = useState<GroupOrderImage[]>([]);
  const [liked, setLiked] = useState<boolean>(false);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postData = await getGroupPurchaseDetail(groupOrderId);
        setPost(postData);
        setLiked(postData.checkLikeCurrentUser);
        console.log("post data", postData);

        const imageData = await getGroupPurchaseImages(groupOrderId);
        setImages(imageData);
        console.log("imagedata", imageData);
      } catch (error) {
        console.error("게시글 조회 실패:", error);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [groupOrderId, isneedupdate]);

  // 👍 좋아요 토글 핸들러
  const handleLikeClick = async () => {
    if (!post) return;

    try {
      let updatedLikeCount: number;
      if (liked) {
        updatedLikeCount = await unlikeGroupPurchase(post.id);
      } else {
        updatedLikeCount = await likeGroupPurchase(post.id);
      }

      setPost({ ...post, likeCount: updatedLikeCount });
      setLiked(!liked);
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    if (!window.confirm("정말 삭제할까요?")) {
      return;
    }
    try {
      const result = deleteGroupPurchase(post.id);
      console.log(result);
      alert("삭제되었습니다.");
      navigate("/groupPurchase");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
    }
  };

  // // ✅ 모집 완료 토글 핸들러
  // const handleCompletionToggle = async () => {
  //   if (!post) return;
  //
  //   try {
  //     if (post.recruitmentComplete) {
  //       await cancelGroupPurchaseCompletion(post.id);
  //     } else {
  //       await completeGroupPurchase(post.id);
  //     }
  //
  //     setPost({
  //       ...post,
  //       recruitmentComplete: !post.recruitmentComplete,
  //     });
  //   } catch (error) {
  //     console.error("모집 완료 처리 실패:", error);
  //   }
  // };

  // --- 댓글 등록
  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    if (!isLoggedIn) {
      alert("로그인 후 사용해주세요.");
      return;
    }
    try {
      await createGroupOrderComment({
        parentCommentId: null, // 대댓글이 아닐 경우 null
        groupOrderId: Number(boardId), // 게시글 ID
        reply: commentInput, // 입력한 댓글
      });
      setCommentInput("");
      setisneedupdate(!isneedupdate);
    } catch (err) {
      alert("댓글 등록 실패");
    }
  };

  //대댓글 등록
  const handleReplySubmit = async ({
    parentCommentId,
    replyInputs,
    setReplyInputs,
    setReplyInputOpen,
  }: ReplyProps) => {
    const replyInput = replyInputs[parentCommentId];
    if (!replyInput?.trim()) return;

    try {
      // 공동구매 대댓글 등록 API 호출
      await createGroupOrderComment({
        parentCommentId, // 부모 댓글 ID
        groupOrderId: Number(boardId), // 게시글 ID
        reply: replyInput, // 입력한 대댓글 내용
      });

      setReplyInputs((prev) => ({ ...prev, [parentCommentId]: "" }));
      setReplyInputOpen((prev) => ({ ...prev, [parentCommentId]: false }));
      setisneedupdate(true);
    } catch (err) {
      alert("대댓글 등록 실패");
    }
  };

  // --- 이미지 슬라이더
  const [currentImage, setCurrentImage] = useState(0);
  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentImage((idx) => Math.min(images.length - 1, idx + 1)),
    onSwipedRight: () => setCurrentImage((idx) => Math.max(0, idx - 1)),
    trackMouse: true,
  });

  const formatDeadlineDate = (deadline: string) => {
    const date = new Date(deadline);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${month}.${day} ${hours}시 ${minutes}분`;
  };

  const menuItems = [
    {
      label: "수정하기",
      onClick: () => {
        navigate("/groupPurchase/write", { state: { post: post } });
      },
    },
    {
      label: "삭제하기",
      onClick: () => {
        handleDelete();
      },
    },
  ];

  if (!post) return <div>로딩중...</div>;

  return (
    <Wrapper>
      <Header
        title="공구 게시글"
        hasBack={true}
        menuItems={post.myPost ? menuItems : undefined}
      />
      <UserInfo
        createDate={post.createDate}
        username={post.username}
        authorImagePath={post.authorImagePath}
        groupOrderType={post.groupOrderType}
      />
      <Content>
        {images.length > 0 && (
          <ImageSlider {...handlers} style={{ touchAction: "pan-y" }}>
            <SliderItem
              onClick={() => {
                setPreviewUrl(images[currentImage].fileName);
                setShowInfoModal(true);
              }}
            >
              <img
                src={images[currentImage].fileName}
                alt={`팁 이미지 ${currentImage + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "10px",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                draggable={false}
              />
            </SliderItem>
            <SliderIndicator>
              {images.map((_, idx) => (
                <Dot key={idx} $active={idx === currentImage} />
              ))}
            </SliderIndicator>
          </ImageSlider>
        )}

        <Title>{post.title}</Title>

        <MetaInfo>
          <Dday>{getDeadlineText(post.deadline)}</Dday>
          <DividerBar>|</DividerBar>
          <Dday>마감 {formatDeadlineDate(post.deadline)}</Dday>
          <DividerBar>|</DividerBar>
          <People>
            <img src={사람} alt="인원수" />
            조회수 {post.viewCount}
          </People>
        </MetaInfo>

        <Price>{post.price.toLocaleString()}원</Price>

        <BodyText>
          {post.description}
          <br />
          <br />
          구매 제품 링크:{" "}
          <a href={post.link} target="_blank" rel="noopener noreferrer">
            {post.link}
          </a>
        </BodyText>

        <Divider />

        <LikeActionRow>
          <LikeBox onClick={handleLikeClick}>
            <FaRegHeart style={{ color: liked ? "#e25555" : "#bbb" }} /> 좋아요{" "}
            {post.likeCount}
          </LikeBox>
          {post.myPost ? (
            <RoundSquareBlueButton
              btnName={"공구 완료 처리하기"}
              onClick={() => {}}
            />
          ) : (
            <RoundSquareBlueButton
              btnName={"오픈 채팅방 참여하기"}
              onClick={() => {
                window.open(post.openChatLink, "_blank");
              }}
            />
          )}

          {/*<JoinButton>참여하기</JoinButton>*/}
        </LikeActionRow>

        <Divider />

        <CommentSection
          CommentDtoList={post.groupOrderCommentDtoList}
          isLoggedIn={isLoggedIn}
          setisneedupdate={setisneedupdate}
          handleReplySubmit={handleReplySubmit}
          handleDeleteComment={deleteGroupOrderComment}
        />
      </Content>

      <CommentInputBox
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        handleCommentSubmit={handleCommentSubmit}
      />

      {showInfoModal && previewUrl && (
        <ModalBackGround>
          <Modal>
            <ModalContentWrapper>
              <ModalHeader>
                <img src={궁금해하는횃불이} className="wonder-character" />
                <h2>이미지 자세히 보기</h2>
              </ModalHeader>
              <ModalScrollArea>
                <img src={previewUrl} />
              </ModalScrollArea>
            </ModalContentWrapper>
            <ButtonGroupWrapper>
              <RoundSquareWhiteButton
                btnName={"닫기"}
                onClick={() => setShowInfoModal(false)}
              />
            </ButtonGroupWrapper>
          </Modal>
        </ModalBackGround>
      )}
    </Wrapper>
  );
}

// ----------------- styled components -----------------

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding: 80px 16px;
`;

const Content = styled.div`
  flex: 1;
`;

const ImageSlider = styled.div`
  width: 100%;
  height: 200px;
  background: #ccc;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
`;

const SliderItem = styled.div`
  width: 100%;
  height: 100%;
`;

const SliderIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #fff;
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: bold;
  margin: 8px 0;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
  gap: 6px;
`;

const Dday = styled.span`
  color: #f97171;
`;

const DividerBar = styled.span`
  color: #aaa;
`;

const People = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  img {
    width: 14px;
    height: 14px;
  }
`;

const Price = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  margin-top: 12px;
`;

const BodyText = styled.p`
  font-size: 14px;
  line-height: 1.5;
`;

const LikeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0;
  color: #555;

  cursor: pointer;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #eee;
  margin: 16px 0;
`;

const LikeActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
`;

const ModalBackGround = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  padding: 32px 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  max-height: 80%;
  background: white;
  color: #333366;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
  overflow: hidden;
  position: relative;

  .wonder-character {
    position: absolute;
    top: 10px;
    right: 0;
    width: 100px;
    height: 100px;
    z-index: 1000;
  }

  .content {
    width: 100%;
    flex: 1;
    //height: 100%;
    overflow-y: auto;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; /* 내부에서만 스크롤 생기도록 */
`;

const ModalHeader = styled.div`
  flex-shrink: 0; /* 스크롤 시 줄어들지 않게 고정 */
  margin-bottom: 12px;
  justify-content: space-between;
  padding-right: 50px;
  overflow-wrap: break-word; // 또는 wordWrap
  word-break: keep-all; // 단어 중간이 아니라 단어 단위로 줄바꿈

  h2 {
    margin: 0;
    box-sizing: border-box;
    font-size: 22px;
  }
  span {
    font-size: 14px;
  }
`;

const ModalScrollArea = styled.div`
  flex: 1;
  overflow-y: scroll; /* 항상 스크롤 가능하게 */
  padding-right: 8px;

  img {
    width: 100%;
  }

  /* 크롬/사파리 */
  &::-webkit-scrollbar {
    display: block; /* 기본 표시 */
    width: 8px; /* 스크롤바 두께 */
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  /* 파이어폭스 */
  scrollbar-width: thin; /* 얇게 */
  scrollbar-color: #ccc transparent;
`;

const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
`;

const Dot = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#222" : "#ddd")};
  transition: background 0.2s;
`;
