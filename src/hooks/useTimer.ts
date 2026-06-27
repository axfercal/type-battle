import { useCallback, useEffect, useRef } from "react";

export function useTimer(isActive: boolean) {
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (isActive && startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
    if (!isActive) {
      startTimeRef.current = null;
    }
  }, [isActive]);

  const getElapsed = useCallback((): number => {
    if (!startTimeRef.current) return elapsedRef.current;
    elapsedRef.current = (Date.now() - startTimeRef.current) / 1000;
    return elapsedRef.current;
  }, []);

  const reset = useCallback(() => {
    startTimeRef.current = null;
    elapsedRef.current = 0;
  }, []);

  return { getElapsed, reset };
}
