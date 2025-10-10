// components/Onboarding.tsx
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import RoundSquareButton from "../components/button/RoundSquareButton.tsx";

import onboarding1 from "../assets/onboarding/onboarding1.webp";
import onboarding2 from "../assets/onboarding/onboarding2.webp";
import onboarding3 from "../assets/onboarding/onboarding3.webp";
import { useNavigate } from "react-router-dom";
import 로고 from "../assets/unidorm-logo.webp";
import TermOfUse from "../components/TermOfUse.tsx";

const SLIDE_DURATION = 5000;

const slides = [
  {
    id: 0,
    title: "UNI Dorm에서 할 수 있는 다양한 경험을 알아보세요!",
    content: "",
    image: null,
  },
  {
    id: 1,
    title: "룸메이트 매칭",
    content:
      "UNI Dorm은 개인별 생활 패턴 체크리스트를 기반으로, 나와 가장 비슷한 룸메이트를 추천해줍니다.",
    image: onboarding1,
  },
  {
    id: 2,
    title: "공동구매",
    content:
      "기숙사 UNI들과 배달음식, 식자재, 생활용품 등 함께 공동구매해서 절약해보세요!\n(9월 중 공개 예정)",
    image: onboarding2,
  },
  {
    id: 3,
    title: "기숙사 정보와 Tips",
    content:
      "인천대학교 기숙사에서 제공하는 소식과 기숙사생들이 공유하는 다양한 기숙사 꿀팁을 만나보세요.",
    image: onboarding3,
  },
];

const FirstSlide = ({ title }: { title: string }) => {
  const parts = title.split("UNI Dorm");

  return (
    <FirstSlideWrapper>
      <FirstSlideText>
        {parts[0]}
        <LogoInText src={로고} alt="Unidorm 로고" />
        {parts[1]}
      </FirstSlideText>
    </FirstSlideWrapper>
  );
};

const FirstSlideWrapper = styled.div`
  width: 80%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  font-size: 36px;
  font-weight: 700;
  color: #000;
  text-align: center;
`;

const FirstSlideText = styled.div`
  color: #000;
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.4;
  display: inline;
  word-break: keep-all;
`;

const LogoInText = styled.img`
  height: 70px;
  vertical-align: -0.1em; // 살짝 아래로 내림 (기본은 baseline)
  display: inline;
`;

const OnboardingPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLastSlide = currentIndex === slides.length - 1;
  const isFirstSlide = currentIndex === 0;

  const navigate = useNavigate();

  const goToNextSlide = () => {
    if (!isLastSlide) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    if (!isFirstSlide) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(goToNextSlide, SLIDE_DURATION);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex]);

  // 터치 이벤트 핸들러: 터치 위치에 따라 이전/다음 슬라이드 이동
  const handleTouch = (e: React.MouseEvent<HTMLDivElement>) => {
    resetTimer();
    const touchX = e.clientX;
    const screenWidth = window.innerWidth;

    if (touchX < screenWidth / 2) {
      goToPrevSlide();
    } else {
      goToNextSlide();
    }
  };

  const handleStart = () => {
    localStorage.setItem("isFirstVisit", "false");

    navigate("/home");
  };

  const { id, title, content, image } = slides[currentIndex];

  return (
    <Wrapper onClick={handleTouch}>
      <TopSection>
        <ProgressContainer>
          {slides.map((_, index) => {
            const status: "filled" | "active" | "empty" =
              index < currentIndex
                ? "filled"
                : index === currentIndex
                  ? "active"
                  : "empty";

            return (
              <ProgressBarWrapper key={index} total={slides.length}>
                <ProgressFill status={status} />
              </ProgressBarWrapper>
            );
          })}
        </ProgressContainer>

        <TopRight>
          <SkipButton onClick={handleStart}>건너뛰기</SkipButton>
        </TopRight>
      </TopSection>

      {id === 0 ? (
        <FirstSlide title={title} />
      ) : (
        <Content>
          <TitleTextWrapper>
            <Title>{title}</Title>
            <Text>{content}</Text>
          </TitleTextWrapper>

          <Image src={image ?? undefined} alt={title} />
        </Content>
      )}

      <Bottom>
        {isLastSlide && (
          <>
            <TermOfUse />
            <div>
              <RoundSquareButton
                btnName={"UNI Dorm 시작하기"}
                onClick={handleStart}
              />
            </div>
          </>
        )}
      </Bottom>
    </Wrapper>
  );
};

export default OnboardingPage;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; // 기존 space-between에서 변경
  position: relative;
`;

const TopRight = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  //padding: 1rem;
  box-sizing: border-box;
`;

const TopSection = styled.div`
  width: 100%;
  padding: 1rem 1.5rem 0;
  padding-top: 32px;
  box-sizing: border-box;
`;

const SkipButton = styled.button`
  font-size: 16px;
  color: black;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
`;

const Content = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 1.5rem;
  box-sizing: border-box;

  margin-top: 10vh; // 여기서 높이 조절
  margin-bottom: auto; // 아래 영역 확보
`;

const TitleTextWrapper = styled.div`
  width: 90%;
  height: fit-content;
`;

const Title = styled.h2`
  font-size: 30px;
  font-weight: 700;
  color: #000;
  margin-bottom: 0.75rem;
`;

const Text = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 1.5rem;
  white-space: pre-line;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: contain;
  //margin-top: auto;
  margin-top: 40px;
  margin-bottom: 2rem;
`;

const Bottom = styled.div`
  width: 100%;
  padding: 0 1.5rem 2.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProgressContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

interface ProgressProps {
  active?: boolean; // 혹시 쓰는 곳 있으면
  total: number;
}

const ProgressBarWrapper = styled.div<ProgressProps>`
  height: 4px;
  width: ${(props) => 100 / props.total}%;
  background-color: #ddd;
  border-radius: 999px;
  overflow: hidden;
`;

// ProgressFill.tsx
const ProgressFill = styled.div<{
  status: "filled" | "active" | "empty";
}>`
  height: 100%;
  background-color: #0a84ff;
  width: ${({ status }) =>
    status === "filled" ? "100%" : status === "empty" ? "0%" : "100%"};
  transition: ${({ status }) =>
    status === "active" ? `width ${SLIDE_DURATION}ms linear` : "none"};
  ${({ status }) =>
    status === "active" &&
    `
    width: 0%;
    animation: fillBar ${SLIDE_DURATION}ms linear forwards;
  `}

  @keyframes fillBar {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }
`;
