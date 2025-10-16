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
  dormitoryBlocks,
  floors,
  rooms,
} from "../../constants/constants.ts";
import { createComplaint, updateComplaint } from "../../apis/complain.ts";
// 수정된 DTO 타입을 import 합니다.
import { ComplaintCreateDto } from "../../types/complain.ts";
import FormField from "../../components/complain/FormField.tsx";
import { Dropdown, DropdownContainer, Input } from "../../styles/complain.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";

export default function ComplainWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { complain } = location.state || {}; // 수정할 민원 데이터

  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // 선택 값 관련 상태
  const [selectedComplainTypeIndex, setSelectedComplainTypeIndex] = useState<
    number | null
  >(null);
  const [selectedDormitoryIndex, setSelectedDormitoryIndex] = useState<
    number | null
  >(null);
  const [selectedDormitoryBlockIndex, setSelectedDormitoryBlockIndex] =
    useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBed, setSelectedBed] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentTime, setIncidentTime] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (complain) {
      setIsEditMode(true);
      setTitle(complain.title);
      setContent(complain.content);
      setPrivacyAgreed(complain.privacyAgreed || false);

      const typeIndex = ComplainType.indexOf(complain.type);
      if (typeIndex !== -1) setSelectedComplainTypeIndex(typeIndex);

      // tip.dormType과 tip.building을 각각 찾아 인덱스 설정
      const dormIndex = complainDormitory.indexOf(complain.dormType);
      if (dormIndex !== -1) setSelectedDormitoryIndex(dormIndex);

      const blockIndex = dormitoryBlocks.indexOf(complain.building);
      if (blockIndex !== -1) setSelectedDormitoryBlockIndex(blockIndex);

      setSelectedFloor(complain.floor || "");
      setSelectedRoom(complain.roomNumber || ""); // roomNumber가 "301호"와 같은 형식이므로 그대로 사용
      setSelectedBed(complain.bedNumber || "");
    }
  }, [complain]);

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
    // 필수 값 검사 로직 업데이트
    if (
      selectedComplainTypeIndex === null ||
      selectedDormitoryIndex === null ||
      selectedDormitoryBlockIndex === null
    ) {
      alert("유형, 기숙사, 동을 모두 선택해주세요.");
      return;
    }
    if (!selectedFloor || !selectedRoom || !selectedBed) {
      alert("층, 호수, 침대를 모두 선택해주세요.");
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
    if (!privacyAgreed) {
      alert("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      // 수정된 DTO 구조에 맞게 데이터 구성
      const dto: ComplaintCreateDto = {
        id: complain?.id || 0,
        title,
        content,
        type: ComplainType[selectedComplainTypeIndex],
        dormType: complainDormitory[selectedDormitoryIndex],
        building: dormitoryBlocks[selectedDormitoryBlockIndex],
        floor: selectedFloor,
        roomNumber: selectedRoom,
        bedNumber: selectedBed,
        status: complain?.status || "접수 대기",
        specificLocation,
        incidentDate: incidentDate || new Date().toISOString().split("T")[0],
        incidentTime:
          incidentTime || new Date().toISOString().split("T")[1].slice(0, 5),
        createdDate: complain?.createdDate || new Date().toISOString(),
        privacyAgreed,
      };

      console.log("전송할 DTO:", dto);

      let res;
      if (isEditMode && complain?.id) {
        res = await updateComplaint(complain.id, dto, images);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <Header title={isEditMode ? "민원 수정" : "민원 접수"} hasBack={true} />

      {isLoading && <LoadingSpinner overlay message="글 쓰는 중..." />}

      <Content>
        <FormField label="유형" required>
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

        <FormField label="동" required>
          <SelectableChipGroup
            Groups={dormitoryBlocks}
            selectedIndex={selectedDormitoryBlockIndex}
            onSelect={setSelectedDormitoryBlockIndex}
          />
        </FormField>

        {/* --- 기존 층/호수/침대 선택 --- */}
        <FormField label="층/호수/침대" required>
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

        {/* ✅ 새로 추가된 필드들 */}
        <FormField label="세부 위치">
          <Input
            placeholder="정확한 위치를 입력해주세요 (예: 화장실 앞, 복도 끝 등)"
            value={specificLocation}
            onChange={(e) => setSpecificLocation(e.target.value)}
          />
        </FormField>

        <FormField label="발생 날짜">
          <Input
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
          />
        </FormField>

        <FormField label="발생 시간">
          <Input
            type="time"
            value={incidentTime}
            onChange={(e) => setIncidentTime(e.target.value)}
          />
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

        {/* 개인정보 동의 UI 추가 */}
        <PrivacyAgreementContainer>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
            />
            <span>개인정보 수집 및 이용에 동의합니다. (필수)</span>
          </CheckboxLabel>
        </PrivacyAgreementContainer>
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

// --- Styled Components ---

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: white;
`;

const Content = styled.div`
  flex: 1;
  padding: 80px 20px 120px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  right: 0;
  max-width: 768px; /* App 레이아웃과 동일한 너비 적용 */
  margin: 0 auto;
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
  flex-shrink: 0;

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
  padding-bottom: 8px;

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

// 개인정보 동의 UI를 위한 스타일 추가
const PrivacyAgreementContainer = styled.div`
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #555;

  input[type="checkbox"] {
    margin-right: 8px;
  }
`;
