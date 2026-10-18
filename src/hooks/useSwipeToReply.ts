import { useState, useRef, useCallback } from "react";

interface UseSwipeToReplyOptions {
  onReply?: () => void;
  direction?: "left" | "right";
  threshold?: number;
  disabled?: boolean;
}

export function useSwipeToReply({
  onReply,
  direction = "right",
  threshold = 45,
  disabled = false,
}: UseSwipeToReplyOptions) {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const startCoordRef = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || !onReply || e.touches.length !== 1) return;
      const touch = e.touches[0];
      startCoordRef.current = { x: touch.clientX, y: touch.clientY };
      isHorizontalSwipeRef.current = null;
      setIsSwiping(false);
    },
    [disabled, onReply],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || !startCoordRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const diffX = touch.clientX - startCoordRef.current.x;
      const diffY = touch.clientY - startCoordRef.current.y;

      // 수평/수직 제스처 구분 (초기 8px 이동 후 판정)
      if (isHorizontalSwipeRef.current === null) {
        if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
          if (Math.abs(diffY) >= Math.abs(diffX)) {
            // 수직 스크롤로 판정하여 스와이프 취소
            isHorizontalSwipeRef.current = false;
            return;
          } else {
            // 수평 스와이프로 판정
            isHorizontalSwipeRef.current = true;
          }
        } else {
          return;
        }
      }

      if (!isHorizontalSwipeRef.current) return;

      // 의도된 방향으로만 이동 허용
      let validDiff = 0;
      if (direction === "left") {
        validDiff = Math.min(0, Math.max(-75, diffX));
      } else {
        validDiff = Math.max(0, Math.min(75, diffX));
      }

      setOffsetX(validDiff);
      setIsSwiping(true);
    },
    [direction, disabled],
  );

  const onTouchEnd = useCallback(() => {
    if (disabled || !startCoordRef.current) {
      setOffsetX(0);
      setIsSwiping(false);
      return;
    }

    const absOffset = Math.abs(offsetX);
    if (isHorizontalSwipeRef.current && absOffset >= threshold && onReply) {
      try {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(10);
        }
      } catch {
        // ignore
      }
      onReply();
    }

    startCoordRef.current = null;
    isHorizontalSwipeRef.current = null;
    setOffsetX(0);
    setIsSwiping(false);
  }, [disabled, offsetX, onReply, threshold]);

  return {
    swipeHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    offsetX,
    isSwiping,
  };
}
