// Détecte quand un élément entre dans la zone visible de l'écran (via
// IntersectionObserver), pour déclencher une animation d'apparition une
// seule fois — utilisé par components/public/Reveal.jsx sur le site vitrine.
import { useEffect, useRef, useState } from 'react';

export default function useRevealOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-40px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}
