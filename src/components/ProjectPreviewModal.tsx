import { useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Globe, PlayCircle, Image as ImageIcon, Terminal } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useThemeColors } from '../hooks/useThemeColors';
import type { ProjectPreviewData } from '../content/types';

type ProjectPreview = Partial<ProjectPreviewData>;

type Tab = 'live' | 'video' | 'images';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  preview?: ProjectPreview;
}

// Turns a YouTube watch/share link into an embeddable URL; returns null for non-YouTube links
const toYouTubeEmbed = (url: string) => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

const ProjectPreviewModal = ({ open, onClose, title, preview }: Props) => {
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();

  const tabs = useMemo(() => {
    const t: { id: Tab; label: string; Icon: typeof Globe }[] = [];
    if (preview?.liveUrl) t.push({ id: 'live', label: 'Live site', Icon: Globe });
    if (preview?.video) t.push({ id: 'video', label: 'Demo video', Icon: PlayCircle });
    if (preview?.images && preview.images.length > 0) t.push({ id: 'images', label: 'Screenshots', Icon: ImageIcon });
    return t;
  }, [preview]);

  // keep the latest onClose without re-running the open effect on every parent render
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const [tab, setTab] = useState<Tab | null>(null);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setTab(tabs[0]?.id ?? null);
    setImgIndex(0);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, tabs]);

  if (!open) return null;

  const accent = isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[600];
  const frameBg = isDarkMode ? '#0B1220' : '#F8FAFC';
  const border = isDarkMode ? '#1F2A3A' : '#E2E8F0';
  const images = preview?.images ?? [];
  const embed = preview?.video ? toYouTubeEmbed(preview.video) : null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-3 md:p-8"
      style={{ zIndex: 100000, background: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} preview`}
    >
      <div
        className="w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl"
        style={{ background: isDarkMode ? '#111827' : '#FFFFFF', border: `1px solid ${border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Window bar */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${border}`, background: frameBg }}>
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full" style={{ background: '#475569' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#64748B' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#94A3B8' }} />
          </span>
          <span className="font-mono text-sm truncate" style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }}>
            {tab === 'live' && preview?.liveUrl ? preview.liveUrl.replace(/^https?:\/\//, '') : `${title.toLowerCase()} — preview`}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {tab === 'live' && preview?.liveUrl && (
              <a
                href={preview.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded"
                style={{ color: accent }}
              >
                Open <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            <button onClick={onClose} className="p-1 rounded hover:opacity-70" aria-label="Close preview" style={{ color: isDarkMode ? '#CBD5E1' : '#334155' }}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex gap-1 px-3 pt-3" style={{ background: frameBg }}>
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-t-md"
                style={{
                  color: tab === id ? accent : isDarkMode ? '#94A3B8' : '#64748B',
                  borderBottom: `2px solid ${tab === id ? accent : 'transparent'}`,
                  fontWeight: tab === id ? 600 : 500,
                }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        )}

        {/* Stage */}
        <div className="relative w-full" style={{ aspectRatio: '16 / 9', background: frameBg }}>
          {tab === 'live' && preview?.liveUrl && (
            <iframe src={preview.liveUrl} title={`${title} live site`} className="absolute inset-0 w-full h-full" style={{ border: 0, background: '#fff' }} loading="lazy" />
          )}

          {tab === 'video' && preview?.video && (
            embed ? (
              <iframe src={embed} title={`${title} demo video`} className="absolute inset-0 w-full h-full" style={{ border: 0 }} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <video src={preview.video} controls className="absolute inset-0 w-full h-full" style={{ background: '#000' }} />
            )
          )}

          {tab === 'images' && images.length > 0 && (
            <>
              <img src={images[imgIndex]} alt={`${title} screenshot ${imgIndex + 1}`} className="absolute inset-0 w-full h-full object-contain" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full" style={{ background: 'rgba(15,23,42,0.7)', color: '#fff' }} aria-label="Previous screenshot">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setImgIndex((i) => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full" style={{ background: 'rgba(15,23,42,0.7)', color: '#fff' }} aria-label="Next screenshot">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono px-2 py-1 rounded" style={{ background: 'rgba(15,23,42,0.7)', color: '#fff' }}>
                    {imgIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </>
          )}

          {!tab && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="font-mono text-sm md:text-base max-w-md w-full rounded-lg p-5" style={{ background: '#0B1220', color: '#CBD5E1', border: '1px solid #1F2A3A' }}>
                <div className="flex items-center gap-2 mb-3" style={{ color: themeColors.colors.pink[300] }}>
                  <Terminal className="h-4 w-4" aria-hidden="true" /> preview
                </div>
                <p>$ ./run {title.toLowerCase()} --demo</p>
                <p className="mt-1" style={{ color: '#94A3B8' }}>[ .. ] demo is being prepared</p>
                <p className="mt-1" style={{ color: themeColors.colors.pink[300] }}>Preview coming soon.</p>
              </div>
            </div>
          )}
        </div>

        {tab === 'live' && (
          <p className="text-xs px-4 py-2" style={{ color: isDarkMode ? '#94A3B8' : '#64748B', background: frameBg, borderTop: `1px solid ${border}` }}>
            If the site doesn't load here, use “Open” — some sites block being shown inside other pages.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectPreviewModal;
