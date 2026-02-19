import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { Drawer } from "vaul";
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

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        {/* 배경 오버레이 */}
        <Overlay />

        {/* 바텀시트 컨테이너 */}
        <Content>
          {/* 드래그 핸들 */}
          <HandleArea>
            <HandleBar />
          </HandleArea>

          {/* [1] 상단 고정: 타이틀 */}
          <FixedHeader>
            <Drawer.Title asChild>
              <h2>{title}</h2>
            </Drawer.Title>
            <Drawer.Description />
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
        </Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// --- Styled Components ---

const Overlay = styled(({ overlay, ...props }) => <Drawer.Overlay {...props} />)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 50;
`;

const Content = styled(({ overlay, ...props }) => <Drawer.Content {...props} />)`
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
  display: flex;
  flex-direction: column;
  outline: none;

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
  flex-shrink: 0;
`;

const HandleBar = styled.div`
  width: 48px;
  height: 4px;
  border-radius: 99px;
  background-color: #d1d5db;
`;

// [1] 고정 헤더
const FixedHeader = styled.div`
  flex-shrink: 0;
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
  flex: 1;
  overflow-y: auto;
  min-height: 0;

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
  flex-shrink: 0;
  background-color: white;
  border-top: 1px solid #f3f4f6;
  padding-bottom: env(safe-area-inset-bottom);
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

