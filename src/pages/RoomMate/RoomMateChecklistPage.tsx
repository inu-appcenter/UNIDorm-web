import { useEffect, useState } from "react";
import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import ToggleGroup from "../../components/roommate/checklist/ToggleGroup.tsx";
import Header from "../../components/common/Header.tsx";
import SquareButton from "../../components/common/SquareButton.tsx";
import {
  createRoommatePost,
  getOpponentChecklist,
} from "../../apis/roommate.ts";
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
  showerDuration,
  showertime,
  smoking,
  snoring,
  toothgrinding,
} from "../../constants/constants.ts";
import { getMemberInfo } from "../../apis/members.ts";
import useUserStore from "../../stores/useUserStore.ts";
import { useLocation, useNavigate } from "react-router-dom";
import StyledTextArea from "../../components/roommate/StyledTextArea.tsx";

export default function RoomMateChecklistPage() {
  const { setUserInfo, userInfo } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const partnerName = location.state?.partnerName;
  const roomId = location.state?.roomId;
  const isViewerMode = !!roomId; // roomId 있으면 뷰어 모드

  useEffect(() => {
    if (!roomId) return;

    const fetchOpponentChecklist = async () => {
      try {
        const response = await getOpponentChecklist(roomId);
        const data = response.data;

        // dormPeriod: ["월요일", ...] → days 배열에서 인덱스 찾기
        const dayIdxs = data.dormPeriod
          .map((day) => days.indexOf(day.replace("요일", "")))
          .filter((i) => i !== -1);

        setDayIndices(dayIdxs);

        setDomitoryIndex(dormitory.indexOf(data.dormType));
        setCollegeIndex(colleges.indexOf(data.college));

        // MBTI는 4글자라 가정하고 각각 인덱스 찾기
        if (data.mbti && data.mbti.length === 4) {
          setMbtiIndex1(mbti1.indexOf(data.mbti[0]));
          setMbtiIndex2(mbti2.indexOf(data.mbti[1]));
          setMbtiIndex3(mbti3.indexOf(data.mbti[2]));
          setMbtiIndex4(mbti4.indexOf(data.mbti[3]));
        }

        setSmokingIndex(smoking.indexOf(data.smoking));
        setSnoringIndex(snoring.indexOf(data.snoring));
        setToothgrindingIndex(toothgrinding.indexOf(data.toothGrind));
        setIsLightSleeperIndex(isLightSleeper.indexOf(data.sleeper));
        setShowertimeIndex(showertime.indexOf(data.showerHour));
        setShowerDurationIndex(showerDuration.indexOf(data.showerTime));
        setBedtimeIndex(bedtime.indexOf(data.bedTime));
        setOrganizationLevelIndex(organizationLevel.indexOf(data.arrangement));

        setComment(data.comment || "");
      } catch (error) {
        console.error("상대방 체크리스트 불러오기 실패", error);
      }
    };

    fetchOpponentChecklist();
  }, [roomId]);
  // 각 그룹별로 선택 인덱스를 useState로 관리
  const [dayIndices, setDayIndices] = useState<number[]>([]);
  const [domitoryIndex, setDomitoryIndex] = useState<number | null>(
    dormitory.indexOf(userInfo.dormType),
  );
  const [collegeIndex, setCollegeIndex] = useState<number | null>(
    colleges.indexOf(userInfo.college),
  );
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

  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (
      dayIndices.length === 0 || // ✅ 다중 선택 검사
      domitoryIndex === null ||
      collegeIndex === null ||
      mbtiIndex1 === null ||
      mbtiIndex2 === null ||
      mbtiIndex3 === null ||
      mbtiIndex4 === null ||
      smokingIndex === null ||
      snoringIndex === null ||
      toothgrindingIndex === null ||
      isLightSleeperIndex === null ||
      showertimeIndex === null ||
      showerDurationIndex === null ||
      bedtimeIndex === null ||
      organizationLevelIndex === null
    ) {
      alert("모든 항목을 선택해주세요.");
      return;
    }

    const mbti =
      mbti1[mbtiIndex1] +
      mbti2[mbtiIndex2] +
      mbti3[mbtiIndex3] +
      mbti4[mbtiIndex4];

    const requestBody = {
      title: "룸메이트 구해요!", // 임시 제목
      dormPeriod: dayIndices.map((i) => days[i] + "요일"), // ✅ 다중 선택 처리
      dormType: dormitory[domitoryIndex],
      college: colleges[collegeIndex],
      mbti,
      smoking: smoking[smokingIndex],
      snoring: snoring[snoringIndex],
      toothGrind: toothgrinding[toothgrindingIndex],
      sleeper: isLightSleeper[isLightSleeperIndex],
      showerHour: showertime[showertimeIndex],
      showerTime: showerDuration[showerDurationIndex],
      bedTime: bedtime[bedtimeIndex],
      arrangement: organizationLevel[organizationLevelIndex],
      comment,
    };

    try {
      const res = await createRoommatePost(requestBody);

      try {
        const response = await getMemberInfo();
        console.log(response);
        setUserInfo(response.data);
      } catch (error) {
        console.error("회원 가져오기 실패", error);
      }
      alert(
        "룸메이트 체크리스트 등록을 성공했어요. 룸메이트 탭에서 나와 맞는 룸메이트를 찾아보세요!",
      );
      navigate("/roommate");
      console.log(res.data);
    } catch (err) {
      alert("등록 실패");
      console.error(err);
    }
  };

  return (
    <RoomMateChecklistPageWrapper>
      <Header
        title={
          isViewerMode ? partnerName + "님의 체크리스트" : "사전 체크리스트"
        }
        hasBack={true}
        showAlarm={false}
      />

      <TitleContentArea
        title={"기숙사 종류"}
        description={
          !isViewerMode ? "기숙사 종류는 내 정보 수정에서 변경해주세요." : ""
        }
        children={
          <ToggleGroup
            Groups={dormitory}
            selectedIndex={domitoryIndex}
            onSelect={setDomitoryIndex}
            disabled={true} // 원래부터 비활성화
          />
        }
      />
      <TitleContentArea
        title={"단과대학"}
        description={
          !isViewerMode ? "단과대학은 내 정보 수정에서 변경해주세요." : ""
        }
        children={
          <SelectableChipGroup
            Groups={colleges}
            selectedIndex={collegeIndex}
            onSelect={setCollegeIndex}
            disabled={true} // 원래부터 비활성화
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
        title={"하고 싶은 말"}
        children={
          <StyledTextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={"추가로 자신을 어필해보세요!"}
            disabled={isViewerMode}
          />
        }
      />
      {!isViewerMode && (
        <ButtonWrapper>
          <SquareButton text={"저장하기"} onClick={handleSubmit} />
        </ButtonWrapper>
      )}
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
