import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { BsSend, BsThreeDotsVertical } from "react-icons/bs";
import { FaRegHeart, FaUserCircle } from "react-icons/fa";
import Header from "../../components/common/Header";
import tokenInstance from "../../apis/tokenInstance"; // ← 반드시 tokenInstance로!
import { useSwipeable } from "react-swipeable";

interface TipComment {
  tipCommentId: number;
  userId: number;
  reply: string;
  parentId: number;
  isDeleted: boolean;
  createDate? : string;
}

interface TipDetail {
  id: number;
  title: string;
  content: string;
  tipLikeCount: number;
  tipLikeUserList: number[];
  createDate: string;
  tipCommentDtoList: TipComment[];
}

export default function TipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tip, setTip] = useState<TipDetail | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 댓글 입력 상태
  const [commentInput, setCommentInput] = useState("");
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
  const [replyOpen, setReplyOpen] = useState<{ [key: number]: boolean }>({});
  const [userInfo, setUserInfo] = useState<{
    name: string;
    profileImageUrl: string;
  } | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchTipDetail(id);
      fetchTipImages(id);
    }
    fetchUserInfo();
    // eslint-disable-next-line
  }, [id]);

  // ----------- 여기가 핵심 수정!
  const fetchTipDetail = async (id: string) => {
    try {
      const res = await tokenInstance.get(`/tips/${id}`);
      setTip(res.data);
    } catch (err) {
      console.error("게시글 불러오기 실패", err);
    }
  };

  const fetchTipImages = async (id: string) => {
    try {
      const res = await tokenInstance.get(`/tips/${id}/image`);
      // fileName이 진짜 이미지 url임!
      const urls = res.data.map((img: any) => img.fileName);
      setImages(urls);
    } catch (err) {
      console.error("이미지 불러오기 실패", err);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const userRes = await tokenInstance.get("/users");
      const imageRes = await tokenInstance.get("/users/image", {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(imageRes.data);
      setUserInfo({ name: userRes.data.name, profileImageUrl: imageUrl });
    } catch (err) {}
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await tokenInstance.delete(`/tips/${id}`);
      alert("삭제되었습니다.");
      navigate(-1);
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  };

  // 댓글 등록
  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    try {
      await tokenInstance.post("/tip-comments", {
        parentCommentId: null,
        tipId: Number(id),
        reply: commentInput,
      });
      setCommentInput("");
      fetchTipDetail(id!);
    } catch (err) {
      alert("댓글 등록 실패");
    }
  };

  // 대댓글 등록
  const handleReplySubmit = async (parentCommentId: number) => {
    const replyInput = replyInputs[parentCommentId];
    if (!replyInput?.trim()) return;
    try {
      await tokenInstance.post("/tip-comments", {
        parentCommentId,
        tipId: Number(id),
        reply: replyInput,
      });
      setReplyInputs((prev) => ({ ...prev, [parentCommentId]: "" }));
      setReplyOpen((prev) => ({ ...prev, [parentCommentId]: false }));
      fetchTipDetail(id!);
    } catch (err) {
      alert("대댓글 등록 실패");
    }
  };

  //이미지 넘기기
  const [currentImage, setCurrentImage] = useState(0);

  // 슬라이드 핸들러 세팅
  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentImage(idx => Math.min(images.length - 1, idx + 1)),
    onSwipedRight: () => setCurrentImage(idx => Math.max(0, idx - 1)),
    trackMouse: true // PC에서 마우스 드래그도 허용하려면
  });

  return (
    <Wrapper>
      <Header title="기숙사 꿀팁" hasBack={true} showAlarm={true} />

      <ScrollArea>
        <Content>
          {tip && (
            <>
              <UserInfo>
                {userInfo?.profileImageUrl ? (
                  <img
                    src={userInfo.profileImageUrl}
                    alt="프사"
                    style={{ width: 36, height: 36, borderRadius: "50%" }}
                  />
                ) : (
                  <FaUserCircle size={36} color="#ccc" />
                )}
                <UserText>
                  <Nickname>{userInfo?.name || "익명"}</Nickname>
                  <Date>{tip?.createDate || "날짜 불러오는 중..."}</Date>
                </UserText>
                <Spacer />
                <BsThreeDotsVertical
                  size={18}
                  onClick={() => setMenuOpen(!menuOpen)}
                />
                {menuOpen && (
                  <Menu>
                    <MenuItem
                      onClick={() => alert("수정하기는 아직 구현 안됨!")}
                    >
                      수정하기
                    </MenuItem>
                    <MenuItem onClick={handleDelete}>삭제하기</MenuItem>
                  </Menu>
                )}
              </UserInfo>

              {/* 이미지가 하나 이상 있을 때만 보여줌 */}
              {images.length > 0 && (
                <ImageSlider {...handlers} style={{ touchAction: "pan-y" }}>
                  {/* ...이하 슬라이더 내부 동일 */}
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
                        pointerEvents: "none"
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

              <LikeBox>
                <FaRegHeart /> 좋아요 {tip.tipLikeCount ?? 0}
              </LikeBox>

              <Divider />

              <CommentList>
              {tip.tipCommentDtoList
                ?.filter((c) => c.parentId === 0 || c.parentId === null)
                .map((comment) => (
                  <div key={comment.tipCommentId}>
                    <Comment>
                      <FaUserCircle size={32} color="#ccc" />
                      <CommentContent>
                        <CommentBody>
                          <Nickname>익명 {comment.userId}</Nickname>
                          <CommentText>{comment.reply}</CommentText>
                          <Date>
                          {comment.createDate
                            ? new Date(comment.createDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "방금"}
                          
                        </Date>

                        </CommentBody>
                        <CommentActionArea>
                          <ReplyButton
                            onClick={() =>
                              setReplyOpen((prev) => ({
                                ...prev,
                                [comment.tipCommentId]: !prev[comment.tipCommentId],
                              }))
                            }
                          >
                            답글
                          </ReplyButton>
                        </CommentActionArea>
                      </CommentContent>
                    </Comment>
                    {/* 대댓글 입력창 */}
                    {replyOpen[comment.tipCommentId] && (
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
                            e.key === "Enter" && handleReplySubmit(comment.tipCommentId)
                          }
                        />
                        <ReplySendButton
                          onClick={() => handleReplySubmit(comment.tipCommentId)}
                        >
                          <BsSend size={16} />
                        </ReplySendButton>
                      </ReplyInputArea>
                    )}
                    {/* 대댓글 목록 */}
                    {tip.tipCommentDtoList
                      .filter((r) => r.parentId === comment.tipCommentId)
                      .map((reply) => (
                        <Reply key={reply.tipCommentId}>
                          <FaUserCircle size={28} color="#ccc" />
                          <ReplyContent>
                            <ReplyBody>
                              <Nickname>익명 {reply.userId}</Nickname>
                              <CommentText>{reply.reply}</CommentText>
                              <Date>
                              {reply.createDate
                                ? new Date(reply.createDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : "방금"}
                            </Date>
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

      <CommentInput>
        <input
          placeholder="댓글 입력"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
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

const Date = styled.div`
  font-size: 12px;
  color: gray;
`;

const Spacer = styled.div`
  flex-grow: 1;
`;

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

const Menu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const MenuItem = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  &:hover {
    background-color: #f8f8f8;
  }
`;

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
`;

const ReplyButton = styled.button`
  border: none;
  background: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 0 8px;
  border-radius: 6px;
  &:hover {
    background: #f3f3f3;
  }
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
