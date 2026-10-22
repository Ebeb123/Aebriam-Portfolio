import { useEffect, useRef, useState } from 'react';

/** Shows a mobile app's web demo inside a phone-shaped frame. */
const PhoneModal = ({ url, title, onClose }: { url: string | null; title: string; onClose: () => void }) => {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!url) return;
    const fit = () => setScale(Math.min(1, (window.innerHeight - 110) / 860, (window.innerWidth - 32) / 410));
    fit();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('resize', fit);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', fit);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [url]);

  if (!url) return null;

  return (
    <div className="modal-backdrop phone-backdrop" onClick={onClose}>
      <div className="phone-wrap" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${title} demo`}>
        <div className="phone-bar">
          <span className="phone-title">{title}</span>
          <span className="flex items-center gap-4">
            <a href={url} target="_blank" rel="noreferrer" className="phone-link">Open in new tab ↗</a>
            <button type="button" className="phone-link" onClick={onClose}>Close</button>
          </span>
        </div>
        <div className="phone-scale" style={{ width: 410 * scale, height: 860 * scale }}>
          <div className="phone" style={{ transform: `scale(${scale})` }}>
            <div className="phone-notch" aria-hidden="true" />
            <iframe src={url} title={`${title} demo`} className="phone-screen" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneModal;
