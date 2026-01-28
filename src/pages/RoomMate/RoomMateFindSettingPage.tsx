import { useEffect, useState } from "react";
import styled from "styled-components";
import SquareButton from "../../components/common/SquareButton";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Step1BasicInfo from "../../components/roommate/FindSetting/steps/Step1BasicInfo";
import Step2LifeStyle from "../../components/roommate/FindSetting/steps/Step2LifeStyle";
import Step3LifeRhythm from "../../components/roommate/FindSetting/steps/Step3LifeRhythm";
import Step4Personality from "../../components/roommate/FindSetting/steps/Step4Personality";
import { CheckListForm, INITIAL_FORM_STATE } from "@/types/roommates";
import {
  getNotificationFilter,
  updateNotificationFilter,
  deleteNotificationFilter,
} from "@/apis/roommate";
import useUserStore from "../../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query"; // queryClient 임포트
import {
  bedtime,
  colleges,
  days,
  dormitory,
  isLightSleeper,
  organizationLevel,
  religion,
  showerDuration,
  showertime,
  smoking,
  snoring,
  toothgrinding,
} from "@/constants/constants";
import { useSetHeader } from "@/hooks/useSetHeader";
import { PATHS } from "@/constants/paths";

export default function RoomMateFilterPage() {
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // queryClient 인스턴스 생성
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 4;

  const [formData, setFormData] = useState<CheckListForm>({
    ...INITIAL_FORM_STATE,
    college: [] as any,
    religion: [] as any,
  });

  useSetHeader({ title: "맞춤 룸메이트 찾기 설정" });

  useEffect(() => {
    const fetchFilterData = async () => {
      setIsLoading(true);
      try {
        const { data } = await getNotificationFilter();
        if (data) {
          setFormData({
            ...INITIAL_FORM_STATE,
            dormType: data.dormType ? dormitory.indexOf(data.dormType) : null,
            dormPeriod: data.dormPeriodDays
              ? data.dormPeriodDays
                  .map((d) => days.indexOf(d.replace("요일", "")))
                  .filter((i) => i !== -1)
              : [],
            college: data.colleges
              ? (data.colleges
                  .map((c) => colleges.indexOf(c))
                  .filter((i) => i !== -1) as any)
              : [],
            smoking: data.smoking ? smoking.indexOf(data.smoking) : null,
            snoring: data.snoring ? snoring.indexOf(data.snoring) : null,
            toothGrind: data.toothGrind
              ? toothgrinding.indexOf(data.toothGrind)
              : null,
            sleeper: data.sleeper ? isLightSleeper.indexOf(data.sleeper) : null,
            showerHour: data.showerHour
              ? showertime.indexOf(data.showerHour)
              : null,
            showerTime: data.showerTime
              ? showerDuration.indexOf(data.showerTime)
              : null,
            bedTime: data.bedTime ? bedtime.indexOf(data.bedTime) : null,
            arrangement: data.arrangement
              ? organizationLevel.indexOf(data.arrangement)
              : null,
            religion: data.religions
              ? (data.religions
                  .map((r) => religion.indexOf(r))
                  .filter((i) => i !== -1) as any)
              : [],
          });
        }
      } catch (error) {
        console.error("필터 데이터 로드 실패", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilterData();
  }, []);

  const handleFormChange = (key: keyof CheckListForm, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = async () => {
    if (window.confirm("설정한 모든 필터가 삭제됩니다. 정말 초기화할까요?")) {
      try {
        setIsLoading(true);
        await deleteNotificationFilter();

        // 필터 삭제 후 추천 목록 무효화
        await queryClient.invalidateQueries({
          queryKey: ["roommates", "matching"],
        });

        setFormData({
          ...INITIAL_FORM_STATE,
          college: [] as any,
          religion: [] as any,
        });
        alert("필터가 초기화되었습니다.");
        navigate(PATHS.ROOMMATE.ROOT);
      } catch (err) {
        alert("초기화 실패");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    const f = formData;

    const filterBody = {
      dormType: f.dormType !== null ? dormitory[f.dormType] : null,
      dormPeriodDays: f.dormPeriod.map((i) => days[i]),
      colleges: Array.isArray(f.college)
        ? f.college.map((i) => colleges[i])
        : [],
      smoking: f.smoking !== null ? smoking[f.smoking] : null,
      snoring: f.snoring !== null ? snoring[f.snoring] : null,
      toothGrind: f.toothGrind !== null ? toothgrinding[f.toothGrind] : null,
      sleeper: f.sleeper !== null ? isLightSleeper[f.sleeper] : null,
      showerHour: f.showerHour !== null ? showertime[f.showerHour] : null,
      showerTime: f.showerTime !== null ? showerDuration[f.showerTime] : null,
      bedTime: f.bedTime !== null ? bedtime[f.bedTime] : null,
      arrangement:
        f.arrangement !== null ? organizationLevel[f.arrangement] : null,
      religions: Array.isArray(f.religion)
        ? f.religion.map((i) => religion[i])
        : [],
    };

    try {
      setIsLoading(true);
      await updateNotificationFilter(filterBody as any);

      // 저장 성공 후 추천 목록 데이터 무효화 및 리페칭 유도
      await queryClient.invalidateQueries({
        queryKey: ["roommates", "matching"],
      });

      alert("맞춤 필터 설정이 완료되었습니다!");
      navigate(PATHS.ROOMMATE.ROOT);
    } catch (err) {
      alert("저장 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep((prev) => prev + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const getHeaderInfo = () => {
    const name = userInfo.name || "UNI";
    const headers = [
      {
        step: "[STEP 1] 희망 상대 정보",
        desc: `${name}님이 찾고 있는\n상대방의 기숙사 및 비상주 조건을 설정해주세요!`,
      },
      {
        step: "[STEP 2] 희망 생활 습관",
        desc: `상대방의 흡연 여부나 잠귀 등\n내가 수용 가능한 습관 조건을 설정해주세요!`,
      },
      {
        step: "[STEP 3] 희망 생활 리듬",
        desc: `상대방의 취침 및 샤워 시간 등\n나와 잘 맞았으면 하는 리듬을 선택해주세요!`,
      },
      {
        step: "[STEP 4] 희망 성향",
        desc: `상대방의 정리 습관과 종교 등\n추가적으로 고려하고 싶은 조건을 설정해주세요!`,
      },
    ];
    return headers[currentStep - 1];
  };
  const header = getHeaderInfo();

  return (
    <Wrapper>
      {isLoading && <LoadingSpinner overlay message="데이터 처리 중..." />}

      <ProgressBarContainer>
        <ProgressFill width={(currentStep / TOTAL_STEPS) * 100} />
      </ProgressBarContainer>

      <StepHeaderArea>
        <StepLabel>{header.step}</StepLabel>
        <StepDesc>{header.desc}</StepDesc>
      </StepHeaderArea>

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
          <Step4Personality data={formData} onChange={handleFormChange} />
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
            text={currentStep === TOTAL_STEPS ? "설정 완료" : "다음 단계"}
            onClick={handleNext}
          />
        </ButtonContainer>
      </BottomNav>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fafafa;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: #eee;
`;

const ProgressFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${(props) => props.width}%;
  background-color: #ffd700;
  transition: width 0.3s ease;
`;

const StepHeaderArea = styled.div`
  padding: 24px 16px 0;
`;

const StepLabel = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const StepDesc = styled.div`
  font-size: 14px;
  color: #3a3a3c;
  line-height: 1.4;
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
  gap: 12px;
  z-index: 10;
  box-sizing: border-box;
`;

const ButtonContainer = styled.div<{ $flex: number }>`
  flex: ${(props) => props.$flex};
`;
