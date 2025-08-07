import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { BsSend, BsThreeDotsVertical } from "react-icons/bs";
import { FaRegHeart, FaUserCircle } from "react-icons/fa";
import Header from "../../components/common/Header";
import tokenInstance from "../../apis/tokenInstance";
import { useSwipeable } from "react-swipeable";
import axiosInstance from "../../apis/axiosInstance.ts";
import useUserStore from "../../stores/useUserStore.ts";

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

  // 댓글 입력 상태
  const [commentInput, setCommentInput] = useState("");
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
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

  //댓글 및 대댓글 관련 action
  const [replyMenuOpen, setReplyMenuOpen] = useState<{
    [key: number]: boolean;
  }>({});
  const [replyInputOpen, setReplyInputOpen] = useState<{
    [key: number]: boolean;
  }>({});

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

  // --- 대댓글 등록
  const handleReplySubmit = async (parentCommentId: number) => {
    const replyInput = replyInputs[parentCommentId];
    if (!replyInput?.trim()) return;
    console.log(replyInput);
    console.log(parentCommentId);
    console.log(boardId);
    try {
      const res = await tokenInstance.post("/tip-comments", {
        parentCommentId,
        tipId: Number(boardId),
        reply: replyInput,
      });

      console.log(res);
      setReplyInputs((prev) => ({ ...prev, [parentCommentId]: "" }));
      setReplyInputOpen((prev) => ({ ...prev, [parentCommentId]: false }));
      setisneedupdate(!isneedupdate);
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
              <UserInfo>
                {tip.writerImageFile ? (
                  <img
                    src={tip.writerImageFile}
                    alt="프사"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <FaUserCircle size={36} color="#ccc" />
                )}
                <UserText>
                  <Nickname>{tip?.name || "횃불이"}</Nickname>
                  <DateText>
                    {tip?.createDate
                      ? new Date(tip.createDate).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "날짜 불러오는 중..."}
                  </DateText>
                </UserText>
              </UserInfo>

              {images.length > 0 && (
                <ImageSlider {...handlers} style={{ touchAction: "pan-y" }}>
                  <SliderItem>
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
              <BodyText>{tip.content}</BodyText>
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

              {/* 댓글 리스트 */}
              <CommentList>
                {tip.tipCommentDtoList
                  ?.filter(
                    (c) =>
                      (c.parentId === 0 || c.parentId === null) &&
                      c.isDeleted === false,
                  )
                  .map((comment) => (
                    <div key={comment.tipCommentId}>
                      <Comment>
                        {/*<FaUserCircle size={32} color="#ccc" />*/}
                        <img
                          src={comment.writerImageFile}
                          alt="프사"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <CommentContent>
                          <CommentBody>
                            <Nickname>{comment.name}</Nickname>
                            <CommentText>{comment.reply}</CommentText>
                            <DateText>
                              {comment.createdDate
                                ? new Date(
                                    comment.createdDate,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "방금"}
                            </DateText>
                          </CommentBody>
                          <CommentActionArea>
                            {/* 세로 점 3개 아이콘 */}
                            {isLoggedIn && (
                              <BsThreeDotsVertical
                                size={18}
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  setReplyMenuOpen((prev) => ({
                                    ...prev,
                                    [comment.tipCommentId]:
                                      !prev[comment.tipCommentId],
                                  }))
                                }
                              />
                            )}

                            {/* 메뉴: replyMenuOpen일 때만 노출 */}
                            {replyMenuOpen[comment.tipCommentId] && (
                              <ReplyMenu>
                                {/*<ReplyMenuItem*/}
                                {/*  onClick={() => {*/}
                                {/*    // 메뉴 닫고, 입력창 열기*/}
                                {/*    setReplyMenuOpen((prev) => ({*/}
                                {/*      ...prev,*/}
                                {/*      [comment.tipCommentId]: false,*/}
                                {/*    }));*/}
                                {/*    setReplyInputOpen((prev) => ({*/}
                                {/*      ...prev,*/}
                                {/*      [comment.tipCommentId]: true,*/}
                                {/*    }));*/}
                                {/*  }}*/}
                                {/*>*/}
                                {/*  답글*/}
                                {/*</ReplyMenuItem>*/}
                                <ReplyMenuItem
                                  onClick={async () => {
                                    if (!comment.tipCommentId) return;
                                    if (
                                      !window.confirm("정말 삭제하시겠습니까?")
                                    )
                                      return;
                                    try {
                                      await tokenInstance.delete(
                                        `/tip-comments/${comment.tipCommentId}`,
                                      );
                                      setisneedupdate(!isneedupdate);
                                      alert("삭제되었습니다.");
                                    } catch (err) {
                                      alert("삭제에 실패했습니다.");
                                    }
                                  }}
                                >
                                  삭제
                                </ReplyMenuItem>
                                <ReplyMenuItem
                                  onClick={() => {
                                    setReplyMenuOpen((prev) => ({
                                      ...prev,
                                      [comment.tipCommentId]: false,
                                    }));
                                    alert("신고가 접수되었습니다!");
                                  }}
                                >
                                  신고
                                </ReplyMenuItem>
                              </ReplyMenu>
                            )}
                          </CommentActionArea>
                        </CommentContent>
                      </Comment>

                      {/* 대댓글 입력창 */}
                      {replyInputOpen[comment.tipCommentId] && (
                        <ReplyInputArea>
                          <ReplyInput
                            placeholder="답글 입력"
                            value={replyInputs[comment.tipCommentId] || ""}
                            onChange={(e) =>
                              setReplyInputs((prev) => ({
                                ...prev,
                                [comment.tipCommentId]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              handleReplySubmit(comment.tipCommentId)
                            }
                          />
                          <ReplySendButton
                            onClick={() =>
                              handleReplySubmit(comment.tipCommentId)
                            }
                          >
                            <BsSend size={16} />
                          </ReplySendButton>
                        </ReplyInputArea>
                      )}

                      {/* === 대댓글 리스트 === */}
                      {tip.tipCommentDtoList
                        .filter((r) => r.parentId === comment.tipCommentId)
                        .map((reply) => (
                          <Reply key={reply.tipCommentId}>
                            <FaUserCircle size={28} color="#ccc" />
                            <ReplyContent>
                              <ReplyBody>
                                <Nickname>익명 {reply.userId}</Nickname>
                                <CommentText>{reply.reply}</CommentText>
                                <DateText>
                                  {reply.createdDate
                                    ? new Date(
                                        reply.createdDate,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "방금"}
                                </DateText>
                              </ReplyBody>
                            </ReplyContent>
                          </Reply>
                        ))}
                    </div>
                  ))}
              </CommentList>
            </>
          )}
        </Content>
      </ScrollArea>

      {/* 댓글 입력창 */}
      <CommentInput>
        <input
          placeholder="댓글 입력"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCommentSubmit();
            }
          }}
        />
        <SendButton onClick={handleCommentSubmit}>
          <BsSend
            size={18}
            style={{ color: "black", backgroundColor: "white", padding: "4px" }}
          />
        </SendButton>
      </CommentInput>
    </Wrapper>
  );
}

// --- styled-components (이 아래는 그대로!)

const Wrapper = styled.div`
  position: relative;
  height: 100vh;
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

const CommentInput = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 8px 16px;
  background: white;
  border-top: 1px solid #eee;
  z-index: 999;

  input {
    flex: 1;
    border: none;
    padding: 10px 12px;
    border-radius: 20px;
    background: #f5f5f5;
    font-size: 14px;
    outline: none;
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  padding-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
  overflow: visible;
`;

const UserText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Nickname = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const DateText = styled.div`
  font-size: 12px;
  color: gray;
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

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Comment = styled.div`
  display: flex;
  gap: 10px;
`;

const CommentBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CommentContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
`;

const CommentText = styled.div`
  font-size: 14px;
`;

const Reply = styled.div`
  display: flex;
  gap: 10px;
  background: #f0f0f0;
  padding: 12px;
  border-radius: 8px;
  margin-left: 36px;
`;

const ReplyBody = styled(CommentBody)`
  gap: 2px;
`;

const ReplyContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
`;

// const Menu = styled.div`
//   position: absolute;
//   top: 40px;
//   right: 0;
//   background: white;
//   border: 1px solid #ddd;
//   border-radius: 6px;
//   box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
//   z-index: 10;
// `;
//
// const MenuItem = styled.div`
//   padding: 10px 16px;
//   cursor: pointer;
//   &:hover {
//     background-color: #f8f8f8;
//   }
// `;

// 답글(대댓글) 입력 영역
const ReplyInputArea = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0 0 48px; /* 댓글에서 들여쓰기 */
  gap: 4px;
`;

const ReplyInput = styled.input`
  flex: 1;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 7px 12px;
  font-size: 13px;
`;

const ReplySendButton = styled.button`
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:active {
    background: #eee;
  }
`;

// 댓글의 "답글" 버튼과 오른쪽 메뉴 액션 영역
const CommentActionArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

// const ReplyButton = styled.button`
//   border: none;
//   background: none;
//   color: #666;
//   font-size: 13px;
//   cursor: pointer;
//   padding: 0 8px;
//   border-radius: 6px;
//   &:hover {
//     background: #f3f3f3;
//   }
// `;

const Dot = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 4px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#222" : "#ddd")};
  transition: background 0.2s;
`;

const ReplyMenu = styled.div`
  position: absolute;
  top: 24px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
  z-index: 100;
  min-width: 80px;
`;

const ReplyMenuItem = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: #f5f5f5;
  }
`;
