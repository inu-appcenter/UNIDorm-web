import styled from "styled-components";
import { FaRegHeart } from "react-icons/fa";
import { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import { GroupOrderDetail, GroupOrderImage } from "../../types/grouporder.ts";
import {
  cancelGroupPurchaseCompletion,
  completeGroupPurchase,
  createGroupOrderComment,
  deleteGroupOrderComment,
  deleteGroupPurchase,
  getGroupPurchaseDetail,
  getGroupPurchaseImages,
  likeGroupPurchase,
  unlikeGroupPurchase,
} from "../../apis/groupPurchase.ts";
import { useNavigate, useParams } from "react-router-dom";
import RoundSquareButton from "../../components/button/RoundSquareButton.tsx";
import 사람 from "../../assets/chat/human.svg";
import { useSwipeable } from "react-swipeable";
import { getDeadlineText } from "../../utils/dateUtils.ts";
import UserInfo from "../../components/common/UserInfo.tsx";
import CommentInputBox from "../../components/comment/CommentInputBox.tsx";
import { ReplyProps } from "../../types/comment.ts";
import useUserStore from "../../stores/useUserStore.ts";
import CommentSection from "../../components/comment/CommentSection.tsx";
import { CheckBeforeDeal2 } from "../../constants/CheckBeforeDeal2.tsx";
import Modal from "../../components/modal/Modal.tsx";
import CommonBottomModal from "../../components/modal/CommonBottomModal.tsx";
// 🔽 필요한 컴포넌트를 import 합니다.
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";

export default function GroupPurchasePostPage() {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const [isneedupdate, setisneedupdate] = useState(false);

  const { boardId } = useParams<{ boardId: string }>();
  const groupOrderId = Number(boardId);
  const navigate = useNavigate();

  const [post, setPost] = useState<GroupOrderDetail | null>(null);
  const [images, setImages] = useState<GroupOrderImage[]>([]);
  const [liked, setLiked] = useState<boolean>(false);
  // 🔽 로딩 상태를 관리할 state를 추가합니다.
  const [isLoading, setIsLoading] = useState(true);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // 로딩 시작
      try {
        // 상세 정보와 이미지를 동시에 요청합니다.
        const [postData, imageData] = await Promise.all([
          getGroupPurchaseDetail(groupOrderId),
          getGroupPurchaseImages(groupOrderId),
        ]);
        console.log(postData);
        console.log(imageData);

        setPost(postData);
        setLiked(postData.checkLikeCurrentUser);
        setImages(imageData);
      } catch (error) {
        console.error("게시글 조회 실패:", error);
        setPost(null); // 에러 발생 시 데이터 초기화
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [groupOrderId, isneedupdate]);

  // 👍 좋아요 토글 핸들러
  const handleLikeClick = async () => {
    if (!post) return;
    try {
      const updatedLikeCount = liked
        ? await unlikeGroupPurchase(post.id)
        : await likeGroupPurchase(post.id);
      setPost({ ...post, likeCount: updatedLikeCount });
      setLiked(!liked);
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleDelete = async () => {
    if (!post || !window.confirm("정말 삭제할까요?")) return;
    try {
      await deleteGroupPurchase(post.id);
      alert("삭제되었습니다.");
      navigate("/groupPurchase");
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
    }
  };

  // ✅ 공구 완료 토글 핸들러
  const handleCompletionToggle = async () => {
    if (!post) return;
    const confirmMessage = post.recruitmentComplete
      ? "모집 완료를 취소할까요?"
      : "공구 모집을 완료로 처리할까요?";
    if (!window.confirm(confirmMessage)) return;
    try {
      const apiCall = post.recruitmentComplete
        ? cancelGroupPurchaseCompletion
        : completeGroupPurchase;
      await apiCall(post.id);
      setPost({ ...post, recruitmentComplete: !post.recruitmentComplete });
      alert("처리되었습니다.");
    } catch (error) {
      console.error("모집 완료 처리 실패:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !isLoggedIn) {
      if (!isLoggedIn) alert("로그인 후 사용해주세요.");
      return;
    }
    try {
      await createGroupOrderComment({
        parentCommentId: null,
        groupOrderId: Number(boardId),
        reply: commentInput,
      });
      setCommentInput("");
      setisneedupdate(!isneedupdate);
    } catch (err) {
      alert("댓글 등록 실패");
    }
  };

  const handleReplySubmit = async ({
    parentCommentId,
    replyInputs,
    setReplyInputs,
    setReplyInputOpen,
  }: ReplyProps) => {
    const replyInput = replyInputs[parentCommentId];
    if (!replyInput?.trim()) return;
    try {
      await createGroupOrderComment({
        parentCommentId,
        groupOrderId: Number(boardId),
        reply: replyInput,
      });
      setReplyInputs((prev) => ({ ...prev, [parentCommentId]: "" }));
      setReplyInputOpen((prev) => ({ ...prev, [parentCommentId]: false }));
      setisneedupdate(true);
    } catch (err) {
      alert("대댓글 등록 실패");
    }
  };

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
      onClick: () => navigate("/groupPurchase/write", { state: { post } }),
    },
    { label: "삭제하기", onClick: handleDelete },
  ];

  return (
    <Wrapper>
      <Header
        title="공동구매 게시글"
        hasBack={true}
        menuItems={post?.myPost ? menuItems : undefined}
      />
      {/* 🔽 로딩 상태에 따라 스피너, 상세 내용, 빈 메시지를 조건부 렌더링합니다. */}
      {isLoading ? (
        <LoadingSpinner message="게시글을 불러오는 중..." />
      ) : post ? (
        <>
          <UserInfo
            createDate={post.createDate}
            username={post.username}
            authorImagePath={post.authorImagePath}
            groupOrderType={post.groupOrderType}
          />
          <Content>
            {images.length > 0 && (
              <ImageSlider {...handlers} style={{ touchAction: "pan-y" }}>
                {post.recruitmentComplete && (
                  <RecruitmentCompleteOverlay>
                    <OverlayTextLarge>공구 완료</OverlayTextLarge>
                    <OverlayTextSmall>
                      공구가 완료된 게시글입니다
                    </OverlayTextSmall>
                  </RecruitmentCompleteOverlay>
                )}
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
                <FaRegHeart style={{ color: liked ? "#e25555" : "#bbb" }} />{" "}
                좋아요 {post.likeCount}
              </LikeBox>
              {post.myPost ? (
                <RoundSquareButton
                  btnName={
                    post.recruitmentComplete
                      ? "모집 완료 취소하기"
                      : "공구 완료 처리하기"
                  }
                  onClick={handleCompletionToggle}
                  color={post.recruitmentComplete ? "#8E8E93" : undefined}
                />
              ) : (
                <RoundSquareButton
                  btnName={"오픈 채팅 참여하기"}
                  onClick={() => setShowModal(true)}
                />
              )}
            </LikeActionRow>

            <Divider />

            <CommentSection
              CommentDtoList={post.groupOrderCommentDtoList}
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

          <CommonBottomModal
            id={"이미지보기"}
            isOpen={showInfoModal}
            setIsOpen={setShowInfoModal}
          >
            <div style={{ textAlign: "center" }}>
              <img
                src={previewUrl || undefined}
                style={{ maxWidth: "100%" }}
                alt="미리보기"
              />
            </div>
          </CommonBottomModal>

          <Modal
            onClose={() => setShowModal(false)}
            show={showModal}
            title={"잠깐!"}
            content={CheckBeforeDeal2}
            headerImageId={2}
            closeButtonText={"확인했어요"}
            onCloseClick={() => {
              window.open(post.openChatLink, "_blank");
            }}
          />
        </>
      ) : (
        <EmptyMessage message="게시글 정보를 불러올 수 없습니다." />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 80px 16px;
  min-height: 100vh;
  box-sizing: border-box;
`;

const Content = styled.div`
  flex: 1;
`;

const ImageSlider = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
`;

const RecruitmentCompleteOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(50, 50, 50, 0.7);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 10px;
`;

const OverlayTextLarge = styled.p`
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px 0;
`;

const OverlayTextSmall = styled.p`
  font-size: 14px;
  margin: 0;
`;

const SliderItem = styled.div`
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const SliderIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  width: 100%;
  text-align: center;
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

const Dot = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#222" : "#ddd")};
  transition: background 0.2s;
`;
