import React from "react";
import styled from "styled-components";
import { Drawer } from "vaul";

interface AdminBottomSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function AdminBottomSheet({
  isOpen,
  setIsOpen,
  title,
  description,
  children,
}: AdminBottomSheetProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Overlay />
        <Content>
          <HandleArea>
            <HandleBar />
          </HandleArea>

          <AccessibleHeader>
            <Drawer.Title>{title}</Drawer.Title>
            <Drawer.Description>
              {description ?? title}
            </Drawer.Description>
          </AccessibleHeader>

          <Body>{children}</Body>
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
  margin-top: 6rem;
  display: flex;
  flex-direction: column;
  max-height: min(88vh, 820px);
  background: #ffffff;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  box-shadow: 0 -12px 32px rgba(15, 23, 42, 0.14);
  outline: none;

  @media (min-width: 768px) {
    left: 50%;
    right: auto;
    bottom: 50%;
    width: min(680px, calc(100vw - 48px));
    max-height: min(88vh, 820px);
    border-radius: 28px;
    transform: translate(-50%, 50%);
    box-shadow: 0 28px 60px -34px rgba(15, 23, 42, 0.4);
  }
`;

const HandleArea = styled.div`
  width: 100%;
  padding: 10px 0 0;
  display: flex;
  justify-content: center;
  flex-shrink: 0;

  @media (min-width: 768px) {
    display: none;
  }
`;

const HandleBar = styled.div`
  width: 48px;
  height: 5px;
  border-radius: 999px;
  background: #cbd5e1;
`;

const AccessibleHeader = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Body = styled.div`
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
