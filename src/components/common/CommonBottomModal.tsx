import { Drawer } from "vaul";
import styled from "styled-components";
import { useEffect, useRef } from "react";
import RoundSquareBlueButton from "../button/RoundSquareBlueButton.tsx";

interface Props {
  id: string; // 각 모달 구분용 ID
  children?: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CommonBottomModal({
  id,
  children,
  isOpen,
  setIsOpen,
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
            <RoundSquareBlueButton
              btnName={"닫기"}
              onClick={() => setIsOpen(false)}
            />
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
