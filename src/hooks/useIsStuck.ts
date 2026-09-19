import { useEffect, useRef, useState } from "react";

// Detecta si un elemento `position: sticky` está pegado a su offset superior,
// para poder mostrar estilos (p. ej. un borde) sólo mientras está fijo.
export default function useIsStuck<T extends HTMLElement>(topOffset: number) {
  const ref = useRef<T | null>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const node = ref.current;
    // jsdom (tests) y navegadores antiguos no tienen IntersectionObserver.
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(entry.intersectionRatio < 1),
      { rootMargin: `-${topOffset + 1}px 0px 0px 0px`, threshold: [1] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [topOffset]);

  return { ref, isStuck };
}
