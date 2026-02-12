import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import linkify from "../../utils/linkfy.tsx";

interface LinkItem {
  title: string;
  link: string;
}

interface Props {
  id: string;
  title?: string;
  text?: string;
  children?: React.ReactNode;
  links?: LinkItem[];

  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function HomeNoticeBottomSheet({
  id,
  title,
  text,
  children,
  links = [],
  isOpen,
  setIsOpen,
}: Props) {
  const initialized = useRef(false);

  // 1. 로컬 스토리지 체크 (숨김 처리 확인)
  useEffect(() => {
    if (initialized.current) return;
    try {
      const hiddenModals = JSON.parse(
        localStorage.getItem("hiddenModals") || "[]",
      );
      if (hiddenModals.includes(id)) {
        setIsOpen(false);
      }
    } catch (e) {
      console.error("Local storage error", e);
    }
    initialized.current = true;
  }, [id, setIsOpen]);

  // 2. '다시 보지 않기' 처리
  const handleHideForever = () => {
    try {
      const hiddenModals = JSON.parse(
        localStorage.getItem("hiddenModals") || "[]",
      );
      if (!hiddenModals.includes(id)) {
        hiddenModals.push(id);
        localStorage.setItem("hiddenModals", JSON.stringify(hiddenModals));
      }
    } catch (e) {
      console.error("Local storage error", e);
    }
    setIsOpen(false);
  };

  // 3. 드래그로 닫기 로직
  const onDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > 100) {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 (클릭 시 닫힘) */}
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* 바텀시트 컨테이너 */}
          <SheetContainer
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }} // 위로는 못 올라감
            dragElastic={0.2} // 탄성 효과
            onDragEnd={onDragEnd}
          >
            {/* 드래그 핸들 (시각적 요소) */}
            <HandleArea>
              <HandleBar />
            </HandleArea>

            {/* [1] 상단 고정: 타이틀 */}
            <FixedHeader>
              <h2>{title}</h2>
            </FixedHeader>

            {/* [2] 중간 스크롤: 텍스트 + 자식 컴포넌트 */}
            <ScrollContent>
              <ContentInner>
                {/* 텍스트 설명 */}
                {text && <DescriptionText>{linkify(text)}</DescriptionText>}

                {/* 메인 컨텐츠 */}
                <BodyContent>
                  {children}

                  {links.length > 0 && (
                    <LinksWrapper>
                      {links.map((item, index) => (
                        <LinkButton
                          key={index}
                          onClick={() => window.open(item.link, "_blank")}
                        >
                          {item.title}
                        </LinkButton>
                      ))}
                    </LinksWrapper>
                  )}
                </BodyContent>
              </ContentInner>
            </ScrollContent>

            {/* [3] 하단 고정: 버튼 영역 */}
            <FixedFooter>
              <CloseMenus>
                <button onClick={handleHideForever}>다시 보지 않기</button>
                <button onClick={() => setIsOpen(false)}>닫기</button>
              </CloseMenus>
            </FixedFooter>
          </SheetContainer>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Styled Components ---

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 50;
`;

const SheetContainer = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background-color: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;

  /* 화면 높이의 최대 85%까지만 차지 */
  max-height: 85vh;
  height: auto;

  /* ✨ 핵심: Flexbox Layout */
  display: flex;
  flex-direction: column;

  /* PC 대응 */
  @media (min-width: 769px) {
    max-width: 50vw;
    margin: 0 auto;
  }
`;

const HandleArea = styled.div`
  width: 100%;
  padding: 12px 0;
  display: flex;
  justify-content: center;
  flex-shrink: 0; /* 크기 고정 */
  cursor: grab;
`;

const HandleBar = styled.div`
  width: 48px;
  height: 4px;
  border-radius: 99px;
  background-color: #d1d5db;
`;

// [1] 고정 헤더
const FixedHeader = styled.div`
  flex-shrink: 0; /* 높이 절대 줄어들지 않음 */
  padding: 0 20px 16px 20px;
  text-align: center;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #1c408c;
    word-break: keep-all;
  }
`;

// [2] 스크롤 영역
const ScrollContent = styled.div`
  flex: 1; /* 남은 공간을 모두 차지함 */
  overflow-y: auto; /* 내용이 넘치면 스크롤 발생 */
  min-height: 0; /* Flexbox 내 스크롤 버그 방지 */

  /* 스크롤바 숨김 처리 */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ContentInner = styled.div`
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
`;

const DescriptionText = styled.span`
  display: block;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
  color: #6c6c74;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: keep-all;
`;

const BodyContent = styled.div`
  white-space: pre-wrap;
  word-break: keep-all;
  line-height: 1.6;
  color: #333;

  img {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 10px;
  }
`;

const LinksWrapper = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LinkButton = styled.button`
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

// [3] 고정 푸터
const FixedFooter = styled.div`
  flex-shrink: 0; /* 높이 절대 줄어들지 않음 */
  background-color: white;
  border-top: 1px solid #f3f4f6;
  padding-bottom: env(safe-area-inset-bottom); /* 아이폰 하단바 대응 */
`;

const CloseMenus = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;

  button {
    background: none;
    border: none;
    color: #4b5563;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    padding: 8px;

    &:last-child {
      color: #111827;
      font-weight: 600;
    }
  }
`;
