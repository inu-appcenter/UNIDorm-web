import { useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header";
import Picker from "react-mobile-picker";

export default function GroupPurchaseWritePage() {
  const [category, setCategory] = useState("배달");

  const [value, setValue] = useState({
    year: "2025년",
    month: "7월",
    day: "20일",
    ampm: "오후",
    hour: "8시",
    minute: "00분",
  });

  const options = {
    year: ["2025년", "2026년", "2027년"],
    month: ["7월", "8월", "9월", "10월"],
    day: ["20일", "21일", "22일", "23일"],
    ampm: ["오전", "오후"],
    hour: ["8시", "9시", "10시", "11시"],
    minute: ["00분", "30분"],
  };

  const handleChange = (selectedValue: string, name: string) => {
    setValue((prev) => ({
        ...prev,
        [name]: selectedValue,
    }));
    };


  return (
    <Wrapper>
      <Header title="공동구매 글쓰기" hasBack={true} />
      <Content>
        <ImageUploadBox>
          <ImagePlaceholder>
            <span>0/10</span>
          </ImagePlaceholder>
        </ImageUploadBox>

        <SectionTitle>제목</SectionTitle>
        <InputField placeholder="글 제목" />

        <SectionTitle>카테고리</SectionTitle>
        <CategoryRow>
          {["배달", "식자재", "생활용품", "기타"].map((item) => (
            <CategoryButton
              key={item}
              selected={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </CategoryButton>
          ))}
        </CategoryRow>

        <SectionTitle>가격</SectionTitle>
        <InputField placeholder="가격을 입력해주세요" />

        <SectionTitle>내용</SectionTitle>
        <TextArea placeholder="내용을 입력해주세요" rows={4} />

        <SectionTitle>구매 링크</SectionTitle>
        <InputField placeholder="구매 링크를 입력해주세요" />

        <SectionTitle>구매 인원</SectionTitle>
        <InputField placeholder="구매 인원을 입력해주세요" />

        <SectionTitle>마감 시간</SectionTitle>
        <PickerWrapper>
          <Picker value={value} options={options} onChange={handleChange} />
        </PickerWrapper>
        <WarningText>
          설정한 마감 시간이 지나면 게시물은 삭제됩니다.
        </WarningText>
      </Content>

      <BottomFixed>
        <SubmitButton>등록하기</SubmitButton>
      </BottomFixed>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8f8f8;
`;

const Content = styled.div`
  padding: 16px;
  padding-bottom: 140px;
`;

const ImageUploadBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  background: #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ImagePlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #777;
`;

const InputField = styled.input`
  width: 92%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #fff;
  margin-bottom: 12px;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 92%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #fff;
  margin-bottom: 12px;
  font-size: 14px;
  resize: none;
`;

const CategoryRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const CategoryButton = styled.button<{ selected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  background-color: ${(props) => (props.selected ? "#007bff" : "#fff")};
  color: ${(props) => (props.selected ? "#fff" : "#000")};
`;

const SectionTitle = styled.div`
  font-weight: 600;
  margin: 16px 0 8px;
`;

const PickerWrapper = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 12px;

  .picker-column {
    flex: 1;
  }
`;

const WarningText = styled.div`
  color: red;
  font-size: 12px;
  margin-bottom: 24px;
`;

const BottomFixed = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.05);
`;

const SubmitButton = styled.button`
  width: 100%;
  background-color: #007bff;
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
`;