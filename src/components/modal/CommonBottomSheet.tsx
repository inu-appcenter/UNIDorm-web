import { Drawer } from "vaul";
import styled from "styled-components";
import React, { useEffect, useRef } from "react";
import RoundSquareButton from "../button/RoundSquareButton.tsx";
import Friends from "../../assets/roommate/Friends.svg";
import 눈물닦아주는횃불이 from "../../assets/눈물 닦아주는 횃불이.webp";
import 배달의민족상품권이미지 from "../../assets/event/배달의민족 1만원권.webp";

// 선택 가능한 이미지 맵
const headerImages: Record<number, string> = {
  1: Friends,
  2: 눈물닦아주는횃불이,
  3: 배달의민족상품권이미지,
};

// --- [변경] Props 인터페이스에 커스텀 속성 추가 ---
interface Props {
  id: string; // 각 모달 구분용 ID
  children?: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  closeButtonText?: string; // 버튼 텍스트
  onCloseClick?: () => void; // 닫기 전 실행할 함수
  headerImageId?: number | null;
  title?: string;
  subtitle?: string;
}
// ---------------------------------------------

export default function CommonBottomSheet({
  id,
  children,
  isOpen,
  setIsOpen,
  closeButtonText = "닫기",
  onCloseClick,
  headerImageId = null,
  title,
  subtitle,
}: Props) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return; // 이미 체크했으면 종료
    const hiddenModals = JSON.parse(
      localStorage.getItem("hiddenModals") || "[]",
    );
    if (hiddenModals.includes(id)) {
      setIsOpen(false);
    }
    initialized.current = true;
  }, [id, setIsOpen]);

  const headerImage = headerImageId ? headerImages[headerImageId] : null;

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Overlay />
        <Content>
          <SwipeHandle />
          <ModalHeader>
            <div className="title-area">
              <Drawer.Title asChild>
                <h2>{title}</h2>
              </Drawer.Title>
              {subtitle && <span>{subtitle}</span>}
            </div>
            <Drawer.Description />
            {headerImage && <img src={headerImage} alt="modal header" />}
          </ModalHeader>
          <ScrollContent>{children}</ScrollContent>
          <CloseMenus>
            <RoundSquareButton
              btnName={closeButtonText}
              onClick={() => {
                // 커스텀 클릭 이벤트가 있으면 먼저 실행
                if (onCloseClick) {
                  onCloseClick();
                }
                // 그 다음 항상 모달을 닫음
                setIsOpen(false);
              }}
            />
            {/* --------------------------- */}
          </CloseMenus>
        </Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const Overlay = styled(({ overlay, ...props }) => (
  <Drawer.Overlay {...props} />
))`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 10010;
`;

const Content = styled(({ overlay, ...props }) => (
  <Drawer.Content {...props} />
))`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10011;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background-color: white;
  height: fit-content;
  max-height: 80vh;

  /* 스마트폰이 아닐 때만 적용 */
  @media (min-width: 769px) {
    max-width: 50vw;
  }
`;

const SwipeHandle = styled.div`
  margin: 12px auto 8px auto;
  width: 3rem;
  height: 0.375rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background-color: #d1d5db;
`;

const ModalHeader = styled.div`
  flex-shrink: 0;
  margin-bottom: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  word-break: keep-all;
  white-space: pre-wrap;

  color: #1c408c;
  width: 100%;
  img {
    width: 60%;
    margin-bottom: 8px;
  }

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }

  p {
    margin: 0;
    padding: 0;
    display: none;
  }

  span {
    font-size: 14px;
  }
`;

const ScrollContent = styled.div`
  flex: 0 1 auto;
  overflow-y: auto;

  img {
    width: 100%;
    max-width: 400px;
  }
`;

const CloseMenus = styled.div`
  width: 100%;

  padding: 16px;
  box-sizing: border-box;
`;
