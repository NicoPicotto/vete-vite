import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    createNeko: (options?: {
      speed?: number;
      fps?: number;
      behaviorMode?: number;
      idleThreshold?: number;
      allowBehaviorChange?: boolean;
      startX?: number;
      startY?: number;
    }) => { start: () => void; stop: () => void; destroy: () => void };
  }
}

const STORAGE_KEY = "neko-active";

export function useNeko() {
  const [isActive, setIsActive] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? false : stored === "true";
  });

  const nekoRef = useRef<ReturnType<Window["createNeko"]> | null>(null);

  useEffect(() => {
    if (!isActive) {
      nekoRef.current?.destroy();
      nekoRef.current = null;
      return;
    }

    const init = () => {
      if (typeof window.createNeko !== "function") return;
      nekoRef.current?.destroy();
      nekoRef.current = window.createNeko({ speed: 10, allowBehaviorChange: true });
      nekoRef.current.start();
    };

    if (typeof window.createNeko === "function") {
      init();
    } else {
      // Script might still be loading
      const interval = setInterval(() => {
        if (typeof window.createNeko === "function") {
          clearInterval(interval);
          init();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      nekoRef.current?.destroy();
      nekoRef.current = null;
    };
  }, [isActive]);

  const toggle = () => {
    setIsActive((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return { isActive, toggle };
}
