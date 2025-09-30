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
import CommentSection from "../../components/tip/CommentSection.tsx";
import CommentInputBox from "../../components/tip/CommentInputBox.tsx";

interface TipComment {
  tipCommentId: number;
  userId: number;
  reply: string;
  parentId: number;
  isDeleted: boolean;
  createdDate?: string;
  name: string;
  profileImageUrl: string;
  writerImageFile: string;
}

interface TipDetail {
  writerImageFile: string;
  boardId: number;
  title: string;
  content: string;
  tipLikeCount: number;
  tipLikeUserList: number[];
  createDate: string;
  tipCommentDtoList: TipComment[];
  checkLikeCurrentUser: boolean; // ← 서버 응답에 포함
  name: string;
  profileImageUrl: string;
}

export default function TipDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [tip, setTip] = useState<TipDetail | null>(null);
  const navigate = useNavigate();

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 댓글 입력 상태
  const [commentInput, setCommentInput] = useState("");
  // const [replyOpen, setReplyOpen] = useState<{ [key: number]: boolean }>({});
  const { userInfo, tokenInfo } = useUserStore();
  const [images, setImages] = useState<string[]>([]);
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  // 좋아요 상태
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [ismypost, setismypost] = useState(false);

  const [isneedupdate, setisneedupdate] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // --- 게시글 불러오기 및 좋아요 반영
    const fetchTipDetail = async (boardId: string) => {
      try {
        const res = await axiosInstance.get(`/tips/${boardId}`);
        console.log(res);
        setTip(res.data);
        setLikeCount(res.data.tipLikeCount);
        setLiked(res.data.checkLikeCurrentUser ?? false);
      } catch (err) {
        console.error("게시글 불러오기 실패", err);
      }
    };

    // --- 이미지 불러오기
    const fetchTipImages = async (boardId: string) => {
      try {
        const res = await axiosInstance.get(`/tips/${boardId}/image`);
        const urls = res.data.map((img: any) => img.fileName);
        setImages(urls);
      } catch (err) {
        console.error("이미지 불러오기 실패", err);
      }
    };

    if (boardId) {
      fetchTipDetail(boardId);
      fetchTipImages(boardId);
    }
  }, [boardId, isneedupdate]);

  // 2차: tip이 변경된 이후 실행되는 useEffect
  useEffect(() => {
    if (tip && userInfo?.name && tip.name === userInfo.name) {
      setismypost(true);
    }

    console.log(tip?.name, userInfo?.name);
  }, [tip, userInfo]);

  // --- 게시글 삭제
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

  // --- 좋아요 토글 (POST 요청)
  const handleLike = async () => {
    if (!boardId) return;
    console.log(boardId);
    try {
      if (!liked) {
        const res = await tokenInstance.patch(`/tips/${boardId}/like`);
        console.log(res);
      } else {
        const res = await tokenInstance.patch(`/tips/${boardId}/unlike`);
        console.log(res);
      }

      setLiked((prev) => !prev);
      setLikeCount((prev) => prev + (liked ? -1 : 1));
    } catch (err) {
      alert("좋아요 실패!");
    }
  };

  // --- 댓글 등록
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

  // --- 이미지 슬라이더
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
      onClick: () => {
        navigate("/tips/write", { state: { tip: tip } });
      },
    },
    {
      label: "삭제하기",
      onClick: () => {
        handleDelete();
      },
    },
  ];

  return (
    <Wrapper>
      <Header
        title="기숙사 꿀팁"
        hasBack={true}
        menuItems={ismypost ? menuItems : undefined}
      />
      <ScrollArea>
        <Content>
          {tip && (
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

              {/* 좋아요 영역 */}
              <LikeBox onClick={handleLike} style={{ cursor: "pointer" }}>
                <FaRegHeart
                  style={{ color: liked ? "#e25555" : "#bbb" }}
                  size={18}
                />
                좋아요 {likeCount}
              </LikeBox>
              <Divider />
              <CommentSection
                tipCommentDtoList={tip.tipCommentDtoList}
                boardId={boardId!}
                isLoggedIn={isLoggedIn}
                setisneedupdate={setisneedupdate}
              />
            </>
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
            <img src={previewUrl} />
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

// --- styled-components (이 아래는 그대로!)

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: white;
  padding-top: 56px;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px 100px; /* 댓글창 고려 */
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

// const Spacer = styled.div`
//   flex-grow: 1;
// `;

const ImageSlider = styled.div`
  width: 100%;
  height: 200px;
  background: #ccc;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  border-radius: 10px;
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
