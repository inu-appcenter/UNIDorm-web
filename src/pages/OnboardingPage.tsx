import React, { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import dormIdCardSvg from "@/assets/onboarding/dorm-id-card.svg";
import globeSvg from "@/assets/onboarding/globe.svg";
import roommateBubbleBackSvg from "@/assets/onboarding/roommate-bubble-back.svg";
import roommateBubbleFrontSvg from "@/assets/onboarding/roommate-bubble-front.svg";
import speechBubbleSvg from "@/assets/onboarding/speech-bubble.svg";
import unidormLogo from "@/assets/unidorm-logo.webp";
import RoundSquareButton from "@/components/button/RoundSquareButton";
import TermOfUse from "@/components/TermOfUse";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { useLanguageStore, type Language } from "@/stores/useLanguageStore";
import { colors, typography } from "@/styles/tokens";

const TOTAL_STEPS = 3;
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.28,
      ease: EASE_OUT_EXPO,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -20 : 20,
    transition: {
      duration: 0.2,
      ease: EASE_OUT_EXPO,
    },
  }),
};

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("onboarding");
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const prefersReducedMotion = useReducedMotion();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const swipeStartXRef = useRef<number | null>(null);

  const isLastStep = step === TOTAL_STEPS - 1;

  const goToStep = useCallback(
    (nextStep: number) => {
      if (nextStep < 0 || nextStep >= TOTAL_STEPS || nextStep === step) return;
      setDirection(nextStep > step ? 1 : -1);
      setStep(nextStep);
    },
    [step],
  );

  const handleComplete = useCallback(() => {
    localStorage.setItem("isFirstVisit(10.20)", "false");
    navigate("/home");
  }, [navigate]);

  const handlePrimaryAction = () => {
    if (isLastStep) {
      handleComplete();
      return;
    }
    goToStep(step + 1);
  };

  const handleSkip = () => {
    goToStep(TOTAL_STEPS - 1);
  };

  const handleLanguageSelect = (nextLang: Language) => {
    setLanguage(nextLang);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (step === 0) return;
    swipeStartXRef.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (step === 0 || swipeStartXRef.current === null) return;
    const deltaX = e.clientX - swipeStartXRef.current;
    swipeStartXRef.current = null;

    if (deltaX < -48 && step < TOTAL_STEPS - 1) {
      goToStep(step + 1);
    } else if (deltaX > 48 && step > 0) {
      goToStep(step - 1);
    }
  };

  const roommateTags = t("step3.card.tags", {
    returnObjects: true,
  }) as string[];

  const ctaLabel =
    step === 0
      ? t("step1.cta")
      : step === 1
        ? t("step2.cta")
        : t("step3.cta");

  const floatAnimation = prefersReducedMotion
    ? undefined
    : {
        y: [0, -4, 0],
        transition: {
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  return (
    <Wrapper
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        swipeStartXRef.current = null;
      }}
    >
      <Header>
        <HeaderLogo src={unidormLogo} alt="UNI Dorm 로고" draggable={false} />

        {step > 0 && (
          <SkipButton type="button" onClick={handleSkip}>
            {t("header.skip")}
          </SkipButton>
        )}
      </Header>

      <MainArea>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <StepContainer
            key={step}
            custom={direction}
            variants={prefersReducedMotion ? undefined : stepVariants}
            initial={prefersReducedMotion ? false : "enter"}
            animate="center"
            exit={prefersReducedMotion ? undefined : "exit"}
          >
            <TitleGroup>
              <StepIndicator role="tablist" aria-label="Onboarding steps">
                {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
                  <IndicatorDot
                    key={idx}
                    $active={idx === step}
                    aria-current={idx === step ? "step" : undefined}
                  />
                ))}
              </StepIndicator>

              <Title>
                {step === 0
                  ? t("step1.title")
                  : step === 1
                    ? t("step2.title")
                    : t("step3.title")}
              </Title>
              <Subtitle>
                {step === 0
                  ? t("step1.subtitle")
                  : step === 1
                    ? t("step2.subtitle")
                    : t("step3.subtitle")}
              </Subtitle>
            </TitleGroup>

            {step === 0 && (
              <StepOneBody>
                <PreviewBox>
                  <GlobeStage animate={floatAnimation}>
                    <GlobeImage src={globeSvg} alt="" draggable={false} />
                    <SpeechBubbleImage
                      src={speechBubbleSvg}
                      alt=""
                      draggable={false}
                      initial={
                        prefersReducedMotion ? false : { opacity: 0, scale: 0.86 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.1,
                        duration: 0.3,
                        ease: EASE_OUT_EXPO,
                      }}
                    />
                  </GlobeStage>
                </PreviewBox>

                <LanguageList role="radiogroup" aria-label="Language selection">
                  {SUPPORTED_LANGUAGES.map((langOption) => {
                    const selected = language === langOption;
                    return (
                      <LanguageCard
                        key={langOption}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        $selected={selected}
                        whileTap={
                          prefersReducedMotion ? undefined : { scale: 0.985 }
                        }
                        onClick={() => handleLanguageSelect(langOption)}
                      >
                        <LanguageLabel>
                          {t(`languageOptions.${langOption}`)}
                        </LanguageLabel>
                        <LanguageCheck $selected={selected} aria-hidden="true">
                          {selected ? (
                            <Check size={18} strokeWidth={2.6} />
                          ) : (
                            <UnselectedCircle />
                          )}
                        </LanguageCheck>
                      </LanguageCard>
                    );
                  })}
                </LanguageList>
              </StepOneBody>
            )}

            {step === 1 && (
              <FeaturePreviewCard>
                <IllustrationStage animate={floatAnimation}>
                  <DormCardImage
                    src={dormIdCardSvg}
                    alt=""
                    draggable={false}
                  />
                </IllustrationStage>

                <InnerInfoCard
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, y: 8 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.08,
                    duration: 0.28,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <CardTopBlock>
                    <CardTitle>{t("step2.card.dormIdTitle")}</CardTitle>
                    <CardActionLink>
                      {t("step2.card.dormIdAction")} <Chevron>›</Chevron>
                    </CardActionLink>
                  </CardTopBlock>

                  <CardDivider />

                  <CardNoticeRow>
                    <CardNoticeText>
                      {t("step2.card.noticeTitle")}
                    </CardNoticeText>
                    <CardNoticeChevron aria-hidden="true">›</CardNoticeChevron>
                  </CardNoticeRow>
                </InnerInfoCard>
              </FeaturePreviewCard>
            )}

            {step === 2 && (
              <FeaturePreviewCard>
                <RoommateIllustrationStage animate={floatAnimation}>
                  <BubbleBackWrapper>
                    <BubbleImage
                      src={roommateBubbleBackSvg}
                      alt=""
                      draggable={false}
                    />
                  </BubbleBackWrapper>
                  <BubbleFrontWrapper
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.08,
                      duration: 0.3,
                      ease: EASE_OUT_EXPO,
                    }}
                  >
                    <BubbleImage
                      src={roommateBubbleFrontSvg}
                      alt=""
                      draggable={false}
                    />
                  </BubbleFrontWrapper>
                </RoommateIllustrationStage>

                <InnerInfoCard
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, y: 8 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.08,
                    duration: 0.28,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <CardTitle>{t("step3.card.title")}</CardTitle>
                  <ChipRow>
                    {Array.isArray(roommateTags) &&
                      roommateTags.map((tag) => (
                        <TagChip key={tag}>{tag}</TagChip>
                      ))}
                  </ChipRow>
                  <CardActionLink $spaced>
                    {t("step3.card.action")} <Chevron>›</Chevron>
                  </CardActionLink>
                </InnerInfoCard>
              </FeaturePreviewCard>
            )}
          </StepContainer>
        </AnimatePresence>
      </MainArea>

      <Footer>
        {isLastStep && (
          <TermsWrapper
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
          >
            <TermOfUse />
          </TermsWrapper>
        )}

        <PrimaryCTAButton
          btnName={ctaLabel}
          color={colors.cta.default}
          onClick={handlePrimaryAction}
        />
      </Footer>
    </Wrapper>
  );
};

export default OnboardingPage;

const Wrapper = styled.div`
  width: 100%;
  max-width: 440px;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding-top: max(var(--safe-area-top, 0px), env(safe-area-inset-top, 0px));
  padding-bottom: max(
    var(--safe-area-bottom, 0px),
    env(safe-area-inset-bottom, 0px)
  );
  padding-left: max(var(--safe-area-left, 0px), env(safe-area-inset-left, 0px));
  padding-right: max(
    var(--safe-area-right, 0px),
    env(safe-area-inset-right, 0px)
  );
  user-select: none;
  touch-action: pan-y;
`;

const Header = styled.header`
  height: 70px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  box-sizing: border-box;
`;

const HeaderLogo = styled.img`
  width: 60px;
  height: auto;
  display: block;
  object-fit: contain;
  pointer-events: none;
`;

const SkipButton = styled.button`
  ${typography.label1Normal}
  font-weight: 600;
  background: none;
  border: none;
  padding: 8px 4px;
  color: ${colors.text.text2};
  cursor: pointer;
  transition: opacity 150ms ease;

  &:active {
    opacity: 0.6;
  }
`;

const MainArea = styled.main`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 16px 24px 8px;
  box-sizing: border-box;
  overflow: hidden;
`;

const StepContainer = styled(motion.div)`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TitleGroup = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IndicatorDot = styled.span<{ $active: boolean }>`
  height: 6px;
  width: ${({ $active }) => ($active ? "18px" : "7px")};
  border-radius: 3px;
  background-color: ${({ $active }) =>
    $active ? colors.main.main2 : colors.blue.blue100};
  transition:
    width 260ms cubic-bezier(0.16, 1, 0.3, 1),
    background-color 260ms ease;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.192px;
  color: ${colors.text.text1};
  white-space: pre-line;
  word-break: keep-all;
`;

const Subtitle = styled.p`
  ${typography.body1Reading}
  margin: 0;
  color: ${colors.text.text2};
  word-break: keep-all;
`;

const StepOneBody = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const PreviewBox = styled.div`
  flex-shrink: 0;
  background-color: ${colors.bg.bg2};
  border-radius: 24px;
  height: 152px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const GlobeStage = styled(motion.div)`
  position: relative;
  width: 240px;
  height: 150px;
`;

const GlobeImage = styled.img`
  width: 240px;
  height: 150px;
  display: block;
  pointer-events: none;
`;

const SpeechBubbleImage = styled(motion.img)`
  position: absolute;
  left: 147px;
  top: 80px;
  width: 66px;
  height: 57px;
  pointer-events: none;
`;

const LanguageList = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const LanguageCard = styled(motion.button)<{ $selected: boolean }>`
  flex-shrink: 0;
  width: 100%;
  height: 52px;
  padding: 0 20px 0 18px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-sizing: border-box;
  background-color: ${({ $selected }) =>
    $selected ? colors.blue.blue100 : colors.bg.bg1};
  border: 1px solid
    ${({ $selected }) => ($selected ? "transparent" : colors.gray.gray200)};
  transition:
    background-color 200ms ease,
    border-color 200ms ease;
`;

const LanguageLabel = styled.span`
  ${typography.headline1}
  font-weight: 600;
  color: ${colors.text.text1};
`;

const LanguageCheck = styled.span<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: ${({ $selected }) =>
    $selected ? colors.main.main2 : colors.gray.gray300};
  transition: color 200ms ease;
`;

const UnselectedCircle = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid ${colors.gray.gray300};
  box-sizing: border-box;
`;

const FeaturePreviewCard = styled.div`
  background-color: ${colors.bg.bg2};
  border-radius: 24px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const IllustrationStage = styled(motion.div)`
  width: 240px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DormCardImage = styled.img`
  width: 240px;
  height: 150px;
  display: block;
  pointer-events: none;
`;

const RoommateIllustrationStage = styled(motion.div)`
  position: relative;
  width: 240px;
  height: 150px;
`;

const BubbleBackWrapper = styled.div`
  position: absolute;
  right: 14%;
  top: 30%;
  width: 44%;
  height: 60%;
  transform: rotate(9deg);
`;

const BubbleFrontWrapper = styled(motion.div)`
  position: absolute;
  left: 14%;
  top: 12%;
  width: 52%;
  height: 74%;
  transform: rotate(-9deg);
`;

const BubbleImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  pointer-events: none;
`;

const InnerInfoCard = styled(motion.div)`
  width: 100%;
  background-color: ${colors.bg.bg1};
  border-radius: 18px;
  padding: 16px 18px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const CardTopBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.p`
  ${typography.headline1}
  font-weight: 600;
  margin: 0;
  color: ${colors.text.text1};
`;

const CardActionLink = styled.span<{ $spaced?: boolean }>`
  ${typography.body2Normal}
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${colors.main.main2};
  margin-top: ${({ $spaced }) => ($spaced ? "22px" : "0")};
`;

const Chevron = styled.span`
  font-size: 17px;
  line-height: 1;
`;

const CardDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${colors.blue.blue100};
  margin: 14px 0;
`;

const CardNoticeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const CardNoticeText = styled.span`
  ${typography.body2Normal}
  font-weight: 600;
  color: ${colors.text.text1};
`;

const CardNoticeChevron = styled.span`
  font-size: 19px;
  font-weight: 400;
  line-height: 1;
  color: ${colors.text.text1};
`;

const ChipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
`;

const TagChip = styled.span`
  ${typography.label2}
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 13px;
  background-color: ${colors.blue.blue100};
  color: ${colors.main.main2};
  line-height: 1.2;
  white-space: nowrap;
`;

const Footer = styled.footer`
  padding: 10px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex-shrink: 0;
  box-sizing: border-box;
`;

const TermsWrapper = styled(motion.div)`
  width: 100%;
`;

const PrimaryCTAButton = styled(RoundSquareButton)`
  min-height: 56px;
  border-radius: 16px;
`;
