import styled from "styled-components";
import { BsThreeDotsVertical, BsSend } from "react-icons/bs";
import { FaRegHeart, FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import { GroupOrderDetail, GroupOrderImage } from "../../types/grouporder.ts";
import {
  cancelGroupPurchaseCompletion,
  completeGroupPurchase,
  getGroupPurchaseDetail,
  getGroupPurchaseImages,
  likeGroupPurchase,
  unlikeGroupPurchase,
} from "../../apis/groupPurchase.ts";
import { useParams } from "react-router-dom";
import RoundSquareBlueButton from "../../components/button/RoundSquareBlueButton.tsx";

export default function GroupPurchasePostPage() {
  const { id } = useParams<{ id: string }>(); // URL에서 id 가져오기
  const groupOrderId = Number(id); // string → number 변환

  const [detail, setDetail] = useState<GroupOrderDetail | null>(null);
  const [images, setImages] = useState<GroupOrderImage[]>([]);
  const [liked, setLiked] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const detailData = await getGroupPurchaseDetail(groupOrderId);
        setDetail(detailData);
        setLiked(detailData.checkLikeCurrentUser);
        console.log(detailData);

        const imageData = await getGroupPurchaseImages(groupOrderId);
        setImages(imageData);
        console.log(imageData);
      } catch (error) {
        console.error("게시글 조회 실패:", error);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [groupOrderId]);

  // 👍 좋아요 토글 핸들러
  const handleLikeClick = async () => {
    if (!detail) return;

    try {
      let updatedLikeCount: number;
      if (liked) {
        updatedLikeCount = await unlikeGroupPurchase(detail.id);
      } else {
        updatedLikeCount = await likeGroupPurchase(detail.id);
      }

      setDetail({ ...detail, likeCount: updatedLikeCount });
      setLiked(!liked);
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  // ✅ 모집 완료 토글 핸들러
  const handleCompletionToggle = async () => {
    if (!detail) return;

    try {
      if (detail.recruitmentComplete) {
        await cancelGroupPurchaseCompletion(detail.id);
      } else {
        await completeGroupPurchase(detail.id);
      }

      setDetail({
        ...detail,
        recruitmentComplete: !detail.recruitmentComplete,
      });
    } catch (error) {
      console.error("모집 완료 처리 실패:", error);
    }
  };

  if (!detail) return <div>로딩중...</div>;

  return (
    <Wrapper>
      <Header title="공구 게시글" hasBack={true} showAlarm={true} />
      <Content>
        <UserInfo>
          <FaUserCircle size={36} color="#ccc" />
          <UserText>
            <Nickname>익명</Nickname>
            {/*<Date>{new Date(detail.createDate).toLocaleDateString()} {new Date(detail.createDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Date>*/}
          </UserText>
          <Spacer />
          <CategoryTag>{detail.groupOrderType}</CategoryTag>
          <BsThreeDotsVertical size={18} />
        </UserInfo>

        {images.length > 0 && (
          <ImageSlider>
            {images.map((img, idx) => (
              <SliderItem
                key={idx}
                style={{ backgroundImage: `url(${img.imageUrl})` }}
              />
            ))}
            <SliderIndicator>
              {`●`.repeat(images.length) + ` ○`.repeat(3 - images.length)}
            </SliderIndicator>
          </ImageSlider>
        )}

        <Title>{detail.title}</Title>

        <MetaInfo>
          <Dday>
            {/* 마감일까지 남은 시간 계산 */}
            {(() => {
              const deadlineDate = new Date(detail.deadline);
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
            <img src="/src/assets/chat/human.svg" alt="인원" />
            조회수 {detail.viewCount}
          </People>
        </MetaInfo>

        <Price>{detail.price.toLocaleString()}원</Price>

        <BodyText>
          {detail.description}
          <br />
          <br />
          구매 제품 링크: {detail.link}
        </BodyText>

        <Divider />

        <LikeActionRow>
          <LikeBox onClick={handleLikeClick}>
            <FaRegHeart style={{ color: liked ? "#e25555" : "#bbb" }} /> 좋아요{" "}
            {detail.likeCount}
          </LikeBox>
          <RoundSquareBlueButton btnName={"오픈 채팅방 참여하기"} />
          {/*<JoinButton>참여하기</JoinButton>*/}
        </LikeActionRow>

        <Divider />

        {/* 댓글 리스트 */}
        <CommentList>
          {detail.groupOrderCommentDtoList.map((comment) => (
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
  width: calc(100% + 32px);
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
