import { useState } from "react";
import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import ToggleGroup from "../../components/roommate/checklist/ToggleGroup.tsx";
import Header from "../../components/common/Header/Header.tsx";
import SquareButton from "../../components/common/SquareButton.tsx";
import {
  bedtime,
  colleges,
  days,
  dormitory,
  isLightSleeper,
  mbti1,
  mbti2,
  mbti3,
  mbti4,
  organizationLevel,
  religion,
  showerDuration,
  showertime,
  smoking,
  snoring,
  toothgrinding,
} from "../../constants/constants.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { useLocation, useNavigate } from "react-router-dom";

export default function RoomMateFilterPage() {
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const roomId = location.state?.roomId;
  const isViewerMode = !!roomId; // roomId 있으면 뷰어 모드

  const getIndex = (
    arr: string[],
    value: string | undefined | null,
  ): number | null => {
    if (!value) return null;
    const idx = arr.indexOf(value);
    return idx === -1 ? null : idx;
  };

  const getIndices = (
    arr: string[],
    values: string[] | undefined | null,
  ): number[] => {
    if (!values) return [];
    return values.map((v) => arr.indexOf(v)).filter((i) => i !== -1);
  };

  const filters = location.state?.filters;

  const [dayIndices, setDayIndices] = useState<number[]>(() =>
    getIndices(days, filters?.dormPeriod),
  );

  const [domitoryIndex, setDomitoryIndex] = useState<number | null>(
    () =>
      getIndex(dormitory, filters?.dormType) ??
      dormitory.indexOf(userInfo.dormType),
  );

  const [collegeIndex, setCollegeIndex] = useState<number | null>(() =>
    getIndex(colleges, filters?.college),
  );

  // MBTI는 문자열이 4글자로 온다고 가정
  const [mbtiIndex1, setMbtiIndex1] = useState<number | null>(() =>
    filters?.mbti ? getIndex(mbti1, filters.mbti[0]) : null,
  );
  const [mbtiIndex2, setMbtiIndex2] = useState<number | null>(() =>
    filters?.mbti ? getIndex(mbti2, filters.mbti[1]) : null,
  );
  const [mbtiIndex3, setMbtiIndex3] = useState<number | null>(() =>
    filters?.mbti ? getIndex(mbti3, filters.mbti[2]) : null,
  );
  const [mbtiIndex4, setMbtiIndex4] = useState<number | null>(() =>
    filters?.mbti ? getIndex(mbti4, filters.mbti[3]) : null,
  );

  const [smokingIndex, setSmokingIndex] = useState<number | null>(() =>
    getIndex(smoking, filters?.smoking),
  );

  const [snoringIndex, setSnoringIndex] = useState<number | null>(() =>
    getIndex(snoring, filters?.snoring),
  );

  const [toothgrindingIndex, setToothgrindingIndex] = useState<number | null>(
    () => getIndex(toothgrinding, filters?.toothGrind),
  );

  const [isLightSleeperIndex, setIsLightSleeperIndex] = useState<number | null>(
    () => getIndex(isLightSleeper, filters?.sleeper),
  );

  const [showertimeIndex, setShowertimeIndex] = useState<number | null>(() =>
    getIndex(showertime, filters?.showerHour),
  );

  const [showerDurationIndex, setShowerDurationIndex] = useState<number | null>(
    () => getIndex(showerDuration, filters?.showerTime),
  );

  const [bedtimeIndex, setBedtimeIndex] = useState<number | null>(() =>
    getIndex(bedtime, filters?.bedTime),
  );

  const [organizationLevelIndex, setOrganizationLevelIndex] = useState<
    number | null
  >(() => getIndex(organizationLevel, filters?.arrangement));

  const [religionIndex, setReligionIndex] = useState<number | null>(() =>
    getIndex(religion, filters?.religion),
  );

  const handleSubmit = () => {
    const filters = {
      dormType: domitoryIndex !== null ? dormitory[domitoryIndex] : null,
      college: collegeIndex !== null ? colleges[collegeIndex] : null,
      dormPeriod: dayIndices.map((i) => days[i]),
      mbti:
        [mbtiIndex1, mbtiIndex2, mbtiIndex3, mbtiIndex4]
          .map((idx, i) => {
            if (idx === null) return null;
            if (i === 0) return mbti1[idx];
            if (i === 1) return mbti2[idx];
            if (i === 2) return mbti3[idx];
            if (i === 3) return mbti4[idx];
          })
          .filter((v) => v !== null)
          .join("") || null,

      smoking: smokingIndex !== null ? smoking[smokingIndex] : null,
      snoring: snoringIndex !== null ? snoring[snoringIndex] : null,
      toothGrind:
        toothgrindingIndex !== null ? toothgrinding[toothgrindingIndex] : null,
      sleeper:
        isLightSleeperIndex !== null
          ? isLightSleeper[isLightSleeperIndex]
          : null,
      showerHour: showertimeIndex !== null ? showertime[showertimeIndex] : null,
      showerTime:
        showerDurationIndex !== null
          ? showerDuration[showerDurationIndex]
          : null,
      bedTime: bedtimeIndex !== null ? bedtime[bedtimeIndex] : null,
      arrangement:
        organizationLevelIndex !== null
          ? organizationLevel[organizationLevelIndex]
          : null,
      religion: religionIndex !== null ? religion[religionIndex] : null, // ✅ 종교 필터 추가
    };

    const filteredFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== null && v !== undefined),
    );

    navigate("/roommate/list", { state: { filters: filteredFilters } });
  };

  return (
    <RoomMateChecklistPageWrapper>
      <Header title={"룸메이트 필터"} hasBack={true} showAlarm={false} />

      <TitleContentArea
        title={"기숙사 종류"}
        children={
          <ToggleGroup
            Groups={dormitory}
            selectedIndex={domitoryIndex}
            onSelect={setDomitoryIndex}
          />
        }
      />
      <TitleContentArea
        title={"단과대학"}
        children={
          <SelectableChipGroup
            Groups={colleges}
            selectedIndex={collegeIndex}
            onSelect={setCollegeIndex}
          />
        }
      />

      <TitleContentArea
        title={"기숙사 상주기간"}
        children={
          <SelectableChipGroup
            Groups={days}
            selectedIndices={dayIndices}
            onSelect={setDayIndices}
            multi={true}
            disabled={isViewerMode} // 뷰어 모드면 비활성화
          />
        }
      />
      <TitleContentArea
        title={"MBTI"}
        children={
          <>
            <ToggleGroup
              Groups={mbti1}
              selectedIndex={mbtiIndex1}
              onSelect={setMbtiIndex1}
              disabled={isViewerMode}
            />
            <ToggleGroup
              Groups={mbti2}
              selectedIndex={mbtiIndex2}
              onSelect={setMbtiIndex2}
              disabled={isViewerMode}
            />
            <ToggleGroup
              Groups={mbti3}
              selectedIndex={mbtiIndex3}
              onSelect={setMbtiIndex3}
              disabled={isViewerMode}
            />
            <ToggleGroup
              Groups={mbti4}
              selectedIndex={mbtiIndex4}
              onSelect={setMbtiIndex4}
              disabled={isViewerMode}
            />
          </>
        }
      />
      {/* 나머지 항목들도 모두 disabled={isViewerMode} 처리 */}
      <TitleContentArea
        title={"흡연 여부"}
        children={
          <ToggleGroup
            Groups={smoking}
            selectedIndex={smokingIndex}
            onSelect={setSmokingIndex}
            disabled={isViewerMode}
          />
        }
      />
      <TitleContentArea
        title={"코골이 여부"}
        children={
          <ToggleGroup
            Groups={snoring}
            selectedIndex={snoringIndex}
            onSelect={setSnoringIndex}
            disabled={isViewerMode}
          />
        }
      />
      <TitleContentArea
        title={"이갈이 여부"}
        children={
          <ToggleGroup
            Groups={toothgrinding}
            selectedIndex={toothgrindingIndex}
            onSelect={setToothgrindingIndex}
            disabled={isViewerMode}
          />
        }
      />
      <TitleContentArea
        title={"잠귀"}
        children={
          <ToggleGroup
            Groups={isLightSleeper}
            selectedIndex={isLightSleeperIndex}
            onSelect={setIsLightSleeperIndex}
            disabled={isViewerMode}
          />
        }
      />
      <TitleContentArea
        title={"샤워 시기"}
        children={
          <ToggleGroup
            Groups={showertime}
            selectedIndex={showertimeIndex}
            onSelect={setShowertimeIndex}
            disabled={isViewerMode}
          />
        }
      />
      <TitleContentArea
        title={"샤워 시간"}
        children={
          <ToggleGroup
            Groups={showerDuration}
            selectedIndex={showerDurationIndex}
            onSelect={setShowerDurationIndex}
            disabled={isViewerMode}
          />
        }
      />
      <TitleContentArea
        title={"취침 시기"}
        children={
          <ToggleGroup
            Groups={bedtime}
            selectedIndex={bedtimeIndex}
            onSelect={setBedtimeIndex}
            disabled={isViewerMode}
          />
        }
      />
      <TitleContentArea
        title={"정리 정돈"}
        children={
          <ToggleGroup
            Groups={organizationLevel}
            selectedIndex={organizationLevelIndex}
            onSelect={setOrganizationLevelIndex}
            disabled={isViewerMode}
          />
        }
      />

      <TitleContentArea
        title={"종교"}
        children={
          <SelectableChipGroup
            Groups={religion}
            selectedIndex={religionIndex}
            onSelect={setReligionIndex}
            disabled={isViewerMode}
          />
        }
      />

      {!isViewerMode && (
        <ButtonWrapper>
          <SquareButton text={"필터 적용하기"} onClick={handleSubmit} />
        </ButtonWrapper>
      )}
    </RoomMateChecklistPageWrapper>
  );
}

const RoomMateChecklistPageWrapper = styled.div`
  padding: 80px 16px;
  padding-bottom: 150px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  overflow-y: auto;
  background: #fafafa;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 16px;
  box-sizing: border-box;
  background: rgba(244, 244, 244, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;
