import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { FaRegHeart } from "react-icons/fa";
import tokenInstance from "../../apis/tokenInstance";
import { useSwipeable } from "react-swipeable";
import useUserStore from "../../stores/useUserStore.ts";
import UserInfo from "../../components/common/UserInfo.tsx";
import CommentSection from "../../components/comment/CommentSection.tsx";
import CommentInputBox from "../../components/comment/CommentInputBox.tsx";
import { ReplyProps } from "@/types/comment";
import { deleteTipComment } from "@/apis/tips";
import { TipDetail, TipImage } from "@/types/tips";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import CommonBottomSheet from "src/components/modal/CommonBottomSheet.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useIsAdminRole } from "../../hooks/useIsAdminRole";

export default function TipDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [tip, setTip] = useState<TipDetail | null>(null);
  const navigate = useNavigate();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const { tokenInfo } = useUserStore();
  const [images, setImages] = useState<TipImage[]>([]);
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  // 관리자 권한 확인
  const { isAdmin } = useIsAdminRole();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isneedupdate, setisneedupdate] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchAllData = async () => {
      if (!boardId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [tipResponse, imagesResponse] = await Promise.all([
          tokenInstance.get(`/tips/${boardId}`),
          tokenInstance.get(`/tips/${boardId}/image`),
        ]);

        setTip(tipResponse.data);
        setLikeCount(tipResponse.data.tipLikeCount);
        setLiked(tipResponse.data.checkLikeCurrentUser ?? false);

        setImages(imagesResponse.data);
      } catch (err) {
        console.error("게시글 또는 이미지 불러오기 실패", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [boardId, isneedupdate]);

  const handleDelete = async () => {
    if (!boardId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await tokenInstance.delete(`/tips/${boardId}`);
      alert("삭제되었습니다.");
      navigate(-1);
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleLike = async () => {
    if (!boardId) return;
    if (!isLoggedIn) {
      alert("로그인 후 사용할 수 있습니다.");
      return;
    }
    try {
      const endpoint = liked
        ? `/tips/${boardId}/unlike`
        : `/tips/${boardId}/like`;
      await tokenInstance.patch(endpoint);
      setLiked((prev) => !prev);
      setLikeCount((prev) => prev + (liked ? -1 : 1));
    } catch (err) {
      alert("좋아요 실패!");
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    if (!isLoggedIn) {
      alert("로그인 후 사용해주세요.");
      return;
    }
    try {
      await tokenInstance.post("/tip-comments", {
        parentCommentId: null,
        tipId: Number(boardId),
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
      await tokenInstance.post("/tip-comments", {
        parentCommentId,
        tipId: Number(boardId),
        reply: replyInput,
      });
      setReplyInputs((prev) => ({ ...prev, [parentCommentId]: "" }));
      setReplyInputOpen((prev) => ({ ...prev, [parentCommentId]: false }));
      setisneedupdate(!isneedupdate);
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

  // 관리자 권한이 있는 경우에만 헤더 메뉴 노출
  useSetHeader({
    title: "게시글 상세",
    menuItems:
      isLoggedIn && isAdmin
        ? [
            {
              label: "수정하기",
              onClick: () =>
                navigate("/tips/write", {
                  state: { tip: tip, tipImages: images },
                }),
            },
            {
              label: "삭제하기",
              onClick: handleDelete,
            },
          ]
        : undefined,
  });

  // 텍스트 내 URL 감지 및 링크 변환
  const renderContentWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <StyledLink
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </StyledLink>
        );
      }
      return part;
    });
  };

  return (
    <Wrapper>
      <Content>
        {isLoading ? (
          <LoadingSpinner message="꿀팁을 불러오는 중..." />
        ) : tip ? (
          <>
            <UserInfo
              username={tip.name}
              createDate={tip.createDate}
              authorImagePath={tip.writerImageFile}
            />

            {images.length > 0 && (
              <ImageSlider {...handlers} style={{ touchAction: "pan-y" }}>
                <SliderItem
                  onClick={() => {
                    setPreviewUrl(images[currentImage].imageUrl);
                    setShowInfoModal(true);
                  }}
                >
                  <img
                    src={images[currentImage].imageUrl}
                    alt={`팁 이미지 ${currentImage + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain", // 원본 비율 유지하며 전체 노출
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

            <Title>{tip.title}</Title>
            <BodyText>{renderContentWithLinks(tip.content)}</BodyText>
            <Divider />

            <LikeBox onClick={handleLike} style={{ cursor: "pointer" }}>
              <FaRegHeart
                style={{ color: liked ? "#e25555" : "#bbb" }}
                size={18}
              />
              좋아요 {likeCount}
            </LikeBox>
            <Divider />
            <CommentSection
              CommentDtoList={tip.tipCommentDtoList}
              setisneedupdate={setisneedupdate}
              handleReplySubmit={handleReplySubmit}
              handleDeleteComment={deleteTipComment}
            />
          </>
        ) : (
          <EmptyMessage message="꿀팁 정보를 불러올 수 없습니다." />
        )}
      </Content>
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
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: white;
  box-sizing: border-box;

  flex: 1;
  padding: 0 16px 100px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const ImageSlider = styled.div`
  width: 100%;
  height: 250px;
  background: #f8f8f8; // 배경색을 살짝 조정하여 이미지 경계 구분
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  border-radius: 10px;
`;

const SliderItem = styled.div`
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
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

const BodyText = styled.div`
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
`;

const StyledLink = styled.a`
  color: #007bff;
  text-decoration: underline;
  word-break: break-all;
`;

const LikeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0;
  color: #555;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #eee;
  margin: 16px 0;
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
