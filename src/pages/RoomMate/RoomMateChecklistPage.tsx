import { useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header/Header";
import SquareButton from "../../components/common/SquareButton";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Step1BasicInfo from "../../components/roommate/checklist/steps/Step1BasicInfo";
import Step2LifeStyle from "../../components/roommate/checklist/steps/Step2LifeStyle";
import Step3LifeRhythm from "../../components/roommate/checklist/steps/Step3LifeRhythm";
import Step4Personality from "../../components/roommate/checklist/steps/Step4Personality";
import { CheckListForm, INITIAL_FORM_STATE } from "../../types/roommates";
import {
  createRoommatePost,
  getMyChecklist,
  putRoommatePost,
} from "../../apis/roommate";
import { getMemberInfo } from "../../apis/members";
import useUserStore from "../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
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
} from "../../constants/constants";

export default function RoomMateChecklistPage() {
  const { setUserInfo, userInfo } = useUserStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 4;

  const [formData, setFormData] = useState<CheckListForm>(INITIAL_FORM_STATE);
  const [randomTitles, setRandomTitles] = useState<string[]>([]);

  // State 변경 핸들러
  const handleFormChange = (key: keyof CheckListForm, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // 초기 랜덤 제목 설정
  useEffect(() => {
    const TITLES = [
      "룸메 급구!",
      "기숙사 구해요",
      "조용한 분 환영",
      "함께 지낼 룸메",
      "생활 깔끔한 분",
      "방 있어요!",
      "착한 룸메 찾음",
      "MBTI 안 따짐!",
      "잠버릇 없어야 해요",
      "공부 집중 잘 되는 환경",
    ];
    setRandomTitles([...TITLES].sort(() => 0.5 - Math.random()).slice(0, 6));
  }, []);

  // 사용자 정보 및 기존 데이터 로드
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      dormType: dormitory.indexOf(userInfo.dormType),
      college: colleges.indexOf(userInfo.college),
    }));

    const fetchMyChecklistData = async () => {
      if (!userInfo.roommateCheckList) return;
      try {
        const { data } = await getMyChecklist();
        if (data) {
          const mbtiIndices =
            data.mbti && data.mbti.length === 4
              ? [
                  mbti1.indexOf(data.mbti[0]),
                  mbti2.indexOf(data.mbti[1]),
                  mbti3.indexOf(data.mbti[2]),
                  mbti4.indexOf(data.mbti[3]),
                ]
              : [null, null, null, null];

          setFormData((prev) => ({
            ...prev,
            title: data.title,
            comment: data.comment || "",
            dormType: dormitory.indexOf(data.dormType),
            college: colleges.indexOf(data.college),
            dormPeriod: data.dormPeriod
              .map((d: string) => days.indexOf(d.replace("요일", "")))
              .filter((i: number) => i !== -1),
            smoking: smoking.indexOf(data.smoking),
            snoring: snoring.indexOf(data.snoring),
            toothGrind: toothgrinding.indexOf(data.toothGrind),
            arrangement: organizationLevel.indexOf(data.arrangement),
            religion: religion.indexOf(data.religion),
            sleeper: isLightSleeper.indexOf(data.sleeper),
            showerHour: showertime.indexOf(data.showerHour),
            showerTime: showerDuration.indexOf(data.showerTime),
            bedTime: bedtime.indexOf(data.bedTime),
            mbti: mbtiIndices,
          }));
        }
      } catch (error) {
        console.error("데이터 로드 실패", error);
      }
    };
    fetchMyChecklistData();
  }, [userInfo]);

  // 유효성 검사
  const validateStep = (step: number) => {
    const f = formData;
    switch (step) {
      case 1:
        return (
          f.dormType !== null && f.college !== null && f.dormPeriod.length > 0
        );
      case 2:
        return (
          f.smoking !== null &&
          f.snoring !== null &&
          f.toothGrind !== null &&
          f.arrangement !== null &&
          f.religion !== null
        );
      case 3:
        return (
          f.sleeper !== null &&
          f.showerHour !== null &&
          f.showerTime !== null &&
          f.bedTime !== null
        );
      case 4:
        return f.title.trim() !== "" && f.mbti.every((val) => val !== null);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      const msgs = [
        "기본 정보를 모두 선택해주세요.",
        "생활 습관을 모두 선택해주세요.",
        "생활 리듬을 모두 선택해주세요.",
        "성향 및 제목을 모두 입력해주세요.",
      ];
      alert(msgs[currentStep - 1]);
      return;
    }
    if (currentStep < TOTAL_STEPS) setCurrentStep((prev) => prev + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleReset = () => {
    if (window.confirm("모든 내용이 초기화돼요. 정말 초기화할까요?")) {
      setFormData((prev) => ({
        ...INITIAL_FORM_STATE,
        dormType: prev.dormType,
        college: prev.college,
      }));
    }
  };

  const handleSubmit = async () => {
    const f = formData;
    if (f.dormType === null || f.college === null) return;

    const mbtiStr =
      mbti1[f.mbti[0]!] +
      mbti2[f.mbti[1]!] +
      mbti3[f.mbti[2]!] +
      mbti4[f.mbti[3]!];

    const body = {
      title: f.title,
      dormPeriod: f.dormPeriod.map((i) => days[i]),
      dormType: dormitory[f.dormType],
      college: colleges[f.college],
      mbti: mbtiStr,
      smoking: smoking[f.smoking!],
      snoring: snoring[f.snoring!],
      toothGrind: toothgrinding[f.toothGrind!],
      sleeper: isLightSleeper[f.sleeper!],
      showerHour: showertime[f.showerHour!],
      showerTime: showerDuration[f.showerTime!],
      bedTime: bedtime[f.bedTime!],
      arrangement: organizationLevel[f.arrangement!],
      religion: religion[f.religion!],
      comment: f.comment,
    };

    try {
      setIsLoading(true);

      // [수정] 삼항 연산자 -> if/else 문으로 변경
      if (userInfo.roommateCheckList) {
        await putRoommatePost(body);
      } else {
        await createRoommatePost(body);
      }

      const { data } = await getMemberInfo();
      setUserInfo(data);

      alert(`체크리스트 ${userInfo.roommateCheckList ? "수정" : "등록"} 완료!`);
      navigate("/roommate");
    } catch (err) {
      alert("저장 실패");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // UI 렌더링 헬퍼
  const getStepHeader = () => {
    const name = userInfo.name || "OO";
    const headers = [
      {
        step: "[STEP 1] 기본 정보",
        desc: `${name}님께서 거주하고 계신 기숙사 정보와\n단과대를 입력해주세요!`,
      },
      {
        step: "[STEP 2] 생활 습관",
        desc: `${name}님의 기숙사 생활 습관을 입력해주세요!`,
      },
      {
        step: "[STEP 3] 생활 리듬",
        desc: `${name}님의 평소 생활 리듬을 입력해주세요!`,
      },
      { step: "[STEP 4] 성향", desc: `${name}님의 성향을 입력해주세요!` },
    ];
    return headers[currentStep - 1];
  };

  const headerInfo = getStepHeader();

  return (
    <Wrapper>
      <Header title={"사전 체크리스트"} hasBack={true} showAlarm={false} />
      {isLoading && <LoadingSpinner overlay message="저장 중..." />}

      <ProgressBarContainer>
        <ProgressFill width={(currentStep / TOTAL_STEPS) * 100} />
      </ProgressBarContainer>

      <StepHeader>
        <StepLabel>{headerInfo.step}</StepLabel>
        <StepDesc>{headerInfo.desc}</StepDesc>
      </StepHeader>

      <ContentArea>
        {currentStep === 1 && (
          <Step1BasicInfo data={formData} onChange={handleFormChange} />
        )}
        {currentStep === 2 && (
          <Step2LifeStyle data={formData} onChange={handleFormChange} />
        )}
        {currentStep === 3 && (
          <Step3LifeRhythm data={formData} onChange={handleFormChange} />
        )}
        {currentStep === 4 && (
          <Step4Personality
            data={formData}
            onChange={handleFormChange}
            randomTitles={randomTitles}
          />
        )}
      </ContentArea>

      <BottomNav>
        <ButtonContainer $flex={1}>
          <SquareButton
            variant="secondary"
            text={currentStep === 1 ? "초기화" : "이전"}
            onClick={currentStep === 1 ? handleReset : handlePrev}
          />
        </ButtonContainer>
        <ButtonContainer $flex={3}>
          <SquareButton
            variant="primary"
            text={
              currentStep === TOTAL_STEPS
                ? userInfo.roommateCheckList
                  ? "수정 완료"
                  : "작성 완료"
                : "다음 단계"
            }
            onClick={handleNext}
          />
        </ButtonContainer>
      </BottomNav>
    </Wrapper>
  );
}

// Styled Components
const Wrapper = styled.div`
  padding-top: 60px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fafafa;
  box-sizing: border-box;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: #eee;
  position: relative;
`;

const ProgressFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${(props) => props.width}%;
  background-color: #ffd700;
  transition: width 0.3s ease-in-out;
`;

const StepHeader = styled.div`
  padding: 24px 16px 0;
  box-sizing: border-box;
`;

const StepLabel = styled.div`
  color: #000;
  font-size: 20px;
  font-weight: 600;
  line-height: 130%;
  margin-bottom: 8px;
`;

const StepDesc = styled.div`
  color: #3a3a3c;
  font-size: 14px;
  font-weight: 500;
  line-height: 130%;
  white-space: pre-wrap;
`;

const ContentArea = styled.div`
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const BottomNav = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  gap: 12px;
  z-index: 10;
`;

const ButtonContainer = styled.div<{ $flex: number }>`
  flex: ${(props) => props.$flex};
`;
