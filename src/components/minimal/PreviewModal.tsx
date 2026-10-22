import { useEffect, useMemo, useRef, useState } from 'react';
import type { ProjectPreviewData } from '../../content/types';

type Tab = 'live' | 'video' | 'images';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  preview?: Partial<ProjectPreviewData>;
}

const toYouTubeEmbed = (url: string) => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

export const hasPreview = (p?: Partial<ProjectPreviewData>) => !!(p && (p.liveUrl || p.video || (p.images && p.images.length)));

const PreviewModal = ({ open, onClose, title, preview }: Props) => {
  const tabs = useMemo(() => {
    const t: { id: Tab; label: string }[] = [];
    if (preview?.liveUrl) t.push({ id: 'live', label: 'live site' });
    if (preview?.video) t.push({ id: 'video', label: 'demo video' });
    if (preview?.images?.length) t.push({ id: 'images', label: 'screenshots' });
    return t;
  }, [preview]);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [tab, setTab] = useState<Tab | null>(null);
  const [img, setImg] = useState(0);

  useEffect(() => {
    if (!open) return;
    setTab(tabs[0]?.id ?? null);
    setImg(0);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, tabs]);

  if (!open) return null;
  const images = preview?.images ?? [];
  const yt = preview?.video ? toYouTubeEmbed(preview.video) : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label={`${title} preview`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="micro">preview</div>
            <div className="text-[15px] font-medium">{title}</div>
          </div>
          <button type="button" className="micro hover:text-[rgb(var(--ink))]" onClick={onClose} aria-label="Close preview">
            esc ✕
          </button>
        </div>

        {tabs.length > 1 && (
          <div className="flex gap-2 mb-4">
            {tabs.map((t) => (
              <button key={t.id} type="button" className={`tag ${tab === t.id ? 'inverted' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-[12px] border border-[rgb(var(--g200))] overflow-hidden bg-[rgb(var(--g50))]">
          {!tab && <p className="micro p-10 text-center">no preview yet</p>}
          {tab === 'live' && preview?.liveUrl && (
            <iframe src={preview.liveUrl} title={`${title} live`} className="w-full h-[65vh] bg-white" loading="lazy" />
          )}
          {tab === 'video' && preview?.video &&
            (yt ? (
              <iframe src={yt} title={`${title} video`} className="w-full aspect-video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            ) : (
              <video src={preview.video} controls className="w-full max-h-[65vh]" />
            ))}
          {tab === 'images' && images.length > 0 && (
            <div className="relative">
              <img src={images[img]} alt={`${title} screenshot ${img + 1}`} className="w-full max-h-[65vh] object-contain" />
              {images.length > 1 && (
                <div className="flex items-center justify-between p-3 border-t border-[rgb(var(--g200))]">
                  <button type="button" className="arrow-link" onClick={() => setImg((i) => (i - 1 + images.length) % images.length)}>← prev</button>
                  <span className="micro">{img + 1} / {images.length}</span>
                  <button type="button" className="arrow-link" onClick={() => setImg((i) => (i + 1) % images.length)}>next →</button>
                </div>
              )}
            </div>
          )}
        </div>

        {tab === 'live' && preview?.liveUrl && (
          <a href={preview.liveUrl} target="_blank" rel="noreferrer" className="arrow-link mt-3">
            open in new tab <span className="arr">↗</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default PreviewModal;
