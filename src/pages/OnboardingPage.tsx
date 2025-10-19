// components/Onboarding.tsx
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import RoundSquareButton from "../components/button/RoundSquareButton.tsx";

import onboarding1 from "../assets/onboarding/onboarding1.webp";
import onboarding2 from "../assets/onboarding/onboarding2.webp";
// import onboarding3 from "../assets/onboarding/onboarding3.webp";
import onboarding4 from "../assets/onboarding/onboarding4.webp";
// import onboarding5 from "../assets/onboarding/onboarding5.webp";
import 민원접수 from "../assets/민원접수.svg";

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
    content: "배달음식, 식자재, 생활용품 등 함께 공동구매해서 절약해보세요!",
    image: onboarding2,
  },
  {
    id: 3,
    title: "생활원 민원 작성",
    content:
      "기숙사를 살면서 발생한 불편사항을 간편하게 접수하고, 답변이 등록되면 알림으로 알려드려요.",
    image: 민원접수,
  },
  {
    id: 4,
    title: "푸시알림으로 놓치지 마세요",
    content:
      "기숙사 공지사항 및 이벤트, 공동구매 새 글 알림 등 알림 기능으로 놓치지 마세요!",
    subContent: "*스토어에서 앱 설치 시 사용할 수 있습니다.",
    image: onboarding4,
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
  //height: 100%;
  flex: 1;
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
    localStorage.setItem("isFirstVisit(10.20)", "false");

    navigate("/home");
  };

  const { id, title, content, subContent, image } = slides[currentIndex];

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

        {/*<TopRight>*/}
        {/*  <SkipButton onClick={handleStart}>건너뛰기</SkipButton>*/}
        {/*</TopRight>*/}
      </TopSection>

      {id === 0 ? (
        <FirstSlide title={title} />
      ) : (
        <Content>
          <TitleTextWrapper>
            <Title>{title}</Title>
            <Text>{content}</Text>
            <Text style={{ fontSize: "12px" }}>{subContent}</Text>
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
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  overflow-y: auto;
  width: 100%;
`;

// const TopRight = styled.div`
//   width: 100%;
//   display: flex;
//   justify-content: flex-end;
//   //padding: 1rem;
//   box-sizing: border-box;
// `;

const TopSection = styled.div`
  width: 100%;
  padding: 20px;
  padding-top: 32px;
  box-sizing: border-box;
`;

// const SkipButton = styled.button`
//   font-size: 16px;
//   color: black;
//   font-weight: 600;
//   background: none;
//   border: none;
//   cursor: pointer;
// `;

const Content = styled.div`
  width: 100%;
  //height: 100%;
  flex: 1;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 1.5rem;
  box-sizing: border-box;

  //margin-top: 10vh; // 여기서 높이 조절
  margin-bottom: auto; // 아래 영역 확보
`;

const TitleTextWrapper = styled.div`
  width: 90%;
  height: fit-content;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #000;
  margin-bottom: 0.75rem;

  word-break: keep-all;
`;

const Text = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  //margin: 0 0 1.5rem;
  white-space: pre-line;
  word-break: keep-all;
  margin: 0;
  //padding: 0;
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
  padding: 20px;
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

// const ButtonWrapper = styled.div`
//   width: 100%;
//   height: fit-content;
//   position: fixed;
//   bottom: 0;
//   left: 0;
//   padding: 16px;
//   box-sizing: border-box;
//   background: rgba(244, 244, 244, 0.6);
//   backdrop-filter: blur(10px);
//   -webkit-backdrop-filter: blur(10px);
// `;
