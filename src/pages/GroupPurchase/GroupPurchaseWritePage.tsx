import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header";
import { MdImage } from "react-icons/md";
import tokenInstance from "../../apis/tokenInstance";

type ImgPreview = { id: string; file: File; url: string };

export default function GroupPurchaseWritePage() {
  const [category, setCategory] = useState("배달");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [content, setContent] = useState("");
  const [buyLink, setBuyLink] = useState("");
  const [maxPeople, setMaxPeople] = useState<number | "">("");

  const [deadline, setDeadline] = useState({
    year: "2025년",
    month: "7월",
    day: "1일",
    ampm: "오후",
    hour: "1시",
    minute: "00분",
  });

  const [dayOptions, setDayOptions] = useState<string[]>([]);
  const [images, setImages] = useState<ImgPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const leftCount = useMemo(() => 10 - images.length, [images.length]);

  // 해당 월의 마지막 일 구하기
  const getLastDay = (yearStr: string, monthStr: string) => {
    const year = parseInt(yearStr.replace("년", ""));
    const month = parseInt(monthStr.replace("월", ""));
    return new Date(year, month, 0).getDate();
  };

  // 연/월 변경 시 일 옵션 갱신
  useEffect(() => {
    const lastDay = getLastDay(deadline.year, deadline.month);
    const days = Array.from({ length: lastDay }, (_, i) => `${i + 1}일`);
    setDayOptions(days);
    if (!days.includes(deadline.day)) {
      setDeadline((prev) => ({ ...prev, day: days[0] }));
    }
  }, [deadline.year, deadline.month]);

  // 파일 선택 트리거
  const onPickImages = () => fileInputRef.current?.click();

  // 파일 선택 처리
  const onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);

    // 이미지 타입만, 최대 10장
    const valid = arr.filter((f) => f.type.startsWith("image/")).slice(0, leftCount);
    if (!valid.length) return;

    const toAdd: ImgPreview[] = valid.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...toAdd]);
  };

  // 이미지 제거
  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  // 드래그앤드롭
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFilesSelected(e.dataTransfer.files);
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  // 마감 시간 ISO 문자열 생성
  const buildDeadlineISO = () => {
    const y = parseInt(deadline.year.replace("년", ""), 10);
    const m = parseInt(deadline.month.replace("월", ""), 10) - 1; // JS는 0부터
    const d = parseInt(deadline.day.replace("일", ""), 10);
    let h = parseInt(deadline.hour.replace("시", ""), 10);
    const isPM = deadline.ampm === "오후";
    if (h === 12) h = isPM ? 12 : 0; else if (isPM) h += 12;
    const min = parseInt(deadline.minute.replace("분", ""), 10);
    const dt = new Date(y, m, d, h, min, 0);
    return dt.toISOString();
  };

  // 등록하기
  const onSubmit = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (!price && price !== 0) return alert("가격을 입력하세요.");
    if (Number.isNaN(Number(price))) return alert("가격을 숫자로 입력하세요.");
    if (!maxPeople) return alert("구매 인원을 입력하세요.");
    if (Number.isNaN(Number(maxPeople))) return alert("구매 인원을 숫자로 입력하세요.");

    const form = new FormData();

    // 🔑 서버 필드명 맞춤 (list 스키마 기준)
    form.append("title", title.trim());
    form.append("type", category);               // 카테고리: type
    form.append("price", String(price));
    form.append("maxPeople", String(maxPeople));
    form.append("deadline", buildDeadlineISO());

    // 선택 텍스트 필드 (서버에서 받으면 유지)
    if (content.trim()) form.append("content", content.trim());
    if (buyLink.trim()) form.append("link", buyLink.trim());

    // 다중 이미지
    // ⚠️ 서버가 files[]/photos[] 등 다른 키를 요구하면 "images"만 바꿔주면 됨
    images.forEach((img) => form.append("images", img.file));

    try {
      await tokenInstance.post("/group-orders", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("등록되었습니다.");
      // TODO: 성공 시 이동
      // navigate("/groupPurchase");
    } catch (e: any) {
      console.log("공동구매 등록 실패", {
        status: e?.response?.status,
        data: e?.response?.data,
      });
      alert("등록 실패: " + (e?.response?.data?.message ?? "잠시 후 다시 시도해주세요."));
    }
  };

  const handleTempSave = () => {
    alert("임시 저장되었습니다.");
  };

  return (
    <Wrapper>
      <Header
        title="공동구매 글쓰기"
        hasBack={true}
        rightContent={<TempSaveButton onClick={handleTempSave}>임시저장</TempSaveButton>}
      />

      <Content>
        {/* 이미지 업로드 영역 */}
        <ImageArea>
          <ImageTopRow>
            <span>사진</span>
            <Count>{images.length}/10</Count>
          </ImageTopRow>

          <Grid onDrop={onDrop} onDragOver={onDragOver}>
            {images.map((img) => (
              <Thumb key={img.id}>
                <img src={img.url} alt="preview" />
                <Remove onClick={() => removeImage(img.id)}>×</Remove>
              </Thumb>
            ))}
            {leftCount > 0 && (
              <AddCard onClick={onPickImages}>
                <MdImage size={36} color="#888" />
                <span>추가</span>
              </AddCard>
            )}
          </Grid>

          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFilesSelected(e.target.files)}
          />
        </ImageArea>

        {/* 본문 입력 */}
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
          inputMode="numeric"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value ? Number(e.target.value.replace(/\D/g, "")) : "")
          }
        />

        <SectionTitle>내용</SectionTitle>
        <TextArea
          placeholder="내용을 입력해주세요"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <SectionTitle>구매 링크</SectionTitle>
        <InputField
          placeholder="구매 링크를 입력해주세요"
          value={buyLink}
          onChange={(e) => setBuyLink(e.target.value)}
        />

        <SectionTitle>구매 인원</SectionTitle>
        <InputField
          placeholder="구매 인원을 숫자로 입력"
          inputMode="numeric"
          value={maxPeople}
          onChange={(e) =>
            setMaxPeople(e.target.value ? Number(e.target.value.replace(/\D/g, "")) : "")
          }
        />

        <SectionTitle>마감 시간</SectionTitle>
        <DeadlineRow>
          <Select value={deadline.year} onChange={(e) => setDeadline({ ...deadline, year: e.target.value })}>
            <option>2025년</option>
            <option>2026년</option>
            <option>2027년</option>
          </Select>
          <Select value={deadline.month} onChange={(e) => setDeadline({ ...deadline, month: e.target.value })}>
            {Array.from({ length: 12 }, (_, i) => `${i + 1}월`).map((m) => (
              <option key={m}>{m}</option>
            ))}
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
            {Array.from({ length: 12 }, (_, i) => `${i + 1}시`).map((h) => (
              <option key={h}>{h}</option>
            ))}
          </Select>
          <Select value={deadline.minute} onChange={(e) => setDeadline({ ...deadline, minute: e.target.value })}>
            <option>00분</option>
            <option>30분</option>
          </Select>
        </DeadlineRow>

        <WarningText>설정한 마감 시간이 지나면 게시물은 삭제됩니다.</WarningText>
      </Content>

      <BottomFixed>
        <SubmitButton onClick={onSubmit}>등록하기</SubmitButton>
      </BottomFixed>
    </Wrapper>
  );
}

/* ====== styles ====== */
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

const ImageArea = styled.div`
  margin-top: 80px;
`;

const ImageTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Count = styled.span`
  color: #888;
  font-weight: 500;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const Thumb = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: #eee;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Remove = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  cursor: pointer;
`;

const AddCard = styled.button`
  border: 1px dashed #ccc;
  background: #fafafa;
  border-radius: 10px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1/1;
  cursor: pointer;
  font-size: 13px;
  color: #666;
`;

const HiddenFileInput = styled.input`
  display: none;
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
