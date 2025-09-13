import styled from "styled-components";
import { BsThreeDotsVertical, BsSend } from "react-icons/bs";
import { FaRegHeart, FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import { GroupOrderDetail, GroupOrderImage } from "../../types/grouporder.ts";
import {
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

export default function GroupPurchasePostPage() {
  const { id } = useParams<{ id: string }>(); // URL에서 id 가져오기
  const groupOrderId = Number(id); // string → number 변환
  const navigate = useNavigate();

  const [post, setPost] = useState<GroupOrderDetail | null>(null);
  const [images, setImages] = useState<GroupOrderImage[]>([]);
  const [liked, setLiked] = useState<boolean>(false);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
  }, [groupOrderId]);

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
      <Header title="공구 게시글" hasBack={true} menuItems={menuItems} />
      <Content>
        <UserInfo>
          {post.authorImagePath ? (
            <img
              src={post.authorImagePath}
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
          )}{" "}
          <UserText>
            <Nickname>{post.username}</Nickname>
            {/*<Date>{new Date(detail.createDate).toLocaleDateString()} {new Date(detail.createDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Date>*/}
          </UserText>
          <Spacer />
          <CategoryTag>{post.groupOrderType}</CategoryTag>
          {/*<BsThreeDotsVertical size={18} />*/}
        </UserInfo>

        {images.length > 0 && (
          <ImageSlider {...handlers} style={{ touchAction: "pan-y" }}>
            {images.map((img, idx) => (
              <SliderItem
                key={idx}
                style={{ backgroundImage: `url(${img.fileName})` }}
                onClick={() => {
                  setPreviewUrl(images[currentImage].fileName);
                  setShowInfoModal(true);
                }}
              />
            ))}
            <SliderIndicator>
              {`●`.repeat(images.length) + ` ○`.repeat(3 - images.length)}
            </SliderIndicator>
          </ImageSlider>
        )}

        <Title>{post.title}</Title>

        <MetaInfo>
          <Dday>
            {/* 마감일까지 남은 시간 계산 */}
            {(() => {
              const deadlineDate = new Date(post.deadline);
              const now = new Date();
              const diff = deadlineDate.getTime() - now.getTime();
              const d = Math.floor(diff / (1000 * 60 * 60 * 24));
              const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
              const m = Math.floor((diff / (1000 * 60)) % 60);
              return `D-${d} ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
            })()}
          </Dday>
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
          구매 제품 링크: {post.link}
        </BodyText>

        <Divider />

        <LikeActionRow>
          <LikeBox onClick={handleLikeClick}>
            <FaRegHeart style={{ color: liked ? "#e25555" : "#bbb" }} /> 좋아요{" "}
            {post.likeCount}
          </LikeBox>
          <RoundSquareBlueButton
            btnName={"오픈 채팅방 참여하기"}
            onClick={() => {
              window.open(post.openChatLink, "_blank");
            }}
          />
          {/*<JoinButton>참여하기</JoinButton>*/}
        </LikeActionRow>

        <Divider />

        {/* 댓글 리스트 */}
        <CommentList>
          {post.groupOrderCommentDtoList.map((comment) => (
            <Comment key={comment.groupOrderCommentId}>
              <FaUserCircle size={32} color="#ccc" />
              <CommentContent>
                <CommentBody>
                  <Nickname>익명</Nickname>
                  <CommentText>{comment.reply}</CommentText>
                  {/*<Date>{new Date(comment.createDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Date>*/}
                </CommentBody>
                <BsThreeDotsVertical size={18} />
              </CommentContent>
            </Comment>
          ))}
        </CommentList>
      </Content>

      <CommentInput>
        <input placeholder="댓글 입력" />
        <SendButton>
          <BsSend
            size={18}
            style={{
              color: "black",
              backgroundColor: "white",
              padding: "4px",
            }}
          />
        </SendButton>
      </CommentInput>

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
  //padding-top: 60px;
  //height: 100vh;           // ✅ 전체 고정
  //overflow: hidden;        // ✅ Content만 스크롤 가능하게
  //background: #fff;
`;

const Content = styled.div`
  flex: 1;
  //padding: 26px 16px 80px;
  overflow-y: auto;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const UserText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Nickname = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

// const Date = styled.div`
//   font-size: 12px;
//   color: gray;
// `;

const Spacer = styled.div`
  flex-grow: 1;
`;

const CategoryTag = styled.div`
  background-color: #007bff;
  color: white;
  font-size: 14px;
  padding: 4px 16px;
  border-radius: 20px;
  margin-right: 8px;
`;

const ImageSlider = styled.div`
  width: 100%;
  margin-left: -16px;
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

// const Reply = styled.div`
//   display: flex;
//   gap: 10px;
//   background: #f0f0f0;
//   padding: 12px;
//   border-radius: 8px;
//   margin-left: 36px;
// `;
//
// const ReplyBody = styled(CommentBody)`
//   gap: 2px;
// `;
//
// const ReplyContent = styled.div`
//   flex: 1;
//   display: flex;
//   justify-content: space-between;
// `;

const CommentInput = styled.div`
  display: flex;
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  //background: white;
  padding: 8px 16px;
  border-top: 1px solid #eee;

  input {
    flex: 1;
    border: none;
    padding: 10px;
    border-radius: 20px;
    background: #f5f5f5;
    font-size: 16px;
    outline: none;
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #007bff;
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
