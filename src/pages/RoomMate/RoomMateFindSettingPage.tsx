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
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
import ToggleLine from "@/components/common/ToggleLine";

export default function RoomMateFilterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFilterActive, setIsFilterActive] = useState(true);
  const TOTAL_STEPS = 4;

  const [formData, setFormData] = useState<CheckListForm>({
    ...INITIAL_FORM_STATE,
    college: [] as any,
    religion: [] as any,
  });

  useSetHeader({ title: "맞춤 룸메이트 설정" });

  useEffect(() => {
    const fetchFilterData = async () => {
      setIsLoading(true);
      try {
        const { data } = await getNotificationFilter();

        if (data) {
          // 필드 설정 여부 확인
          const hasAnySetting = [
            data.dormPeriodDays?.length,
            data.colleges?.length,
            data.religions?.length,
            data.dormType,
            data.smoking,
            data.snoring,
            data.toothGrind,
            data.sleeper,
            data.showerHour,
            data.showerTime,
            data.bedTime,
            data.arrangement,
          ].some((value) => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === "number") return value > 0;
            return value !== null && value !== undefined;
          });

          setIsFilterActive(hasAnySetting);

          // 사용 안함 상태(설정 없음)일 때만 안내 문구 출력
          if (!hasAnySetting) {
            setTimeout(() => {
              alert(
                "필터에 해당하는 새 글이 올라오면 푸시 알림으로 알려드려요.\n너무 많은 필터 선택은 룸메이트를 구하기 어려울 수 있으니, 꼭 필요한 필터만 선택해주세요!",
              );
            }, 100);
          }

          // 폼 데이터 바인딩
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
        console.error("데이터 로드 실패", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilterData();
  }, []);

  const handleFormChange = (key: keyof CheckListForm, value: any) => {
    if (!isFilterActive) return;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const processReset = async (silent = false) => {
    try {
      setIsLoading(true);
      await deleteNotificationFilter();
      await queryClient.invalidateQueries({
        queryKey: ["roommates", "matching"],
      });

      setFormData({
        ...INITIAL_FORM_STATE,
        college: [] as any,
        religion: [] as any,
      });

      if (!silent) {
        alert("필터가 초기화되었습니다.");
        navigate({
          pathname: PATHS.ROOMMATE.ROOT,
          search: "?tab=맞춤+룸메이트",
        });
      }
    } catch (err) {
      if (!silent) alert("처리 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("설정한 모든 필터가 삭제됩니다. 정말 초기화할까요?")) {
      processReset();
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (!checked) {
      if (
        window.confirm("필터를 비활성화하면 설정이 초기화됩니다. 진행할까요?")
      ) {
        await processReset(true);
        setIsFilterActive(false);
      }
    } else {
      setIsFilterActive(true);
    }
  };

  const handleSubmit = async () => {
    const f = formData;
    const filterBody = {
      isActive: isFilterActive,
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
      await queryClient.invalidateQueries({
        queryKey: ["roommates", "matching"],
      });

      alert(
        "맞춤 필터 설정이 완료되었습니다!\n조건이 일치하는 새 글이 올라오면 알려드릴게요😊",
      );
      navigate({
        pathname: PATHS.ROOMMATE.ROOT,
        search: "?tab=맞춤+룸메이트",
      });
    } catch (err) {
      alert("저장 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!isFilterActive) return;
    if (currentStep < TOTAL_STEPS) setCurrentStep((prev) => prev + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const getHeaderInfo = () => {
    const headers = [
      {
        step: "[STEP 1] 기본 정보",
        desc: `원하는 룸메이트의 정보를 입력해보세요!`,
      },
      {
        step: "[STEP 2] 생활 습관",
        desc: `원하는 룸메이트의 생활 습관을 입력해보세요!`,
      },
      {
        step: "[STEP 3] 생활 리듬",
        desc: `원하는 룸메이트의 생활 리듬을 입력해보세요!`,
      },
      {
        step: "[STEP 4] 성향",
        desc: `원하는 룸메이트의 성향을 입력해보세요!`,
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

      {currentStep === 1 && (
        <StickyToggleArea>
          <ToggleLine checked={isFilterActive} onToggle={handleToggle} />
          <DescriptionArea>
            원하는 조건과 일치하는 글을 모아보고, 새 글이 올라오면 알림을 받을
            수 있습니다. 너무 많은 필터 선택은 룸메이트를 구하기 어려울 수
            있으니, 꼭 필요한 필터만 선택해주세요.
          </DescriptionArea>
        </StickyToggleArea>
      )}

      <StepHeaderArea $disabled={!isFilterActive}>
        <StepLabel>{header.step}</StepLabel>
        <StepDesc>{header.desc}</StepDesc>
      </StepHeaderArea>

      <ContentArea $disabled={!isFilterActive}>
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
            disabled={!isFilterActive}
          />
        </ButtonContainer>
        <ButtonContainer $flex={3}>
          <SquareButton
            variant="primary"
            text={currentStep === TOTAL_STEPS ? "설정 완료" : "다음 단계"}
            onClick={handleNext}
            disabled={!isFilterActive}
          />
        </ButtonContainer>
      </BottomNav>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding-bottom: 100px;
  padding-top: 4px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fafafa;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: #eee;
  position: fixed;
  top: 70px;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
`;

const ProgressFill = styled.div<{ width: number }>`
  height: 6px;
  width: ${(props) => props.width}%;
  background-color: #ffc107;
  border-radius: 4px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const StickyToggleArea = styled.div`
  padding: 16px 16px 0;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DescriptionArea = styled.div`
  padding: 0 16px;
  box-sizing: border-box;
  font-size: small;
  color: gray;
`;

const StepHeaderArea = styled.div<{ $disabled?: boolean }>`
  padding: 24px 16px 0;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
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

const ContentArea = styled.div<{ $disabled?: boolean }>`
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  ${(props) =>
    props.$disabled &&
    `
    pointer-events: none;
    opacity: 0.5;
    filter: grayscale(1);
  `}
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
