import { useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header";
import { MdImage } from "react-icons/md";

export default function GroupPurchaseWritePage() {
  const [category, setCategory] = useState("배달");

  const [deadline, setDeadline] = useState({
    year: "2025년",
    month: "7월",
    day: "1일",
    ampm: "오후",
    hour: "1시",
    minute: "00분",
  });

  const [dayOptions, setDayOptions] = useState<string[]>([]);

  // 해당 월의 마지막 일 구하기
  const getLastDay = (yearStr: string, monthStr: string) => {
    const year = parseInt(yearStr.replace("년", ""));
    const month = parseInt(monthStr.replace("월", ""));
    return new Date(year, month, 0).getDate();
  };

  // 연도나 월이 바뀌면 day 옵션 다시 생성
  useEffect(() => {
    const lastDay = getLastDay(deadline.year, deadline.month);
    const days = Array.from({ length: lastDay }, (_, i) => `${i + 1}일`);
    setDayOptions(days);

    if (!days.includes(deadline.day)) {
      setDeadline((prev) => ({ ...prev, day: days[0] }));
    }
  }, [deadline.year, deadline.month]);

  const handleTempSave = () => {
    alert("임시 저장되었습니다.");
  };
  return (
    <Wrapper>
      <Header title="공동구매 글쓰기" hasBack={true}  rightContent={<TempSaveButton onClick={handleTempSave}>임시저장</TempSaveButton>} />
      <Content>
        <ImageBox style={{marginTop: 80}}>
          <MdImage size={36} color="#888" />
          <span>0/10</span>
        </ImageBox>

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
        <DeadlineRow>
          <Select value={deadline.year} onChange={(e) => setDeadline({ ...deadline, year: e.target.value })}>
            <option>2025년</option>
            <option>2026년</option>
            <option>2027년</option>
          </Select>
          <Select value={deadline.month} onChange={(e) => setDeadline({ ...deadline, month: e.target.value })}>
            <option>1월</option>
            <option>2월</option>
            <option>3월</option>
            <option>4월</option>
            <option>5월</option>
            <option>6월</option>
            <option>7월</option>
            <option>8월</option>
            <option>9월</option>
            <option>10월</option>
            <option>11월</option>
            <option>12월</option>
          </Select>
          <Select value={deadline.day} onChange={(e) => setDeadline({ ...deadline, day: e.target.value })}>
            {dayOptions.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </DeadlineRow>

        <DeadlineRow>
          <Select value={deadline.ampm} onChange={(e) => setDeadline({ ...deadline, ampm: e.target.value })}>
            <option>오전</option>
            <option>오후</option>
          </Select>
          <Select value={deadline.hour} onChange={(e) => setDeadline({ ...deadline, hour: e.target.value })}>
            <option>1시</option>
            <option>2시</option>
            <option>3시</option>
            <option>4시</option>
            <option>5시</option>
            <option>6시</option>
            <option>7시</option>
            <option>8시</option>
            <option>9시</option>
            <option>10시</option>
            <option>11시</option>
            <option>12시</option>
          </Select>
          <Select value={deadline.minute} onChange={(e) => setDeadline({ ...deadline, minute: e.target.value })}>
            <option>00분</option>
            <option>30분</option>
          </Select>
        </DeadlineRow>

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

const ImageBox = styled.div`
  width: 100px;
  height: 100px;
  margin: 32px 0 16px 0;
  background: #eee;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #555;
  font-size: 13px;
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

const DeadlineRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const Select = styled.select`
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #fff;
  background: white;
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

const TempSaveButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;