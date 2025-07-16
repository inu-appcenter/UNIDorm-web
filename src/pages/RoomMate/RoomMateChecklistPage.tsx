import { useState } from "react";
import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import ToggleGroup from "../../components/roommate/checklist/ToggleGroup.tsx";
import Header from "../../components/common/Header.tsx";
import SquareButton from "../../components/common/SquareButton.tsx";

export default function RoomMateChecklistPage() {
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  const colleges = [
    "사범대",
    "예체대",
    "공과대",
    "자연과학대",
    "법학부",
    "계약학",
    "사회과학대",
    "글로벌정경대",
    "경영대",
    "생명과학기술대",
    "융합자유전공대",
    "동북아국제통상물류학부",
    "도시과학대",
    "정보기술대",
    "인문대",
  ];
  const domitory = ["2기숙사", "3기숙사"];
  const mbti1 = ["E", "I"];
  const mbti2 = ["N", "S"];
  const mbti3 = ["F", "T"];
  const mbti4 = ["P", "J"];

  const smoking = ["피워요", "안피워요"];
  const snoring = ["갈아요", "안갈아요"];
  const toothgrinding = ["갈아요", "안갈아요"];
  const isLightSleeper = ["밝아요", "어두워요", "몰라요"];
  const showertime = ["아침", "저녁", "둘다"];
  const showerDuration = ["10분 이내", "30분 이내", "1시간 이내"];
  const bedtime = ["일찍 자요", "늦게 자요", "때마다 달라요"];
  const organizationLevel = ["깔끔해요", "개방적이예요", "애매해요"];

  // 각 그룹별로 선택 인덱스를 useState로 관리
  const [dayIndex, setDayIndex] = useState<number | null>(null);
  const [domitoryIndex, setDomitoryIndex] = useState<number | null>(null);
  const [collegeIndex, setCollegeIndex] = useState<number | null>(null);
  const [mbtiIndex1, setMbtiIndex1] = useState<number | null>(null);
  const [mbtiIndex2, setMbtiIndex2] = useState<number | null>(null);
  const [mbtiIndex3, setMbtiIndex3] = useState<number | null>(null);
  const [mbtiIndex4, setMbtiIndex4] = useState<number | null>(null);
  const [smokingIndex, setSmokingIndex] = useState<number | null>(null);
  const [snoringIndex, setSnoringIndex] = useState<number | null>(null);
  const [toothgrindingIndex, setToothgrindingIndex] = useState<number | null>(
    null,
  );
  const [isLightSleeperIndex, setIsLightSleeperIndex] = useState<number | null>(
    null,
  );
  const [showertimeIndex, setShowertimeIndex] = useState<number | null>(null);
  const [showerDurationIndex, setShowerDurationIndex] = useState<number | null>(
    null,
  );
  const [bedtimeIndex, setBedtimeIndex] = useState<number | null>(null);
  const [organizationLevelIndex, setOrganizationLevelIndex] = useState<
    number | null
  >(null);

  return (
    <RoomMateChecklistPageWrapper>
      <Header title={"사전 체크리스트"} hasBack={true} showAlarm={false} />
      <TitleContentArea
        type={"기숙사 상주기간"}
        children={
          <SelectableChipGroup
            Groups={days}
            selectedIndex={dayIndex}
            onSelect={setDayIndex}
          />
        }
      />
      <TitleContentArea
        type={"기숙사 종류"}
        children={
          <ToggleGroup
            Groups={domitory}
            selectedIndex={domitoryIndex}
            onSelect={setDomitoryIndex}
          />
        }
      />
      <TitleContentArea
        type={"단과대"}
        children={
          <SelectableChipGroup
            Groups={colleges}
            selectedIndex={collegeIndex}
            onSelect={setCollegeIndex}
          />
        }
      />
      <TitleContentArea
        type={"MBTI"}
        children={
          <>
            <ToggleGroup
              Groups={mbti1}
              selectedIndex={mbtiIndex1}
              onSelect={setMbtiIndex1}
            />
            <ToggleGroup
              Groups={mbti2}
              selectedIndex={mbtiIndex2}
              onSelect={setMbtiIndex2}
            />
            <ToggleGroup
              Groups={mbti3}
              selectedIndex={mbtiIndex3}
              onSelect={setMbtiIndex3}
            />
            <ToggleGroup
              Groups={mbti4}
              selectedIndex={mbtiIndex4}
              onSelect={setMbtiIndex4}
            />
          </>
        }
      />
      <TitleContentArea
        type={"흡연 여부"}
        children={
          <ToggleGroup
            Groups={smoking}
            selectedIndex={smokingIndex}
            onSelect={setSmokingIndex}
          />
        }
      />
      <TitleContentArea
        type={"코골이 여부"}
        children={
          <ToggleGroup
            Groups={snoring}
            selectedIndex={snoringIndex}
            onSelect={setSnoringIndex}
          />
        }
      />
      <TitleContentArea
        type={"이갈이 여부"}
        children={
          <ToggleGroup
            Groups={toothgrinding}
            selectedIndex={toothgrindingIndex}
            onSelect={setToothgrindingIndex}
          />
        }
      />
      <TitleContentArea
        type={"잠귀"}
        children={
          <ToggleGroup
            Groups={isLightSleeper}
            selectedIndex={isLightSleeperIndex}
            onSelect={setIsLightSleeperIndex}
          />
        }
      />
      <TitleContentArea
        type={"샤워 시기"}
        children={
          <ToggleGroup
            Groups={showertime}
            selectedIndex={showertimeIndex}
            onSelect={setShowertimeIndex}
          />
        }
      />
      <TitleContentArea
        type={"샤워 시간"}
        children={
          <ToggleGroup
            Groups={showerDuration}
            selectedIndex={showerDurationIndex}
            onSelect={setShowerDurationIndex}
          />
        }
      />
      <TitleContentArea
        type={"취침 시기"}
        children={
          <ToggleGroup
            Groups={bedtime}
            selectedIndex={bedtimeIndex}
            onSelect={setBedtimeIndex}
          />
        }
      />
      <TitleContentArea
        type={"정리 정돈"}
        children={
          <ToggleGroup
            Groups={organizationLevel}
            selectedIndex={organizationLevelIndex}
            onSelect={setOrganizationLevelIndex}
          />
        }
      />
      <ButtonWrapper>
        <SquareButton text={"저장하기"} />
      </ButtonWrapper>
    </RoomMateChecklistPageWrapper>
  );
}

const RoomMateChecklistPageWrapper = styled.div`
  padding: 90px 20px;
  padding-bottom: 150px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fafafa;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 16px;
  box-sizing: border-box;
  background: rgba(244, 244, 244, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;
