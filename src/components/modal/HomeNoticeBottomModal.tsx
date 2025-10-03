import { Drawer } from "vaul";
import styled from "styled-components";
import { useEffect, useRef } from "react";

interface LinkItem {
  title: string;
  link: string;
}

interface Props {
  id: string; // 각 모달 구분용 ID
  title?: string;
  text?: string;
  children?: React.ReactNode;
  links?: LinkItem[]; // 🔹 추가된 부분

  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function HomeNoticeBottomModal({
  id,
  title,
  text,
  children,
  links = [], // 기본값 빈 배열
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

  const handleHideForever = () => {
    const hiddenModals = JSON.parse(
      localStorage.getItem("hiddenModals") || "[]",
    );
    if (!hiddenModals.includes(id)) {
      hiddenModals.push(id);
      localStorage.setItem("hiddenModals", JSON.stringify(hiddenModals));
    }
    setIsOpen(false);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Overlay />
        <Content>
          <SwipeHandle />
          <ScrollContent>
            <Title>{title}</Title>
            <Text>{text}</Text>
            {children}

            {/* 🔹 링크 버튼 목록 */}
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
          </ScrollContent>
          <CloseMenus>
            <button onClick={handleHideForever}>다시 보지 않기</button>
            <button onClick={() => setIsOpen(false)}>닫기</button>
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
  }
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
`;

const Text = styled.p`
  color: #4b5563;
`;

/* 🔹 링크 버튼 스타일 */
const LinksWrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 16px;
`;

const LinkButton = styled.button`
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: #e5e7eb;
  }
`;

const CloseMenus = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  padding: 20px;
  box-sizing: border-box;

  button {
    background: none;
    border: none;
    color: #000;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: 0.38px;
    cursor: pointer;
  }
`;
