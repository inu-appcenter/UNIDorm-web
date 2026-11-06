// components/Onboarding.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import RoundSquareButton from "../components/button/RoundSquareButton.tsx";

import onboarding1 from "../assets/onboarding/onboarding1.webp";
// import onboarding2 from "../assets/onboarding/onboarding2.webp";
// import onboarding3 from "../assets/onboarding/onboarding3.webp";
import onboarding4 from "../assets/onboarding/onboarding4.webp";
// import onboarding5 from "../assets/onboarding/onboarding5.webp";
import 민원접수 from "../assets/민원접수.svg";

import 로고 from "../assets/unidorm-logo.webp";
import TermOfUse from "../components/TermOfUse.tsx";
import { useNavigate } from "react-router-dom";

const SLIDE_DURATION = 3000;

// 온보딩에 사용되는 이미지 에셋 목록
const PRELOAD_IMAGES = [로고, onboarding1, 민원접수, onboarding4];

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
  // {
  //   id: 2,
  //   title: "공동구매",
  //   content: "배달음식, 식자재, 생활용품 등 함께 공동구매해서 절약해보세요!",
  //   image: onboarding2,
  // },
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
        <LogoInText
          src={로고}
          alt="Unidorm 로고"
          loading="eager"
          decoding="sync"
          draggable={false}
        />
        {parts[1]}
      </FirstSlideText>
    </FirstSlideWrapper>
  );
};

const FirstSlideWrapper = styled.div`
  width: 85%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 32px;
  font-weight: 700;
  color: #191f28;
  text-align: center;
`;

const FirstSlideText = styled.div`
  color: #191f28;
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.45;
  display: inline;
  word-break: keep-all;
`;

const LogoInText = styled.img`
  height: 64px;
  vertical-align: -0.12em;
  display: inline;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
`;

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLastSlide = currentIndex === slides.length - 1;

  // 좌우 드래그/스와이프 상태
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);
  const hasMoved = useRef(false);

  // 모든 온보딩 이미지 사전 로딩 (브라우저 캐시 적재)
  useEffect(() => {
    PRELOAD_IMAGES.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  const goToNextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, []);

  const goToPrevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // 자동 진행 타이머
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isLastSlide && !isDragging) {
      timerRef.current = setTimeout(goToNextSlide, SLIDE_DURATION);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isLastSlide, isDragging, goToNextSlide]);

  // 드래그 제스처 핸들러
  const onDragStart = (clientX: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsDragging(true);
    dragStartX.current = clientX;
    dragStartTime.current = Date.now();
    hasMoved.current = false;
    setDragOffset(0);
  };

  const onDragMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartX.current;
    if (Math.abs(deltaX) > 5) {
      hasMoved.current = true;
    }

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === slides.length - 1;

    // 양 끝 경계에서는 탄성 댐핑
    if ((isFirst && deltaX > 0) || (isLast && deltaX < 0)) {
      setDragOffset(deltaX * 0.25);
    } else {
      setDragOffset(deltaX);
    }
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaTime = Math.max(Date.now() - dragStartTime.current, 1);
    const velocity = Math.abs(dragOffset) / deltaTime;
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === slides.length - 1;

    // 50px 이상 드래그하거나 빠른 플릭 시 이동
    if (dragOffset < -50 || (dragOffset < -20 && velocity > 0.3)) {
      if (!isLast) {
        goToNextSlide();
      }
    } else if (dragOffset > 50 || (dragOffset > 20 && velocity > 0.3)) {
      if (!isFirst) {
        goToPrevSlide();
      }
    } else if (!hasMoved.current) {
      // 드래그 없는 단순 탭/클릭 시 좌우 분기 이동
      const screenWidth = window.innerWidth;
      if (dragStartX.current < screenWidth / 2) {
        if (!isFirst) goToPrevSlide();
      } else {
        if (!isLast) goToNextSlide();
      }
    }

    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    onDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    onDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    onDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) onDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    onDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    onDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    onDragEnd();
  };

  const handleStart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    localStorage.setItem("isFirstVisit(10.20)", "false");
    navigate("/home");
  };

  const handleJump = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    setCurrentIndex(slides.length - 1);
  };

  return (
    <Wrapper>
      {/* 상단 프로그레스 및 건너뛰기 버튼 (플로팅) */}
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
          <SkipButton $isVisible={!isLastSlide} onClick={(e) => handleJump(e)}>
            건너뛰기
          </SkipButton>
        </TopRight>
      </TopSection>

      {/* 중앙 슬라이더 뷰포트 (드래그/터치 제스처 영역) */}
      <SliderViewport
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <SliderTrack
          $isDragging={isDragging}
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {slides.map((slide, index) => {
            const isLast = index === slides.length - 1;

            return (
              <SlideItem key={slide.id} $isLast={isLast}>
                {slide.id === 0 ? (
                  <FirstSlide title={slide.title} />
                ) : (
                  <Content>
                    <TitleTextWrapper>
                      <Title>{slide.title}</Title>
                      <Text>{slide.content}</Text>
                      {slide.subContent && (
                        <SubText>{slide.subContent}</SubText>
                      )}
                    </TitleTextWrapper>

                    {slide.image && (
                      <SlideImage
                        src={slide.image}
                        alt={slide.title}
                        loading="eager"
                        decoding="sync"
                        draggable={false}
                      />
                    )}
                  </Content>
                )}
              </SlideItem>
            );
          })}
        </SliderTrack>
      </SliderViewport>

      {/* 하단 약관 및 시작하기 버튼 (마지막 슬라이드에서 부드럽게 부상) */}
      <Bottom $isVisible={isLastSlide} onClick={(e) => e.stopPropagation()}>
        <TermOfUse />
        <div>
          <RoundSquareButton
            btnName={"UNI Dorm 시작하기"}
            onClick={handleStart}
          />
        </div>
      </Bottom>
    </Wrapper>
  );
};

export default OnboardingPage;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
  height: 100%;
  user-select: none;
  touch-action: pan-y;
`;

const TopSection = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px 20px 0 20px;
  padding-top: calc(32px + var(--safe-area-top, 0px));
  box-sizing: border-box;
  z-index: 10;
  pointer-events: none;
`;

const ProgressContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  pointer-events: auto;
`;

const TopRight = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  min-height: 24px;
  box-sizing: border-box;
  pointer-events: auto;
`;

const SkipButton = styled.button<{ $isVisible: boolean }>`
  font-size: 16px;
  color: #191f28;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  visibility: ${({ $isVisible }) => ($isVisible ? "visible" : "hidden")};
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity 150ms ease;
  padding: 0;
`;

const SliderViewport = styled.div`
  width: 100%;
  height: 100%;
  flex: 1;
  overflow: hidden;
  display: flex;
  position: relative;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const SliderTrack = styled.div<{ $isDragging: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  transition: ${({ $isDragging }) =>
    $isDragging ? "none" : "transform 350ms cubic-bezier(0.16, 1, 0.3, 1)"};
  will-change: transform;
`;

const SlideItem = styled.div<{ $isLast: boolean }>`
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 1.5rem;
  padding-top: calc(50px + var(--safe-area-top, 0px));
  padding-bottom: ${({ $isLast }) =>
    $isLast
      ? "calc(160px + var(--safe-area-bottom, 0px))"
      : "calc(50px + var(--safe-area-bottom, 0px))"};
`;

const Content = styled.div`
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
`;

const TitleTextWrapper = styled.div`
  width: 90%;
  height: fit-content;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #191f28;
  margin-bottom: 0.75rem;
  word-break: keep-all;
`;

const Text = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.45;
  white-space: pre-line;
  word-break: keep-all;
  margin: 0;
`;

const SubText = styled.p`
  font-size: 12px;
  color: #8b95a1;
  line-height: 1.4;
  white-space: pre-line;
  word-break: keep-all;
  margin-top: 6px;
  margin-bottom: 0;
`;

const SlideImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 210px;
  object-fit: contain;
  margin-top: 36px;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
`;

const Bottom = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0 20px calc(20px + var(--safe-area-bottom, 0px)) 20px;
  box-sizing: border-box;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 16px;
  visibility: ${({ $isVisible }) => ($isVisible ? "visible" : "hidden")};
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: translateY(${({ $isVisible }) => ($isVisible ? "0px" : "12px")});
  transition: opacity 250ms ease, transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: ${({ $isVisible }) => ($isVisible ? "auto" : "none")};
`;

interface ProgressProps {
  active?: boolean;
  total: number;
}

const ProgressBarWrapper = styled.div<ProgressProps>`
  height: 4px;
  width: ${(props) => 100 / props.total}%;
  background-color: #ddd;
  border-radius: 999px;
  overflow: hidden;
`;

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
