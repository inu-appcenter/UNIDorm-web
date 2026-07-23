import { useState } from "react";
import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import ToggleGroup from "../../components/roommate/checklist/ToggleGroup.tsx";
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
} from "@/constants/constants";
import useUserStore from "../../stores/useUserStore.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { useSetHeader } from "@/hooks/useSetHeader";
import { PATHS } from "@/constants/paths";

export default function RoomMateFilterPage() {
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const roomId = location.state?.roomId;
  const isViewerMode = !!roomId;
  const filters = location.state?.filters;

  /** Helper Functions */
  const getIndex = (arr: string[], value: string | undefined | null) => {
    if (!value) return null;
    const idx = arr.indexOf(value);
    return idx === -1 ? null : idx;
  };

  const getIndices = (arr: string[], values: string[] | undefined | null) => {
    if (!values) return [];
    return values.map((v) => arr.indexOf(v)).filter((i) => i !== -1);
  };

  const getMbtiIndex = (
    group: string[],
    savedMbti: string | undefined | null,
  ) => {
    if (!savedMbti) return null;
    const found = group.find((g) => savedMbti.includes(g));
    return found ? group.indexOf(found) : null;
  };

  // --- State ---
  const [dayIndices, setDayIndices] = useState<number[]>(() =>
    getIndices(days, filters?.dormPeriod),
  );

  const [domitoryIndex, setDomitoryIndex] = useState<number | null>(
    () =>
      getIndex(dormitory, filters?.dormType) ??
      (isViewerMode ? null : dormitory.indexOf(userInfo.dormType)),
  );

  const [collegeIndex, setCollegeIndex] = useState<number | null>(() =>
    getIndex(colleges, filters?.college),
  );

  const [mbtiIndex1, setMbtiIndex1] = useState<number | null>(() =>
    getMbtiIndex(mbti1, filters?.mbti),
  );
  const [mbtiIndex2, setMbtiIndex2] = useState<number | null>(() =>
    getMbtiIndex(mbti2, filters?.mbti),
  );
  const [mbtiIndex3, setMbtiIndex3] = useState<number | null>(() =>
    getMbtiIndex(mbti3, filters?.mbti),
  );
  const [mbtiIndex4, setMbtiIndex4] = useState<number | null>(() =>
    getMbtiIndex(mbti4, filters?.mbti),
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

  /** ✅ 초기화 핸들러: 모든 선택 상태를 null/Empty로 변경 */
  const handleReset = () => {
    // 사용자 경험을 위해 confirm 없이 즉시 초기화하거나, 필요시 추가 가능
    setDayIndices([]);
    setDomitoryIndex(null); // 내 정보가 아닌 '전체'로 초기화
    setCollegeIndex(null);
    setMbtiIndex1(null);
    setMbtiIndex2(null);
    setMbtiIndex3(null);
    setMbtiIndex4(null);
    setSmokingIndex(null);
    setSnoringIndex(null);
    setToothgrindingIndex(null);
    setIsLightSleeperIndex(null);
    setShowertimeIndex(null);
    setShowerDurationIndex(null);
    setBedtimeIndex(null);
    setOrganizationLevelIndex(null);
    setReligionIndex(null);
  };

  /** ✅ 필터 적용 핸들러 */
  const handleSubmit = () => {
    const selectedDays = dayIndices.map((i) => days[i]);

    const filtersData = {
      dormType: domitoryIndex !== null ? dormitory[domitoryIndex] : null,
      college: collegeIndex !== null ? colleges[collegeIndex] : null,
      dormPeriod: selectedDays.length > 0 ? selectedDays : null,
      mbti:
        [mbtiIndex1, mbtiIndex2, mbtiIndex3, mbtiIndex4]
          .map((idx, i) => {
            if (idx === null) return null;
            if (i === 0) return mbti1[idx];
            if (i === 1) return mbti2[idx];
            if (i === 2) return mbti3[idx];
            if (i === 3) return mbti4[idx];
            return null;
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
      religion: religionIndex !== null ? religion[religionIndex] : null,
    };

    // 유효한 필터만 남김
    const filteredFilters = Object.fromEntries(
      Object.entries(filtersData).filter(
        ([, v]) => v !== null && v !== undefined && v !== "",
      ),
    );

    // ✅ 필터가 비어있다면 state 없이 이동 (초기화 효과)
    if (Object.keys(filteredFilters).length === 0) {
      navigate(`${PATHS.ROOMMATE.ROOT}?tab=전체`);
    } else {
      // 필터가 있다면 state에 담아서 이동
      navigate(`${PATHS.ROOMMATE.ROOT}?tab=전체`, {
        state: {
          filters: filteredFilters,
        },
      });
    }
  };

  useSetHeader({ title: "필터" });

  return (
    <RoomMateChecklistPageWrapper>
      <TitleContentArea
        title={"기숙사 종류"}
        children={
          <ToggleGroup
            Groups={dormitory}
            selectedIndex={domitoryIndex}
            onSelect={setDomitoryIndex}
            disabled={isViewerMode}
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
            disabled={isViewerMode}
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
            disabled={isViewerMode}
          />
        }
      />

      {/* MBTI 및 기타 필터 컴포넌트들 (기존 코드와 동일) */}
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

      {/* ✅ 버튼 영역 수정: 초기화 & 적용하기 */}
      {!isViewerMode && (
        <ButtonWrapper>
          <ButtonGroup>
            <div style={{ flex: 1 }}>
              <SquareButton
                variant="secondary"
                text="초기화"
                onClick={handleReset}
              />
            </div>
            <div style={{ flex: 2.5 }}>
              <SquareButton
                variant="primary"
                text="필터 적용하기"
                onClick={handleSubmit}
              />
            </div>
          </ButtonGroup>
        </ButtonWrapper>
      )}
    </RoomMateChecklistPageWrapper>
  );
}

const RoomMateChecklistPageWrapper = styled.div`
  padding: 0 16px 120px;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;
