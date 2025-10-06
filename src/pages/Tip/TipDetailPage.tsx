import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { FaRegHeart } from "react-icons/fa";
import Header from "../../components/common/Header";
import tokenInstance from "../../apis/tokenInstance";
import { useSwipeable } from "react-swipeable";
import axiosInstance from "../../apis/axiosInstance.ts";
import useUserStore from "../../stores/useUserStore.ts";
import 궁금해하는횃불이 from "../../assets/roommate/궁금해하는횃불이.png";
import RoundSquareWhiteButton from "../../components/button/RoundSquareWhiteButton.tsx";
import UserInfo from "../../components/common/UserInfo.tsx";
import CommentSection from "../../components/comment/CommentSection.tsx";
import CommentInputBox from "../../components/comment/CommentInputBox.tsx";
import { ReplyProps } from "../../types/comment.ts";
import { deleteTipComment } from "../../apis/tips.ts";
import { TipDetail } from "../../types/tips.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import EmptyMessage from "../../constants/EmptyMessage.tsx";
import { useIsAdminRole } from "../../hooks/useIsAdminRole.ts";

export default function TipDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [tip, setTip] = useState<TipDetail | null>(null);
  const navigate = useNavigate();
  const isAdmin = useIsAdminRole();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const { tokenInfo } = useUserStore();
  const [images, setImages] = useState<string[]>([]);
  const isLoggedIn = Boolean(tokenInfo.accessToken);
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

      setIsLoading(true); // 데이터 로딩 시작
      try {
        // 두 API 호출을 병렬로 처리하고 둘 다 완료될 때까지 기다립니다.
        const [tipResponse, imagesResponse] = await Promise.all([
          axiosInstance.get(`/tips/${boardId}`),
          axiosInstance.get(`/tips/${boardId}/image`),
        ]);

        console.log("tipResponse", tipResponse);

        // 팁 상세 정보 설정
        setTip(tipResponse.data);
        setLikeCount(tipResponse.data.tipLikeCount);
        setLiked(tipResponse.data.checkLikeCurrentUser ?? false);

        // 이미지 정보 설정
        const urls = imagesResponse.data.map((img: any) => img.fileName);
        setImages(urls);
      } catch (err) {
        console.error("게시글 또는 이미지 불러오기 실패", err);
        setTip(null); // 에러 발생 시 데이터 초기화
      } finally {
        setIsLoading(false); // 데이터 로딩 완료
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
      setisneedupdate(!isneedupdate); // 대댓글 등록 후 isneedupdate 상태 변경
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
      onClick: () => navigate("/tips/write", { state: { tip: tip } }),
    },
    {
      label: "삭제하기",
      onClick: handleDelete,
    },
  ];

  return (
    <Wrapper>
      <Header
        title="기숙사 꿀팁"
        hasBack={true}
        menuItems={isAdmin ? menuItems : undefined}
      />
      <ScrollArea>
        <Content>
          {/* 🔽 로딩 상태에 따라 스피너, 상세 내용, 빈 메시지를 조건부 렌더링합니다. */}
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
                      setPreviewUrl(images[currentImage]);
                      setShowInfoModal(true);
                    }}
                  >
                    <img
                      src={images[currentImage]}
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

              <Title>{tip.title}</Title>
              <BodyText>
                {tip.content.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </BodyText>
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
                isLoggedIn={isLoggedIn}
                setisneedupdate={setisneedupdate}
                handleReplySubmit={handleReplySubmit}
                handleDeleteComment={deleteTipComment}
              />
            </>
          ) : (
            <EmptyMessage message="꿀팁 정보를 불러올 수 없습니다." />
          )}
        </Content>
      </ScrollArea>
      <CommentInputBox
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        handleCommentSubmit={handleCommentSubmit}
      />
      {showInfoModal && previewUrl && (
        <ModalBackGround>
          <Modal>
            <ModalHeader>
              <img src={궁금해하는횃불이} className="wonder-character" />
              <h2>이미지 자세히 보기</h2>
            </ModalHeader>
            <img
              src={previewUrl}
              style={{ width: "100%", objectFit: "contain" }}
              alt="확대 이미지"
            />
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

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: white;
  padding-top: 56px;
  height: 100vh; /* 화면 전체 높이 */
  box-sizing: border-box;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px 100px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const ImageSlider = styled.div`
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  border-radius: 10px;
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

const ModalHeader = styled.div`
  flex-shrink: 0;
  margin-bottom: 12px;
  justify-content: space-between;
  padding-right: 50px;
  overflow-wrap: break-word;
  word-break: keep-all;

  h2 {
    margin: 0;
    box-sizing: border-box;
  }
  span {
    font-size: 14px;
  }
`;

const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
`;
