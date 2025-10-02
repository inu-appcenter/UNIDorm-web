import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { MdImage, MdClose } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import SquareButton from "../../components/common/SquareButton.tsx";
import Header from "../../components/common/Header.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import {
  beds,
  complainDormitory,
  ComplainType,
  dormitoryBlocks, // '동' 데이터를 위해 다시 import
  floors,
  rooms,
} from "../../constants/constants.ts";
import { createComplaint, updateComplaint } from "../../apis/complain.ts";
import { ComplaintCreateDto } from "../../types/complain.ts";
import FormField from "../../components/complain/FormField.tsx";
import { Dropdown, DropdownContainer, Input } from "../../styles/complain.ts";

export default function ComplainWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tip } = location.state || {}; // 수정할 민원 데이터

  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);

  // 선택 값 관련 상태
  const [selectedComplainTypeIndex, setSelectedComplainTypeIndex] = useState<
    number | null
  >(null);
  const [selectedDormitoryIndex, setSelectedDormitoryIndex] = useState<
    number | null
  >(null);
  // '동' 선택 상태 복원
  const [selectedDormitoryBlockIndex, setSelectedDormitoryBlockIndex] =
    useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBed, setSelectedBed] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  // 페이지 진입 시 스크롤 상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 수정 모드 로직 (기숙사, '동' 파싱 로직 복원)
  useEffect(() => {
    if (tip) {
      setIsEditMode(true);
      setTitle(tip.title);
      setContent(tip.content);

      const typeIndex = ComplainType.indexOf(tip.type);
      if (typeIndex !== -1) setSelectedComplainTypeIndex(typeIndex);

      // tip.dormType ("제1기숙사 A동") 에서 기숙사와 동을 분리하여 인덱스 설정
      const dormMatch = complainDormitory.find((d) => tip.dormType.includes(d));
      if (dormMatch) {
        const dormIndex = complainDormitory.indexOf(dormMatch);
        setSelectedDormitoryIndex(dormIndex);
      }

      const blockMatch = dormitoryBlocks.find((b) => tip.dormType.includes(b));
      if (blockMatch) {
        const blockIndex = dormitoryBlocks.indexOf(blockMatch);
        setSelectedDormitoryBlockIndex(blockIndex);
      }

      setSelectedFloor(tip.floor || "");
      setSelectedRoom(tip.roomNumber || "");
      setSelectedBed(tip.bedNumber || "");
    }
  }, [tip]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setImages((prev) => [...prev, ...fileList].slice(0, 10));
    }
    e.target.value = "";
  };

  const handleImageDelete = (indexToDelete: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleSubmit = async () => {
    // 필수 값 검사 ('동' 선택 검사 복원)
    if (selectedComplainTypeIndex === null) {
      alert("민원 유형을 선택해주세요.");
      return;
    }
    if (selectedDormitoryIndex === null) {
      alert("기숙사를 선택해주세요.");
      return;
    }
    if (selectedDormitoryBlockIndex === null) {
      alert("동을 선택해주세요.");
      return;
    }
    if (!selectedFloor || !selectedRoom || !selectedBed) {
      alert("층/호수/침대번호를 모두 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      // DTO 구성 시 기숙사와 '동' 이름을 조합
      const fullDormName = `${complainDormitory[selectedDormitoryIndex]} ${dormitoryBlocks[selectedDormitoryBlockIndex]}`;

      const dto: ComplaintCreateDto = {
        title,
        content,
        type: ComplainType[selectedComplainTypeIndex],
        dormType: fullDormName, // 예: "제1기숙사 A동"
        roomNumber: `${selectedFloor}${selectedRoom}`,
        bedNumber: selectedBed,
      };

      console.log("전송할 DTO:", dto);

      let res;
      if (isEditMode && tip?.id) {
        res = await updateComplaint(tip.id, dto, images);
        alert("민원이 성공적으로 수정되었습니다!");
      } else {
        res = await createComplaint(dto, images);
        alert("민원이 성공적으로 등록되었습니다!");
      }

      console.log("API 응답:", res.data);
      navigate("/complain", { replace: true });
    } catch (err: any) {
      console.error("API 요청 실패:", err);
      const errorMessage =
        err.response?.data?.message || "처리 중 오류가 발생했습니다.";
      alert(errorMessage);
    }
  };

  return (
    <Wrapper>
      <Header title={isEditMode ? "민원 수정" : "민원 접수"} hasBack={true} />

      <Content>
        <FormField
          label="유형"
          required
          description={"시설 민원은 포털을 통해 신청할 수 있어요!"}
        >
          <SelectableChipGroup
            Groups={ComplainType}
            selectedIndex={selectedComplainTypeIndex}
            onSelect={setSelectedComplainTypeIndex}
          />
        </FormField>

        <FormField label="기숙사" required>
          <SelectableChipGroup
            Groups={complainDormitory}
            selectedIndex={selectedDormitoryIndex}
            onSelect={setSelectedDormitoryIndex}
          />
        </FormField>

        {/* '동' 선택 UI 복원 (필터링 로직 없이 항상 전체 목록 표시) */}
        <FormField label="동" required>
          <SelectableChipGroup
            Groups={dormitoryBlocks}
            selectedIndex={selectedDormitoryBlockIndex}
            onSelect={setSelectedDormitoryBlockIndex}
          />
        </FormField>

        <FormField label="층/호수" required>
          <DropdownContainer>
            <Dropdown
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              hasValue={!!selectedFloor}
            >
              <option value="" disabled>
                층
              </option>
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  {floor}
                </option>
              ))}
            </Dropdown>
            <Dropdown
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              hasValue={!!selectedRoom}
            >
              <option value="" disabled>
                호수
              </option>
              {rooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </Dropdown>
            <Dropdown
              value={selectedBed}
              onChange={(e) => setSelectedBed(e.target.value)}
              hasValue={!!selectedBed}
            >
              <option value="" disabled>
                침대
              </option>
              {beds.map((bed) => (
                <option key={bed} value={bed}>
                  {bed}
                </option>
              ))}
            </Dropdown>
          </DropdownContainer>
        </FormField>

        <FormField label="제목" required>
          <Input
            placeholder="글 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormField>

        <FormField label="내용" required>
          <Textarea
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormField>

        <FormField
          label="이미지"
          description="상황 설명에 도움이 되는 이미지가 있으면 첨부해 주세요."
        >
          <ImageUploadContainer>
            <ImageUploadButton
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              <MdImage size={28} color="#555" />
              <span>{images.length}/10</span>
            </ImageUploadButton>
            <ImagePreviewWrapper>
              {images.map((file, idx) => (
                <ImagePreviewItem key={idx}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`업로드 이미지 ${idx + 1}`}
                  />
                  <DeleteButton onClick={() => handleImageDelete(idx)}>
                    <MdClose size={12} color="white" />
                  </DeleteButton>
                </ImagePreviewItem>
              ))}
            </ImagePreviewWrapper>
          </ImageUploadContainer>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleImageChange}
          />
        </FormField>
      </Content>

      <ButtonWrapper>
        <SquareButton
          text={isEditMode ? "수정하기" : "등록하기"}
          onClick={handleSubmit}
        />
      </ButtonWrapper>
    </Wrapper>
  );
}

// --- Styled Components (이하 동일) ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
`;

const Content = styled.div`
  flex: 1;
  padding: 80px 20px 120px; // 헤더, 버튼 영역 고려하여 패딩 조정
  display: flex;
  flex-direction: column;
  gap: 24px; // 폼 필드 간 간격 조정
  //overflow-y: auto;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #f8f8f8;
  resize: vertical;
  color: #1c1c1e;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  box-sizing: border-box;

  &::placeholder {
    color: #aeaeae;
  }
`;

const ButtonWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px 20px 24px;
  box-sizing: border-box;
  background: white;
  border-top: 1px solid #f0f0f0;
`;

const ImageUploadContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
`;

const ImageUploadButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  cursor: pointer;
  flex-shrink: 0; // 크기 고정

  span {
    font-size: 13px;
    color: #555;
    margin-top: 4px;
  }
`;

const ImagePreviewWrapper = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  flex: 1;
  padding-bottom: 8px; // 스크롤바 공간 확보

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

const ImagePreviewItem = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    object-fit: cover;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;
