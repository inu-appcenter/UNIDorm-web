import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../apis/axiosInstance";
import styled from "styled-components";
import { BsThreeDotsVertical, BsSend } from "react-icons/bs";
import { FaRegHeart, FaUserCircle } from "react-icons/fa";
import Header from "../../components/common/Header";
import { useNavigate } from "react-router-dom"

interface TipComment {
  tipCommentId: number;
  userId: number;
  reply: string;
  parentId: number;
  isDeleted: boolean;
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

  const fetchTipDetail = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/tips/${id}`);
      setTip(res.data);
    } catch (err) {
      console.error("게시글 불러오기 실패", err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchTipDetail(id);
      fetchTipImages(id);
    }
  }, [id]);

  const [userInfo, setUserInfo] = useState<{
  name: string;
  profileImageUrl: string;
} | null>(null);

const fetchUserInfo = async () => {
  try {
    const userRes = await axiosInstance.get("/users");
    const imageRes = await axiosInstance.get("/users/image", {
      responseType: "blob",
    });

    const imageUrl = URL.createObjectURL(imageRes.data);

    setUserInfo({
      name: userRes.data.name,
      profileImageUrl: imageUrl,
    });
  } catch (err) {
    console.error("유저 정보 가져오기 실패", err);
  }
};

useEffect(() => {
  fetchUserInfo();
}, []);

const [images, setImages] = useState<string[]>([]);

const fetchTipImages = async (id: string) => {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await axiosInstance.get(`/tips/${id}/image`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const urls = res.data.map((img: any) => img.imageUrl);
    setImages(urls);
  } catch (err) {
    console.error("이미지 불러오기 실패", err);
  }
};

const [menuOpen, setMenuOpen] = useState(false);

//게시물 삭제 함수 구현
const navigate = useNavigate();

const handleDelete = async () => {
  if (!id) return;

  const confirmed = window.confirm("정말 삭제하시겠습니까?");
  if (!confirmed) return;

  try {
    await axiosInstance.delete(`/tips/${id}`);
    alert("삭제되었습니다.");
    navigate(-1); // 이전 페이지로 이동
  } catch (err) {
    console.error("삭제 실패", err);
    alert("삭제에 실패했습니다.");
  }
};

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
              <BsThreeDotsVertical size={18} onClick={() => setMenuOpen(!menuOpen)} />
                {menuOpen && (
                  <Menu>
                    <MenuItem onClick={() => alert("수정하기는 아직 구현 안됨!")}>수정하기</MenuItem>
                    <MenuItem onClick={handleDelete}>삭제하기</MenuItem>
                  </Menu>
                )}

            </UserInfo>


              <ImageSlider>
                {images.length > 0 ? (
                  images.map((url, idx) => (
                    <SliderItem
                      key={idx}
                      style={{
                        backgroundImage: `url(${url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ))
                ) : (
                  <SliderItem />
                )}
                <SliderIndicator>
                  {images.map((_, i) => (i === 0 ? "●" : "○")).join(" ")}
                </SliderIndicator>
              </ImageSlider>


              <Title>{tip.title}</Title>
              <BodyText>{tip.content}</BodyText>

              <Divider />

              <LikeBox>
                <FaRegHeart /> 좋아요 {tip.tipLikeCount ?? 0}
              </LikeBox>

              <Divider />

              <CommentList>
                {tip.tipCommentDtoList
                  ?.filter((c) => c.parentId === 0)
                  .map((comment) => (
                    <Comment key={comment.tipCommentId}>
                      <FaUserCircle size={32} color="#ccc" />
                      <CommentContent>
                        <CommentBody>
                          <Nickname>익명 {comment.userId}</Nickname>
                          <CommentText>{comment.reply}</CommentText>
                          <Date>댓글 날짜 없음</Date>
                        </CommentBody>
                        <BsThreeDotsVertical size={18} />
                      </CommentContent>
                    </Comment>
                  ))}

                {tip.tipCommentDtoList
                  ?.filter((c) => c.parentId !== 0)
                  .map((reply) => (
                    <Reply key={reply.tipCommentId}>
                      <FaUserCircle size={28} color="#ccc" />
                      <ReplyContent>
                        <ReplyBody>
                          <Nickname>익명 {reply.userId}</Nickname>
                          <CommentText>{reply.reply}</CommentText>
                          <Date>댓글 날짜 없음</Date>
                        </ReplyBody>
                        <BsThreeDotsVertical size={16} />
                      </ReplyContent>
                    </Reply>
                  ))}
              </CommentList>
            </>
          )}
        </Content>

      </ScrollArea>

      <CommentInput>
        <input placeholder="댓글 입력" />
        <SendButton>
          <BsSend
            size={18}
            style={{ color: "black", backgroundColor: "white", padding: "4px" }}
          />
        </SendButton>
      </CommentInput>
    </Wrapper>
  );
}

// --- styled-components

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

  position: relative; /* ✅ 메뉴 absolute 기준점으로 */
  overflow: visible;   /* ✅ 안 짤리게 */
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  z-index: 10;
`;

const MenuItem = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  &:hover {
    background-color: #f8f8f8;
  }
`;
