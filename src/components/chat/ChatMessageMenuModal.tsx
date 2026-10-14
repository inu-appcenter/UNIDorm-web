import { useLayoutEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

export interface ChatMessageMenuProps {
  open: boolean;
  onClose: () => void;
  isMyMessage: boolean;
  isImageMessage: boolean;
  isDerivedRoomCard?: boolean;
  anchorRect?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
  } | null;
  onReply?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReport?: () => void;
}

export default function ChatMessageMenuModal({
  open,
  onClose,
  isMyMessage,
  isImageMessage,
  isDerivedRoomCard = false,
  anchorRect,
  onReply,
  onDelete,
  onEdit,
  onReport,
}: ChatMessageMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useLayoutEffect(() => {
    if (!open || !anchorRect) return;

    const menuEl = menuRef.current;
    const menuWidth = menuEl ? menuEl.offsetWidth : 110;
    const menuHeight = menuEl ? menuEl.offsetHeight : 120;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let targetLeft: number;
    let targetTop: number;

    if (isMyMessage) {
      // 내 메시지: 말풍선 좌측 상단에 붙이거나 공간 부족시 아래
      targetLeft = anchorRect.left - menuWidth - 8;
      if (targetLeft < 16) {
        targetLeft = Math.max(16, anchorRect.left);
      }
    } else {
      // 상대방 메시지: 말풍선 우측 상단에 붙이거나 공간 부족시 아래
      targetLeft = anchorRect.right + 8;
      if (targetLeft + menuWidth > viewportWidth - 16) {
        targetLeft = Math.max(16, anchorRect.right - menuWidth);
      }
    }

    targetTop = anchorRect.top;
    if (targetTop + menuHeight > viewportHeight - 20) {
      targetTop = Math.max(20, viewportHeight - menuHeight - 20);
    }
    if (targetTop < 20) {
      targetTop = 20;
    }

    setCoords({ top: targetTop, left: targetLeft });
  }, [open, anchorRect, isMyMessage]);

  if (!open) return null;

  return (
    <Overlay onClick={onClose}>
      <MenuCard
        ref={menuRef}
        style={{
          top: coords.top > 0 ? `${coords.top}px` : "50%",
          left: coords.left > 0 ? `${coords.left}px` : "50%",
          transform: coords.top > 0 ? "none" : "translate(-50%, -50%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 파생 톡방 카드는 답장만 */}
        {isDerivedRoomCard ? (
          <MenuItem
            type="button"
            onClick={() => {
              onReply?.();
              onClose();
            }}
          >
            답장
          </MenuItem>
        ) : isMyMessage ? (
          <>
            <MenuItem
              type="button"
              onClick={() => {
                onReply?.();
                onClose();
              }}
            >
              답장
            </MenuItem>
            <Divider />
            <MenuItem
              type="button"
              onClick={() => {
                onDelete?.();
                onClose();
              }}
            >
              삭제
            </MenuItem>
            {!isImageMessage && (
              <>
                <Divider />
                <MenuItem
                  type="button"
                  onClick={() => {
                    onEdit?.();
                    onClose();
                  }}
                >
                  수정
                </MenuItem>
              </>
            )}
          </>
        ) : (
          <>
            <MenuItem
              type="button"
              onClick={() => {
                onReply?.();
                onClose();
              }}
            >
              답장
            </MenuItem>
            <Divider />
            <MenuItem
              type="button"
              onClick={() => {
                onReport?.();
                onClose();
              }}
            >
              신고
            </MenuItem>
          </>
        )}
      </MenuCard>
    </Overlay>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.35);
  animation: ${fadeIn} 0.12s ease-out;
`;

const MenuCard = styled.div`
  position: fixed;
  z-index: 1000;
  min-width: 96px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
  padding: 4px 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.12s ease-out;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.12s;

  &:hover {
    background-color: #f9fafb;
  }

  &:active {
    background-color: #f3f4f6;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #f3f4f6;
  margin: 0 6px;
`;
