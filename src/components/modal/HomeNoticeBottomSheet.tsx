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
  showHideAction?: boolean;
  useStorage?: boolean;
  closeButtonText?: string;
  hideActionText?: string;
}

export default function HomeNoticeBottomSheet({
  id,
  title,
  text,
  children,
  links = [],
  isOpen,
  setIsOpen,
  showHideAction = true,
  useStorage = true,
  closeButtonText = "닫기",
  hideActionText = "다시 보지 않기",
}: Props) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!useStorage || initialized.current) {
      return;
    }

    try {
      const hiddenModals = JSON.parse(
        localStorage.getItem("hiddenModals") || "[]",
      );

      if (hiddenModals.includes(id)) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Local storage error", error);
    }

    initialized.current = true;
  }, [id, setIsOpen, useStorage]);

  const handleHideForever = () => {
    if (!useStorage) {
      setIsOpen(false);
      return;
    }

    try {
      const hiddenModals = JSON.parse(
        localStorage.getItem("hiddenModals") || "[]",
      );

      if (!hiddenModals.includes(id)) {
        hiddenModals.push(id);
        localStorage.setItem("hiddenModals", JSON.stringify(hiddenModals));
      }
    } catch (error) {
      console.error("Local storage error", error);
    }

    setIsOpen(false);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Overlay />

        <Content>
          <HandleArea>
            <HandleBar />
          </HandleArea>

          <FixedHeader>
            <Drawer.Title asChild>
              <h2>{title}</h2>
            </Drawer.Title>
            <Drawer.Description />
          </FixedHeader>

          <ScrollContent>
            <ContentInner>
              {text && <DescriptionText>{linkify(text)}</DescriptionText>}

              <BodyContent>
                {children}

                {links.length > 0 && (
                  <LinksWrapper>
                    {links.map((item, index) => (
                      <LinkButton
                        key={index}
                        type="button"
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

          <FixedFooter>
            <CloseMenus $singleAction={!showHideAction}>
              {showHideAction && (
                <button type="button" onClick={handleHideForever}>
                  {hideActionText}
                </button>
              )}
              <button type="button" onClick={() => setIsOpen(false)}>
                {closeButtonText}
              </button>
            </CloseMenus>
          </FixedFooter>
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
  z-index: 50;
`;

const Content = styled(({ overlay, ...props }) => (
  <Drawer.Content {...props} />
))`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background-color: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  outline: none;

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

const FixedHeader = styled.div`
  flex-shrink: 0;
  padding: 0 20px;
  text-align: center;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #1c408c;
    word-break: keep-all;
  }
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ContentInner = styled.div`
  padding: 0 20px 20px;
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

const FixedFooter = styled.div`
  flex-shrink: 0;
  background-color: white;
  border-top: 1px solid #f3f4f6;
  padding-bottom: env(safe-area-inset-bottom);
`;

const CloseMenus = styled.div<{ $singleAction?: boolean }>`
  display: flex;
  justify-content: ${({ $singleAction }) =>
    $singleAction ? "flex-end" : "space-between"};
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
