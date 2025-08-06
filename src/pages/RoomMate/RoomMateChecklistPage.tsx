import { useEffect, useState } from "react";
import styled from "styled-components";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import ToggleGroup from "../../components/roommate/checklist/ToggleGroup.tsx";
import Header from "../../components/common/Header.tsx";
import SquareButton from "../../components/common/SquareButton.tsx";
import {
  createRoommatePost,
  getMyChecklist,
  putRoommatePost,
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
  religion,
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
import StyledTextInput from "../../components/roommate/StyledTextInput.tsx";

export default function RoomMateChecklistPage() {
  const { setUserInfo, userInfo } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const partnerName = location.state?.partnerName;
  const roomId = location.state?.roomId;
  const isViewerMode = !!roomId; // roomId 있으면 뷰어 모드

  useEffect(() => {
    // if (!roomId) return;

    const fetchOpponentChecklist = async () => {
      try {
        const response = await getMyChecklist();
        const data = response.data;
        console.log(data);

        setTitle(data.title);

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
        setReligionIndex(religion.indexOf(data.religion));

        setComment(data.comment || "");
      } catch (error) {
        console.error("상대방 체크리스트 불러오기 실패", error);
      }
    };

    fetchOpponentChecklist();
  }, [roomId]);
  // 각 그룹별로 선택 인덱스를 useState로 관리
  const [title, setTitle] = useState("");
  const getRandomTitles = (count: number, options: string[]) => {
    const shuffled = [...options].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  const [randomTitles, setRandomTitles] = useState<string[]>([]);

  useEffect(() => {
    const titles = getRandomTitles(6, ROOMMATE_POST_TITLES);
    setRandomTitles(titles);
  }, []);

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
  const [religionIndex, setReligionIndex] = useState<number | null>(null);

  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (
      title.length === 0 ||
      dayIndices.length === 0 ||
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
      organizationLevelIndex === null ||
      religionIndex === null
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
      title,
      dormPeriod: dayIndices.map((i) => days[i]),
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
      religion: religion[religionIndex],
      comment,
    };

    try {
      const res = userInfo.roommateCheckList
        ? await putRoommatePost(requestBody)
        : await createRoommatePost(requestBody);

      try {
        const response = await getMemberInfo();
        setUserInfo(response.data);
        console.log(response);
      } catch (error) {
        console.error("회원 정보 불러오기 실패", error);
      }

      alert(
        `룸메이트 체크리스트 ${userInfo.roommateCheckList ? "수정" : "등록"}을 성공했어요. 룸메이트 탭에서 나와 맞는 룸메이트를 찾아보세요!`,
      );
      navigate("/roommate");
      console.log(res.data);
    } catch (err) {
      alert("등록 실패");
      console.error(err);
    }
  };

  const ROOMMATE_POST_TITLES = [
    "룸메 급구!",
    "기숙사 구해요",
    "조용한 분 환영",
    "함께 지낼 룸메",
    "룸메 구합니다",
    "생활 깔끔한 분",
    "방 있어요!",
    "착한 룸메 찾음",
    "룸메 꼭 필요해",
    "함께 살 사람!",
    "깨끗한 방 있어요",
    "조용한 사람 좋아요",
    "빨리 결정 원해요",
    "생활 패턴 맞는 분",
    "편하게 지낼 룸메",
    "배려심 있는 분 환영",
    "잠버릇 없어야 해요",
    "MBTI 안 따짐!",
    "장기 룸메 구해요",
    "기숙사 혼자 쓰기 아까워요",
    "내향인 환영!",
    "외향인 좋아요!",
    "밤늦게 자는 사람 찾음",
    "아침형 인간 환영",
    "흡연 ❌ 코골이 ❌",
    "공부 집중 잘 되는 환경",
    "깔끔한 분만 연락주세요",
    "룸메끼리 친하게 지내요",
    "개인 시간 존중해요",
    "기숙사 나눠쓸 분!",
  ];

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
          !isViewerMode
            ? "기숙사 종류는 내 정보 수정에서 변경할 수 있어요."
            : ""
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
          !isViewerMode ? "단과대학은 내 정보 수정에서 변경할 수 있어요." : ""
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
        title={"제목"}
        description={
          "체크리스트를 작성한 내용은 룸메이트를 구하는 게시글로 자동 작성되며, 나와 비슷한 생활패턴을 가진 룸메이트를 추천받을 수 있어요."
        }
        children={
          <>
            <StyledTextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={"눈길을 사로잡을 제목을 작성해보세요!"}
              disabled={isViewerMode}
            />
            {!title && (
              <SortFilterWrapper>
                {randomTitles.map((option) => (
                  <SortButton
                    key={option}
                    className={title === option ? "active" : ""}
                    onClick={() => setTitle(option)}
                  >
                    {option}
                  </SortButton>
                ))}
              </SortFilterWrapper>
            )}
          </>
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
          <SquareButton
            text={userInfo.roommateCheckList ? "수정하기" : "저장하기"}
            onClick={handleSubmit}
          />
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
  width: 100%;
  height: 100%;
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

const SortFilterWrapper = styled.div`
  display: flex;
  width: 100%;
  height: fit-content;
  overflow-x: scroll;
  -ms-overflow-style: none; /* IE, Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
  margin-bottom: 12px;
  gap: 8px;
  padding: 0px 12px 0 12px;
  //flex-wrap: wrap;
`;

const SortButton = styled.button`
  background-color: #f4f4f4;
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  min-width: fit-content;

  &.active {
    background-color: #007bff;
    color: white;
    font-weight: bold;
  }
`;
