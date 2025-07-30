// TipDetailPage.tsx

import styled from "styled-components";
import { BsThreeDotsVertical, BsSend } from "react-icons/bs";
import { FaRegHeart, FaUserCircle } from "react-icons/fa";
import { useEffect } from "react";
import Header from "../../components/common/Header";

export default function TipDetailPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Wrapper>
      <Header title="기숙사 꿀팁" hasBack={true} showAlarm={true} />
      <ScrollArea>
        <Content>
          <UserInfo>
            <FaUserCircle size={36} color="#ccc" />
            <UserText>
              <Nickname>익명</Nickname>
              <Date>03/01 18:07</Date>
            </UserText>
            <Spacer />
            <BsThreeDotsVertical size={18} />
          </UserInfo>

          <ImageSlider>
            <SliderItem />
            <SliderIndicator>● ○ ○</SliderIndicator>
          </ImageSlider>

          <Title>기숙사 꿀팁</Title>
          <BodyText>기숙사 꿀팁 내용이 여기에 들어갑니다...</BodyText>

          <Divider />

          <LikeBox>
            <FaRegHeart /> 좋아요 2
          </LikeBox>

          <Divider />

          <CommentList>
            <Comment>
              <FaUserCircle size={32} color="#ccc" />
              <CommentContent>
                <CommentBody>
                  <Nickname>익명 1</Nickname>
                  <CommentText>진짜 꿀팁이네요 감사합니다!</CommentText>
                  <Date>오후 6:20</Date>
                </CommentBody>
                <BsThreeDotsVertical size={18} />
              </CommentContent>
            </Comment>

            <Reply>
              <FaUserCircle size={28} color="#ccc" />
              <ReplyContent>
                <ReplyBody>
                  <Nickname>익명 2</Nickname>
                  <CommentText>헐 대박 꿀팁...!</CommentText>
                  <Date>오후 6:25</Date>
                </ReplyBody>
                <BsThreeDotsVertical size={16} />
              </ReplyContent>
            </Reply>
          </CommentList>
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


const Wrapper = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px 100px; /* 하단 댓글창 공간 확보 */
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
