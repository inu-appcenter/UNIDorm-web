import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SquareButton from "../../components/common/SquareButton.tsx";
import Header from "../../components/common/Header/Header.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import {
  complainDormitory,
  ComplainType,
  dormitoryBlocks,
  dormStructure,
} from "../../constants/constants.ts";
import { createComplaint, updateComplaint } from "../../apis/complain.ts";
import { ComplaintCreateDto } from "../../types/complain.ts";
import FormField from "../../components/complain/FormField.tsx";
import { Dropdown, DropdownContainer, Input } from "../../styles/common.ts";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useFileHandler } from "../../hooks/useFileHandler.ts";
import FileUploader from "../../components/common/FileUploader.tsx";

// ---  옵션 배열 생성 헬퍼 함수 ---
const generateOptions = (min: number, max: number, suffix: string) => {
  return Array.from({ length: max - min + 1 }, (_, i) => `${min + i}${suffix}`);
};

export default function ComplainWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { complain, complainImages } = location.state || {}; // 수정할 민원 데이터

  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // 이미지 상태 및 핸들러 커스텀 훅
  const { files, addFiles, deleteFile, isFileLoading } = useFileHandler({
    initialFiles: complainImages,
  });

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

  // ---  동적 옵션 목록을 위한 상태 ---
  const [floorOptions, setFloorOptions] = useState<string[]>([]);
  const [roomOptions, setRoomOptions] = useState<string[]>([]);
  const [bedOptions, setBedOptions] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ---  기숙사/동 선택 시 옵션 동적 생성 ---
  useEffect(() => {
    const dormName = complainDormitory[selectedDormitoryIndex as number];
    const blockName = dormitoryBlocks[selectedDormitoryBlockIndex as number];

    let floors: string[] = [];
    let rooms: string[] = [];
    let beds: string[] = [];

    // @ts-ignore
    if (dormName && blockName && dormStructure[dormName]?.[blockName]) {
      // @ts-ignore
      const rules = dormStructure[dormName][blockName];
      floors = generateOptions(rules.floors.min, rules.floors.max, "층");
      rooms = generateOptions(1, rules.rooms, "호");
      beds = generateOptions(1, rules.beds, "번");
    }

    setFloorOptions(floors);
    setRoomOptions(rooms);
    setBedOptions(beds);

    // 옵션이 변경되었을 때, 기존 선택 값이 새 옵션에 없으면 초기화
    if (!floors.includes(selectedFloor)) {
      setSelectedFloor("");
    }
    if (!rooms.includes(selectedRoom)) {
      setSelectedRoom("");
    }
    if (!beds.includes(selectedBed)) {
      setSelectedBed("");
    }
  }, [
    selectedDormitoryIndex,
    selectedDormitoryBlockIndex,
    selectedFloor,
    selectedRoom,
    selectedBed,
  ]);

  useEffect(() => {
    if (complain) {
      setIsEditMode(true);
      setTitle(complain.title);
      setContent(complain.content);
      setPrivacyAgreed(complain.privacyAgreed || false);

      const typeIndex = ComplainType.indexOf(complain.type);
      if (typeIndex !== -1) setSelectedComplainTypeIndex(typeIndex);

      const dormIndex = complainDormitory.indexOf(complain.dormType);
      if (dormIndex !== -1) setSelectedDormitoryIndex(dormIndex);

      const blockIndex = dormitoryBlocks.indexOf(complain.building);
      if (blockIndex !== -1) setSelectedDormitoryBlockIndex(blockIndex);

      // (수정 모드 진입 시)
      // 이 useEffect가 위의 동적 옵션 생성 useEffect보다 먼저 실행되거나 동시에 실행되더라도,
      // state 설정 후 re-render가 발생하면 동적 옵션 생성 useEffect가 올바른 옵션을 설정하고
      // 아래 값들은 유효성 검사를 통과하여 유지됩니다.
      setSelectedFloor(complain.floor || "");
      setSelectedRoom(complain.roomNumber || "");
      setSelectedBed(complain.bedNumber || "");
      setSpecificLocation(complain.specificLocation || "");
      setIncidentDate(complain.incidentDate || "");
      setIncidentTime(complain.incidentTime || "");
    }
  }, [complain]);

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

    if (!specificLocation.trim()) {
      alert("세부 위치를 입력해주세요.");
      return;
    }

    if (!incidentDate) {
      alert("발생 날짜를 선택해주세요.");
      return;
    }

    if (!incidentTime) {
      alert("발생 시간을 선택해주세요.");
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
        incidentDate,
        incidentTime,
        createdDate: complain?.createdDate || new Date().toISOString(),
        privacyAgreed,
      };

      console.log("전송할 DTO:", dto);

      let res;
      if (isEditMode && complain?.id) {
        res = await updateComplaint(complain.id, dto, files);
        alert("민원이 성공적으로 수정되었습니다!");
      } else {
        res = await createComplaint(dto, files);
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

        {/* ---  동적 옵션(floorOptions) 사용 --- */}
        <FormField label="층/호수/침대" required>
          <DropdownContainer>
            <Dropdown
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              hasValue={!!selectedFloor}
              disabled={floorOptions.length === 0} // 옵션 없으면 비활성화
            >
              <option value="" disabled>
                층
              </option>
              {floorOptions.map((floor) => (
                <option key={floor} value={floor}>
                  {floor}
                </option>
              ))}
            </Dropdown>

            {/* ---  동적 옵션(roomOptions) 사용 --- */}
            <Dropdown
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              hasValue={!!selectedRoom}
              disabled={roomOptions.length === 0} // 옵션 없으면 비활성화
            >
              <option value="" disabled>
                호수
              </option>
              {roomOptions.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </Dropdown>

            {/* ---  동적 옵션(bedOptions) 사용 --- */}
            <Dropdown
              value={selectedBed}
              onChange={(e) => setSelectedBed(e.target.value)}
              hasValue={!!selectedBed}
              disabled={bedOptions.length === 0} // 옵션 없으면 비활성화
            >
              <option value="" disabled>
                침대
              </option>
              {bedOptions.map((bed) => (
                <option key={bed} value={bed}>
                  {bed}
                </option>
              ))}
            </Dropdown>
          </DropdownContainer>
        </FormField>

        <FormField label="세부 위치" required>
          <Input
            placeholder="정확한 위치를 입력해주세요 (예: 화장실 앞, 복도 끝 등)"
            value={specificLocation}
            onChange={(e) => setSpecificLocation(e.target.value)}
          />
        </FormField>

        <FormField label="발생 날짜" required>
          <Input
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
          />
        </FormField>

        <FormField label="발생 시간" required>
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
          <FileUploader
            images={files}
            onAddImages={addFiles}
            onDeleteImage={deleteFile}
            isLoading={isFileLoading}
          />
        </FormField>

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
