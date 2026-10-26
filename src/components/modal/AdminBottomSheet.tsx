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
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} shouldScaleBackground={false}>
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

const Overlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 999;
`;

const Content = styled(Drawer.Content)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 580px;
  max-height: min(90dvh, 840px);
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  outline: none;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 0px);
`;

const HandleArea = styled.div`
  width: 100%;
  padding: 12px 0 4px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  cursor: grab;
`;

const HandleBar = styled.div`
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: #d1d6db;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
