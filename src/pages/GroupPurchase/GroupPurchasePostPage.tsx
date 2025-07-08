// src/pages/GroupPurchase/GroupPurchasePostPage.tsx

import styled from "styled-components";
import { BsThreeDotsVertical, BsSend } from "react-icons/bs";
import { FaRegHeart, FaUserCircle } from "react-icons/fa";
import { useEffect } from "react";
import Header from "../../components/common/Header";

export default function GroupPurchasePostPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Wrapper>
      <Header title="공구 게시글" hasBack={true} showAlarm={true} />
      <Divider />

      <Content>
        <Divider />
        <UserInfo>
          <FaUserCircle size={36} color="#ccc" />
          <UserText>
            <Nickname>익명</Nickname>
            <Date>03/01 18:07</Date>
          </UserText>
          <Spacer />
          <CategoryTag>배달</CategoryTag>
          <BsThreeDotsVertical size={18} />
        </UserInfo>

        <ImageSlider>
          <SliderItem />
          <SliderIndicator>● ○ ○</SliderIndicator>
        </ImageSlider>

        <Title>엽떡 먹을 사람..?</Title>

        <MetaInfo>
          <Dday>D-1 02:30</Dday>
          <DividerBar>|</DividerBar>
          <People>
            <img src="/src/assets/chat/human.svg" alt="인원" />3/4
          </People>
        </MetaInfo>

        <Price>24,000원</Price>

        <BodyText>
          엽떡나눠먹을 사람 구함 3인입니다 ㅃㄹ요 배고파
          <br />
          자세한 건 채팅에서 정해요 사이드 및 토핑 가능
          <br />
          <br />
          구매 제품 링크: aaabbbccc
        </BodyText>

        <Divider />

        <LikeActionRow>
          <LikeBox>
            <FaRegHeart /> 좋아요 2
          </LikeBox>
          <JoinButton>참여하기</JoinButton>
        </LikeActionRow>

        <Divider />

        <CommentList>
          <Comment>
            <FaUserCircle size={32} color="#ccc" />
            <CommentContent>
              <CommentBody>
                <Nickname>익명 1</Nickname>
                <CommentText>햄프피햄피 해피</CommentText>
                <Date>오후 6:20</Date>
              </CommentBody>
              <BsThreeDotsVertical size={18} />
            </CommentContent>
          </Comment>

          <Reply>
            <FaUserCircle size={28} color="#ccc" />
            <ReplyContent>
              <ReplyBody>
                <Nickname>익명 1</Nickname>
                <CommentText>
                  아.. 언제 자지,,, 이젠 자야하는데,,, 살려줘
                </CommentText>
                <Date>오후 6:20</Date>
              </ReplyBody>
              <BsThreeDotsVertical size={16} />
            </ReplyContent>
          </Reply>
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
  height: 100vh;           // ✅ 전체 고정
  overflow: hidden;        // ✅ Content만 스크롤 가능하게
  background: #fff;
`;

const Content = styled.div`
  flex: 1;
  padding: 26px 16px 80px;
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

const Date = styled.div`
  font-size: 12px;
  color: gray;
`;

const Spacer = styled.div`
  flex-grow: 1;
`;

const CategoryTag = styled.div`
  background-color: #007bff;
  color: white;
  font-size: 14px;
  padding: 10px 20px;
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

const CommentInput = styled.div`
  display: flex;
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  background: white;
  padding: 8px 16px;
  border-top: 1px solid #eee;

  input {
    flex: 1;
    border: none;
    padding: 10px;
    border-radius: 20px;
    background: #f5f5f5;
    font-size: 14px;
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

const JoinButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;
