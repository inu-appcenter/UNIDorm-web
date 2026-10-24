import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import DOMPurify from "dompurify";
import { FaRegHeart } from "react-icons/fa";
import { useSwipeable } from "react-swipeable";
import useUserStore from "../../stores/useUserStore.ts";
import UserInfo from "../../components/common/UserInfo.tsx";
import CommentSection from "../../components/comment/CommentSection.tsx";
import CommentInputBox from "../../components/comment/CommentInputBox.tsx";
import { ReplyProps } from "@/types/comment";
import {
  createTipComment,
  deleteTip,
  deleteTipComment,
  setTipLiked,
} from "@/apis/tips";
import { useTipDetail } from "@/queries/tips";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import CommonBottomSheet from "src/components/modal/CommonBottomSheet.tsx";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useUserRole } from "src/hooks/useUserRole";
import { mixpanelTrack } from "@/utils/mixpanel";

export default function TipDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  // 관리자 권한 확인
  const { isAdmin } = useUserRole();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { data, isLoading } = useTipDetail(boardId ? Number(boardId) : undefined);
  const tip = data?.tip ?? null;
  const images = data?.images ?? [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [boardId]);

  // 좋아요는 누르는 즉시 반영하고, 다시 조회된 서버 값으로 맞춥니다.
  useEffect(() => {
    if (!tip) return;
    setLikeCount(tip.tipLikeCount);
    setLiked(tip.checkLikeCurrentUser ?? false);
  }, [tip]);

  // 상세 조회 추적 (글당 한 번)
  const trackedIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!tip || trackedIdRef.current === tip.boardId) return;
    trackedIdRef.current = tip.boardId;
    mixpanelTrack.postViewed("꿀팁", tip.boardId, tip.title);
  }, [tip]);

  const handleDelete = async () => {
    if (!boardId) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteTip(Number(boardId));
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
      await setTipLiked(Number(boardId), !liked);

      if (!liked) {
        mixpanelTrack.likeClicked("꿀팁", boardId, "꿀팁상세");
      }

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
      await createTipComment({
        parentCommentId: null,
        tipId: Number(boardId),
        reply: commentInput,
      });
      mixpanelTrack.commentCreated("꿀팁", "꿀팁상세");
      setCommentInput("");
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
      await createTipComment({
        parentCommentId: parentCommentId,
        tipId: Number(boardId),
        reply: replyInput,
      });
      mixpanelTrack.commentCreated("꿀팁_답글", "꿀팁상세");
      setReplyInputs((prev) => ({ ...prev, [parentCommentId]: "" }));
      setReplyInputOpen((prev) => ({ ...prev, [parentCommentId]: false }));
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

  const isHtmlContent = useMemo(() => {
    if (!tip?.content) return false;
    return /<[a-z][\s\S]*>/i.test(tip.content);
  }, [tip?.content]);

  const sanitizedHtml = useMemo(() => {
    if (!tip?.content || !isHtmlContent) return "";
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A" && node.hasAttribute("href")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });

    const clean = DOMPurify.sanitize(tip.content, {
      ADD_ATTR: ["target", "rel"],
    });

    DOMPurify.removeHook("afterSanitizeAttributes");
    return clean;
  }, [tip?.content, isHtmlContent]);

  // 텍스트 내 URL 감지 및 링크 변환 (일반 텍스트용)
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
            {isHtmlContent ? (
              <HtmlContent dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
            ) : (
              <BodyText>{renderContentWithLinks(tip.content)}</BodyText>
            )}
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
  padding: 16px 16px 100px;
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

const HtmlContent = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: #222;
  word-break: break-word;
  overflow-wrap: break-word;

  p {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 16px 0 8px 0;
    color: #111;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 14px 0 6px 0;
    color: #111;
  }

  ul,
  ol {
    padding-left: 20px;
    margin: 8px 0;
  }

  li {
    margin-bottom: 4px;
  }

  blockquote {
    border-left: 3px solid #007aff;
    padding-left: 12px;
    margin: 12px 0;
    color: #666;
    font-style: italic;
  }

  hr {
    border: none;
    border-top: 1px solid #eee;
    margin: 16px 0;
  }

  a {
    color: #007bff;
    text-decoration: underline;
  }
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
