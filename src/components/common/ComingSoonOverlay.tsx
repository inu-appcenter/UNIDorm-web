// ComingSoonOverlay.tsx

import { FC } from "react";
import styled from "styled-components";
import 눈물닦아주는횃불이 from "../../assets/눈물 닦아주는 횃불이.webp";

// 1. Props 타입 정의 (스타일 컴포넌트에도 사용됨)
interface ComingSoonOverlayProps {
  /** 오버레이 중앙에 표시할 메시지 */
  message?: string;
  subMessage?: string;
  /** (선택 사항) 이미지에 대한 대체 텍스트 */
  imageAlt?: string;
}

// 3. ComingSoonOverlay 컴포넌트 정의
const ComingSoonOverlay: FC<ComingSoonOverlayProps> = ({
  message,
  subMessage,
  imageAlt = "준비 중 이미지",
}) => {
  return (
    <OverlayContainer>
      {/* 1. 블러 배경 (아래 콘텐츠에 블러 효과 적용) */}
      <BlurryBackground />

      {/* 2. 중앙 콘텐츠 */}
      <ContentContainer>
        <ComingSoonImage src={눈물닦아주는횃불이} alt={imageAlt} />
        <MessageWrapper>
          <MessageText>{message}</MessageText>
          <SubMessageText>{subMessage}</SubMessageText>
        </MessageWrapper>
      </ContentContainer>
    </OverlayContainer>
  );
};

export default ComingSoonOverlay;

// 2-1. 전체 화면을 덮고 중앙 정렬을 위한 컨테이너
const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 101;

  /* 중앙 정렬 */
  display: flex;
  justify-content: center;
  align-items: center;

  /* 배경 콘텐츠 위에 투명한 오버레이 효과를 주기 위해 rgba 사용 */
  background-color: rgba(255, 255, 255, 0.3);
  overflow: hidden;
`;

// 2-2. 배경 블러 처리를 위한 요소 (오버레이 아래 콘텐츠를 블러 처리)
const BlurryBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  /* **핵심:** backdrop-filter를 사용하여 오버레이 아래의 요소들을 블러 처리 */
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px); /* Safari 지원 */
`;

// 2-3. 중앙에 위치할 이미지와 메시지를 감싸는 컨테이너
const ContentContainer = styled.div`
  z-index: 2; /* 블러 배경보다 위에 위치 */
  text-align: center;
  //padding: 30px 40px;
  //box-sizing: border-box;
  //background-color: #ffffff;
  //border-radius: 12px;
  //box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 애니메이션 추가 (선택 사항) */
  transform: translateY(0);
  transition: transform 0.3s ease-out;

  gap: 24px;
`;

// 2-4. Coming Soon 이미지 스타일
const ComingSoonImage = styled.img`
  width: 50%;
  //height: 120px;
  object-fit: contain;
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

// 2-5. 메시지 텍스트 스타일
const MessageText = styled.div`
  color: #01499a;
  text-align: center;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 160.5%; /* 32.1px */
  letter-spacing: 0.38px;
`;

const SubMessageText = styled.div`
  color: var(--1, #1c1c1e);
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 160.5%;
  letter-spacing: 0.38px;
`;
