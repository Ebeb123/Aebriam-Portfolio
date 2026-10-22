import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** Staggered fade-up on page load: first at 60ms, +80ms each, capped at 420ms. */
export const fadeUp = (i: number): { className: string; style: CSSProperties } => ({
  className: 'fade-up',
  style: { animationDelay: `${Math.min(60 + i * 80, 420)}ms` },
});

/** Section that gently rises into view the first time it is scrolled to. */
const Section = ({
  id,
  title,
  count,
  children,
  action,
}: {
  id: string;
  title: string;
  count?: number;
  children: ReactNode;
  action?: ReactNode;
  /** kept for older callers; no longer displayed */
  number?: number;
  delay?: number;
}) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in');
          obs.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} aria-labelledby={`${id}-label`} className="section reveal">
      <div className="sec-head">
        <h2 id={`${id}-label`} className="sec-title">
          {title}
          {count !== undefined && <sup>{count}</sup>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
};

export default Section;
