import { Drawer } from "vaul";
import styled from "styled-components";
import { useEffect, useRef } from "react";
import RoundSquareButton from "../button/RoundSquareButton.tsx";

// --- [변경] Props 인터페이스에 커스텀 속성 추가 ---
interface Props {
  id: string; // 각 모달 구분용 ID
  children?: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  closeButtonText?: string; // 버튼 텍스트
  onCloseClick?: () => void; // 닫기 전 실행할 함수
}
// ---------------------------------------------

export default function CommonBottomModal({
  id,
  children,
  isOpen,
  setIsOpen,
  // --- [변경] props 추가 및 기본값 설정 ---
  closeButtonText = "닫기",
  onCloseClick,
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

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Overlay />
        <Content>
          <SwipeHandle />
          <ScrollContent>{children}</ScrollContent>
          <CloseMenus>
            {/* --- [변경] 버튼에 props 적용 --- */}
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

const Overlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 40;
`;

const Content = styled(Drawer.Content)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  margin: 6rem auto 0 auto;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  background-color: white;
  max-height: 80vh;
  /* 스마트폰이 아닐 때만 적용 */
  @media (min-width: 769px) {
    max-width: 50vw;
  }
`;

const SwipeHandle = styled.div`
  margin: 1rem auto;
  width: 3rem;
  height: 0.375rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background-color: #d1d5db;
`;

const ScrollContent = styled.div`
  flex: 1;
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
