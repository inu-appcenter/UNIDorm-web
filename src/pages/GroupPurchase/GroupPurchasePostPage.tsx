import styled from "styled-components";
import { FaRegHeart } from "react-icons/fa";
import { useEffect, useState } from "react";
import { GroupOrderDetail, GroupOrderImage } from "@/types/grouporder";
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
} from "@/apis/groupPurchase";
import { useNavigate, useParams } from "react-router-dom";
import RoundSquareButton from "../../components/button/RoundSquareButton.tsx";
import 사람 from "../../assets/chat/human.svg";
import { useSwipeable } from "react-swipeable";
import { formatDeadlineDate, getDeadlineText } from "@/utils/dateUtils";
import UserInfo from "../../components/common/UserInfo.tsx";
import CommentInputBox from "../../components/comment/CommentInputBox.tsx";
import { ReplyProps } from "@/types/comment";
import useUserStore from "../../stores/useUserStore.ts";
import CommentSection from "../../components/comment/CommentSection.tsx";
import { CheckBeforeDeal2 } from "@/constants/CheckBeforeDeal2";
import Modal from "../../components/modal/Modal.tsx";
import CommonBottomSheet from "src/components/modal/CommonBottomSheet.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import { Dday, DividerBar, MetaInfo, People } from "@/styles/groupPurchase";
import useMediaQuery from "../../hooks/useMediaQuery.ts";
import ToolTipMessage from "../../components/common/TooltipMessage.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";

export default function GroupPurchasePostPage() {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  const [isneedupdate, setisneedupdate] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const { boardId } = useParams<{ boardId: string }>();
  const groupOrderId = Number(boardId);
  const navigate = useNavigate();

  const [post, setPost] = useState<GroupOrderDetail | null>(null);
  const [images, setImages] = useState<GroupOrderImage[]>([]);
  const [liked, setLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  const [showToolTip, setShowToolTip] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [postData, imageData] = await Promise.all([
          getGroupPurchaseDetail(groupOrderId),
          getGroupPurchaseImages(groupOrderId),
        ]);
        console.log("공동구매 게시글 조회 성공", postData);
        console.log("공동구매 게시글 이미지 조회 성공", imageData);

        setPost(postData);
        setLiked(postData.checkLikeCurrentUser);
        setImages(imageData);

        if (postData?.openChatLink === "") {
          // alert("오픈채팅 링크 없음");
          setShowToolTip(true);
        }
      } catch (error) {
        console.error("게시글 조회 실패:", error);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [groupOrderId, isneedupdate]);

  const handleLikeClick = async () => {
    if (!post) return;
    if (!isLoggedIn) {
      alert("로그인 후 사용할 수 있습니다.");
      return;
    }
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
      navigate("/groupPurchase", { replace: true });
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
    }
  };

  const handleCompletionToggle = async () => {
    if (!post) return;
    if (post.openChatLink === "") {
      alert("오픈채팅방 링크를 등록해주세요!");
      navigate("/groupPurchase/write", {
        state: { post, curImages: images },
      });
      return;
    }

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
      setisneedupdate((prev) => !prev);
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
      setisneedupdate((prev) => !prev);
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

  const menuItems = [
    {
      label: "수정하기",
      onClick: () =>
        navigate("/groupPurchase/write", {
          state: { post, curImages: images },
        }),
    },
    { label: "삭제하기", onClick: handleDelete },
  ];

  useSetHeader({
    title: "게시글 상세",
    menuItems,
  });

  return (
    <Wrapper>
      {isLoading ? (
        <LoadingSpinner message="게시글을 불러오는 중..." />
      ) : post ? (
        <>
          <PageLayout>
            {/* 🔽 PC에서 좌우 2단 레이아웃을 위한 컨테이너 */}
            <TopContentContainer>
              {!isDesktop && (
                <UserInfo
                  createDate={post.createDate}
                  username={post.username}
                  authorImagePath={post.authorImagePath}
                  groupOrderType={post.groupOrderType}
                />
              )}

              {/* 🖼️ 좌측: 이미지 섹션 */}
              {images.length > 0 && (
                <ImageSection>
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
                        setPreviewUrl(images[currentImage].imageUrl);
                        setShowInfoModal(true);
                      }}
                    >
                      <img
                        src={images[currentImage].imageUrl}
                        alt={`이미지 ${currentImage + 1}`}
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
                </ImageSection>
              )}

              {/* ℹ️ 우측: 정보 섹션 */}
              <InfoSection>
                {isDesktop && (
                  <UserInfo
                    createDate={post.createDate}
                    username={post.username}
                    authorImagePath={post.authorImagePath}
                    groupOrderType={post.groupOrderType}
                  />
                )}

                <Content>
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
                    {post.link ? (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        바로가기
                      </a>
                    ) : (
                      <>작성자가 링크를 입력하지 않았어요.</>
                    )}
                  </BodyText>

                  <Divider />

                  <LikeActionRow>
                    <LikeBox onClick={handleLikeClick}>
                      <FaRegHeart
                        style={{ color: liked ? "#e25555" : "#bbb" }}
                      />{" "}
                      좋아요 {post.likeCount}
                    </LikeBox>
                    {post.myPost ? (
                      <RelativeButtonWrapper>
                        <RoundSquareButton
                          btnName={
                            post.openChatLink === ""
                              ? "오픈채팅방 개설하기"
                              : post.recruitmentComplete
                                ? "모집 완료 취소하기"
                                : "공구 완료 처리하기"
                          }
                          onClick={handleCompletionToggle}
                          color={
                            post.openChatLink === ""
                              ? "#8E8E93"
                              : post.recruitmentComplete
                                ? "#8E8E93"
                                : undefined
                          }
                        />
                        {showToolTip && (
                          <ToolTipMessage
                            message={
                              "같이 구매하실 분이\n나타났다면,\n오픈채팅방을 개설해주세요"
                            }
                            onClose={() => setShowToolTip(false)}
                            width={"fit-content"}
                          />
                        )}
                      </RelativeButtonWrapper>
                    ) : (
                      <RelativeButtonWrapper>
                        <RoundSquareButton
                          btnName={
                            post.openChatLink === ""
                              ? "오픈채팅방 미개설"
                              : post.recruitmentComplete
                                ? "마감"
                                : "오픈 채팅 참여하기"
                          }
                          onClick={() => {
                            if (!isLoggedIn) {
                              alert("로그인 후 참여할 수 있어요.");
                              navigate("/login");
                              return;
                            }
                            if (post.openChatLink === "") {
                              alert(
                                "아직 오픈채팅방이 개설되지 않았어요.\n댓글로 글 작성자에게 개설을 요청해보세요.",
                              );
                              return;
                            }
                            if (post?.recruitmentComplete) {
                              alert("마감된 공동구매입니다.");
                              return;
                            }
                            setShowModal(true);
                          }}
                          color={
                            post.recruitmentComplete || post.openChatLink === ""
                              ? "#8E8E93"
                              : undefined
                          }
                        />
                        {showToolTip && (
                          <ToolTipMessage
                            message={
                              "작성자에게 오픈채팅방\n개설을 요청해보세요!"
                            }
                            onClose={() => setShowToolTip(false)}
                          />
                        )}
                      </RelativeButtonWrapper>
                    )}
                  </LikeActionRow>
                </Content>
                <Divider />
                <CommentSection
                  CommentDtoList={post.groupOrderCommentDtoList}
                  setisneedupdate={setisneedupdate}
                  handleReplySubmit={handleReplySubmit}
                  handleDeleteComment={deleteGroupOrderComment}
                />
              </InfoSection>
            </TopContentContainer>
          </PageLayout>

          <CommentInputBox
            commentInput={commentInput}
            setCommentInput={setCommentInput}
            handleCommentSubmit={handleCommentSubmit}
          />

          <CommonBottomSheet
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
          </CommonBottomSheet>

          <Modal
            onClose={() => setShowModal(false)}
            show={showModal}
            title={"거래 전 확인하세요!"}
            content={CheckBeforeDeal2()}
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
  padding: 0 16px calc(100px + var(--safe-area-bottom, 0px));
  min-height: 100vh;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    padding: 100px 16px; // PC에서는 상하 여백 조정
  }
`;

// 🔽 추가된 스타일: PC에서 콘텐츠를 중앙 정렬하고 최대 너비를 설정
const PageLayout = styled.div`
  width: 100%;
  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

// 🔽 추가된 스타일: PC에서 이미지와 정보를 좌우로 나누는 컨테이너
const TopContentContainer = styled.div`
  @media (min-width: 1024px) {
    display: flex;
    gap: 32px;
    align-items: flex-start;
  }
`;

// 🔽 추가된 스타일: 좌측 이미지 섹션
const ImageSection = styled.div`
  width: 100%;
  @media (min-width: 1024px) {
    flex: 1.2;
    position: sticky; // 스크롤 시 이미지 영역 고정
    top: calc(100px + var(--safe-area-top, 0px));
  }
`;

// 🔽 추가된 스타일: 우측 정보 섹션
const InfoSection = styled.div`
  width: 100%;
  @media (min-width: 1024px) {
    flex: 1;
  }
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

  /* PC에서는 이미지를 더 크게 표시 */
  @media (min-width: 1024px) {
    height: auto;
    aspect-ratio: 4 / 3; // 4:3 비율 유지
    margin-bottom: 0;
  }
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

const Price = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  margin-top: 12px;
`;

const BodyText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  overflow-wrap: break-word;
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

const RelativeButtonWrapper = styled.div`
  position: relative;
  padding-left: 40px;
  //box-sizing: border-box;
`;
