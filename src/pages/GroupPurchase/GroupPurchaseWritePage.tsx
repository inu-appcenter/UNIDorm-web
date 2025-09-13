import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header";
import { MdImage } from "react-icons/md";
import { CreateGroupOrderRequest } from "../../types/grouporder.ts";
import {
  createGroupPurchase,
  updateGroupPurchase,
} from "../../apis/groupPurchase.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { useLocation } from "react-router-dom";

export default function GroupPurchaseWritePage() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 수정 모드 관련 상태
  const [isEditMode, setIsEditMode] = useState(false);

  const location = useLocation();
  const { post } = location.state || {};

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setDescription(post.description);
      setPrice(post.price?.toString() || "");
      setPurchaseLink(post.link || "");
      setOpenchatLink(post.openChatLink || "");
      setMaxPeople(post.maxPeople?.toString() || "");
      setCategory(post.groupOrderType || "배달");
      setIsEditMode(true);
    }
  }, [post]);

  const [category, setCategory] = useState("배달");
  const [deadline, setDeadline] = useState(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // D+1

    const year = `${tomorrow.getFullYear()}년`;
    const month = `${tomorrow.getMonth() + 1}월`; // 0~11 이므로 +1
    const day = `${tomorrow.getDate()}일`;

    let hour = tomorrow.getHours();
    const ampm = hour >= 12 ? "오후" : "오전";
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    const minute = `${tomorrow.getMinutes().toString().padStart(2, "0")}분`;
    const hourStr = `${hour}시`;

    return { year, month, day, ampm, hour: hourStr, minute };
  });

  const [dayOptions, setDayOptions] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [purchaseLink, setPurchaseLink] = useState("");
  const [openchatLink, setOpenchatLink] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);

  // 해당 월의 마지막 일 구하기
  const getLastDay = (yearStr: string, monthStr: string) => {
    const year = parseInt(yearStr.replace("년", ""));
    const month = parseInt(monthStr.replace("월", ""));
    return new Date(year, month, 0).getDate();
  };

  useEffect(() => {
    const lastDay = getLastDay(deadline.year, deadline.month);
    const days = Array.from({ length: lastDay }, (_, i) => `${i + 1}일`);
    setDayOptions(days);

    if (!days.includes(deadline.day)) {
      setDeadline((prev) => ({ ...prev, day: days[0] }));
    }
  }, [deadline.year, deadline.month]);

  // 마감 시간 문자열 생성: "YYYY-MM-DDTHH:mm:00"
  const getDeadlineString = () => {
    const year = deadline.year.replace("년", "");
    const month = deadline.month.replace("월", "").padStart(2, "0");
    const day = deadline.day.replace("일", "").padStart(2, "0");
    let hour = parseInt(deadline.hour.replace("시", ""));
    if (deadline.ampm === "오후" && hour !== 12) hour += 12;
    if (deadline.ampm === "오전" && hour === 12) hour = 0;
    const minute = deadline.minute.replace("분", "").padStart(2, "0");
    return `${year}-${month}-${day}T${hour.toString().padStart(2, "0")}:${minute}:00`;
  };

  const handleSubmit = async () => {
    // 필수 입력 체크
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!price.trim() || isNaN(Number(price)))
      return alert("가격을 올바르게 입력해주세요.");
    if (!description.trim()) return alert("내용을 입력해주세요.");
    if (!purchaseLink.trim()) return alert("구매 링크를 입력해주세요.");
    if (!maxPeople.trim() || isNaN(Number(maxPeople)))
      return alert("구매 인원을 올바르게 입력해주세요.");

    const requestDto: CreateGroupOrderRequest = {
      title,
      deadline: getDeadlineString(),
      groupOrderType: category,
      price: Number(price),
      maxPeople: Number(maxPeople),
      description,
      link: purchaseLink,
      openChatLink: openchatLink,
    };

    try {
      if (isEditMode) {
        await updateGroupPurchase(post.id, requestDto, images);
        alert("게시글이 수정되었습니다.");
      } else {
        await createGroupPurchase(requestDto, images);
        alert("게시글이 등록되었습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("게시글 등록/수정 중 오류가 발생했습니다.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleTempSave = () => {
    alert("임시 저장되었습니다.");
  };

  return (
    <Wrapper>
      {isEditMode && <></>}
      <Header
        title="공동구매 글쓰기"
        hasBack={true}
        rightContent={
          <TempSaveButton onClick={handleTempSave}>임시저장</TempSaveButton>
        }
      />

      <SectionTitle>제목</SectionTitle>
      <InputField
        placeholder="글 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

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
      <InputField
        placeholder="가격을 입력해주세요"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <SectionTitle>내용</SectionTitle>
      <TextArea
        placeholder="내용을 입력해주세요"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <SectionTitle>구매 링크</SectionTitle>
      <InputField
        placeholder="구매 링크를 입력해주세요"
        value={purchaseLink}
        onChange={(e) => setPurchaseLink(e.target.value)}
      />
      <SectionTitle>오픈채팅방 링크</SectionTitle>
      <InputField
        placeholder="오픈채팅방 링크를 입력해주세요"
        value={openchatLink}
        onChange={(e) => setOpenchatLink(e.target.value)}
      />

      <SectionTitle>구매 인원</SectionTitle>
      <InputField
        placeholder="구매 인원을 입력해주세요"
        value={maxPeople}
        onChange={(e) => setMaxPeople(e.target.value)}
      />

      <SectionTitle>마감 시간</SectionTitle>
      <DeadlineRow>
        <Select
          value={deadline.year}
          onChange={(e) => setDeadline({ ...deadline, year: e.target.value })}
        >
          <option>2025년</option>
          <option>2026년</option>
          <option>2027년</option>
        </Select>
        <Select
          value={deadline.month}
          onChange={(e) => setDeadline({ ...deadline, month: e.target.value })}
        >
          {Array.from({ length: 12 }, (_, i) => `${i + 1}월`).map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Select>
        <Select
          value={deadline.day}
          onChange={(e) => setDeadline({ ...deadline, day: e.target.value })}
        >
          {dayOptions.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </Select>
      </DeadlineRow>

      <DeadlineRow>
        <Select
          value={deadline.ampm}
          onChange={(e) => setDeadline({ ...deadline, ampm: e.target.value })}
        >
          <option>오전</option>
          <option>오후</option>
        </Select>
        <Select
          value={deadline.hour}
          onChange={(e) => setDeadline({ ...deadline, hour: e.target.value })}
        >
          {Array.from({ length: 12 }, (_, i) => `${i + 1}시`).map((h) => (
            <option key={h}>{h}</option>
          ))}
        </Select>
        <Select
          value={deadline.minute}
          onChange={(e) => setDeadline({ ...deadline, minute: e.target.value })}
        >
          <option>00분</option>
          <option>30분</option>
        </Select>
      </DeadlineRow>

      <WarningText>설정한 마감 시간이 지나면 게시물은 삭제됩니다.</WarningText>

      <SectionTitle>이미지</SectionTitle>
      <ImageBox onClick={() => inputRef.current?.click()}>
        <MdImage size={36} color="#888" />
        <span>{images.length}/10</span>
        {/* 여러 장 미리보기 */}
        {images.map((file, idx) => (
          <img
            key={idx}
            src={URL.createObjectURL(file)}
            alt={`업로드 이미지${idx + 1}`}
            style={{ width: 36, height: 36, borderRadius: 8, marginLeft: 4 }}
          />
        ))}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleImageChange}
        />
      </ImageBox>

      {isLoggedIn && (
        <BottomFixed>
          <SubmitButton onClick={handleSubmit}>
            {post.id ? "수정하기" : "등록하기"}
          </SubmitButton>
        </BottomFixed>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  //min-height: 100vh;
  //background: #f8f8f8;
  box-sizing: border-box;
  padding: 60px 16px;
  padding-bottom: 100px;
`;

const ImageBox = styled.div`
  width: 100px;
  height: 100px;
  //margin: 32px 0 16px 0;
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
  background: rgba(244, 244, 244, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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
