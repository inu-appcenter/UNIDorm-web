// TipWritePage.tsx
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import { MdImage } from "react-icons/md";

import { useEffect } from "react";

export default function TipWritePage() {
  const navigate = useNavigate();

  // 스크롤 복구 방지
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Wrapper>
      <TopBar>
        <Left onClick={() => navigate(-1)}>
          <IoCloseSharp size={24} />
        </Left>
        <Title>기숙사 꿀팁쓰기</Title>
        <Right>임시저장</Right>
      </TopBar>

      <Content>
        <ImageBox>
            <MdImage size={36} color="#888" />
            <span>0/10</span>
        </ImageBox>

        <Label>제목</Label>
        <Input placeholder="글 제목" />

        <Label>내용</Label>
        <Textarea placeholder="내용을 입력해주세요" />
      </Content>

      <SubmitButton>등록하기</SubmitButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fafafa;
`;

const TopBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  font-weight: bold;
`;

const Left = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

const Title = styled.h3`
  font-size: 16px;
`;

const Right = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: gray;
`;

const Content = styled.div`
  flex: 1;
  padding: 90px 20px 120px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

const ImageBox = styled.div`
  width: 100%;
  height: 80px;
  background: #eee;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #555;

  img {
    width: 24px;
    height: 24px;
  }
`;

const Label = styled.label`
  font-weight: 600;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: #f5f5f5;
`;

const Textarea = styled.textarea`
  min-height: 200px;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: #f5f5f5;
  resize: none;
`;

const SubmitButton = styled.button`
  position: fixed;
  bottom: 90px; /* ← BottomBar 피해서 위로 띄움 */
  left: 16px;
  right: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  z-index: 1001;
`;


