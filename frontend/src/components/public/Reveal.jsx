// Enveloppe d'animation d'apparition au défilement (Framer Motion), basée sur useRevealOnScroll.
import useRevealOnScroll from '../../hooks/useRevealOnScroll.js';

export default function Reveal({ children, delai = 0, className = '' }) {
  const [ref, visible] = useRevealOnScroll();
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${delai}ms` }}
    >
      {children}
    </div>
  );
}
