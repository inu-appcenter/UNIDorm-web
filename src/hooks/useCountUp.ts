import { useState, useEffect, useRef } from "react";

interface UseCountUpOptions {
  duration?: number; // 애니메이션 지속 시간 (ms, 기본 600ms)
  start?: number;    // 시작 값 (기본 0)
  decimals?: number; // 표시할 소수점 자릿수 (기본 0)
  enabled?: boolean; // 실행 여부 제어 (기본 true)
}

/**
 * Apple & Toss 감속 이징(Ease-Out Cubic)을 적용한 60fps 카운트업 훅
 *
 * @param target 최종 목표 수치
 * @param options duration, start, decimals, enabled
 * @returns 현재 카운트된 숫자 (number)
 */
export function useCountUp(
  target: number | string | undefined | null,
  options: UseCountUpOptions = {},
): number {
  const { duration = 600, start = 0, decimals = 0, enabled = true } = options;

  const numericTarget = typeof target === "number"
    ? target
    : parseFloat(String(target ?? "0").replace(/[^0-9.-]/g, "")) || 0;

  const [current, setCurrent] = useState<number>(start);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || isNaN(numericTarget)) {
      setCurrent(isNaN(numericTarget) ? 0 : numericTarget);
      return;
    }

    // 목표값이 시작값과 같으면 애니메이션 생략
    if (numericTarget === start) {
      setCurrent(numericTarget);
      return;
    }

    const startTime = performance.now();
    const diff = numericTarget - start;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Toss & Apple 감속 곡선 (Ease-Out Cubic: 빠르게 시작해 쫀득하게 멈춤)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = start + diff * easeProgress;

      if (decimals > 0) {
        const factor = Math.pow(10, decimals);
        setCurrent(Math.round(val * factor) / factor);
      } else {
        setCurrent(Math.round(val));
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setCurrent(numericTarget);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [numericTarget, duration, start, decimals, enabled]);

  return current;
}
