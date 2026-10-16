import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Shield, Lock, Terminal, Cpu, Code, Bug, Database, Server, KeyRound, Fingerprint, Bot, Wifi, Binary, Laptop, Network, ShieldCheck } from 'lucide-react';
import AsciiMorphText from '../AsciiMorphText';
import TypewriterCarousel from '../TypewriterCarousel';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useThemeColors, withAlpha } from '../../hooks/useThemeColors';
import { useContent } from '../../contexts/ContentContext';
import { resolveImage } from '../../content/icons';

// Tech icons that float around the About card (replace any with another lucide-react icon)
const stickerIcons = [Shield, Terminal, Cpu, Lock, Code, Bug, Database, Server, KeyRound, Fingerprint, Bot, Wifi, Binary, Laptop, Network, ShieldCheck];


const About = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [asciiText, setAsciiText] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();

  const { content } = useContent();
  const { profile, about } = content;
  const roles = profile.roles.length > 0 ? profile.roles : ['Developer'];
  const photo = resolveImage(profile.photo);

  // Barcode stripes for the badge (fixed pattern so it doesn't change between renders)
  const barcode = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2];

  const profileImages = [{ src: photo, caption: profile.name }];

  // Small terminal drawn in the hero (built from your handle and focus)
  const focus = (about.fields.find((f) => f.label.toLowerCase() === 'focus')?.value || 'cybersecurity').toLowerCase();
  const termLines = ['$ whoami', profile.handle, '$ cat focus.txt', focus, '$ ./secure --all', '[ OK ] systems locked', '$ _'];
  const termTitle = `o o o  ~/${profile.handle.split('.')[0] || 'home'}`;
  const termWidth = Math.max(24, ...termLines.map((l) => l.length + 2), termTitle.length + 2);
  const fullAsciiArt = [
    ` ┌${'─'.repeat(termWidth)}┐`,  
    ` │ ${termTitle.padEnd(termWidth - 1)}│`,
    ` ├${'─'.repeat(termWidth)}┤`,
    ...termLines.map((l) => ` │ ${l.padEnd(termWidth - 1)}│`),
    ` └${'─'.repeat(termWidth)}┘`,
  ].join('\n');

  // Typewriter effect for ASCII art (restarts if the content changes after loading)
  useEffect(() => {
    let currentIndex = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const typingSpeed = 3; // Speed in milliseconds

    const typeWriter = () => {
      if (cancelled) return;
      if (currentIndex < fullAsciiArt.length) {
        setAsciiText(fullAsciiArt.substring(0, currentIndex + 1));
        currentIndex++;
        timer = setTimeout(typeWriter, typingSpeed);
      }
    };

    timer = setTimeout(typeWriter, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fullAsciiArt]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!sectionRef.current) {
            ticking = false;
            return;
          }

          const rect = sectionRef.current.getBoundingClientRect();
          const sectionHeight = rect.height;
          const windowHeight = window.innerHeight;

          // Calculate how much of the section is in view
          const visibleTop = Math.max(0, -rect.top);
          const visibleBottom = Math.min(sectionHeight, windowHeight - rect.top);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);

          const progress = visibleHeight / windowHeight;
          setScrollProgress(Math.min(1, Math.max(0, progress)));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus management for modal
  useEffect(() => {
    if (showProfileModal) {
      // Focus the modal when it opens
      const timer = setTimeout(() => {
        const modal = document.querySelector('[role="region"][aria-label="Profile photo carousel"]') as HTMLElement;
        if (modal) {
          modal.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showProfileModal]);

  // Carousel navigation functions
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? profileImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === profileImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'Escape') {
      setIsClosing(true);
      setTimeout(() => {
        setShowProfileModal(false);
        setIsClosing(false);
      }, 300);
    }
  };

  const stickers = [
    { id: 1, Icon: stickerIcons[0], initialX: -180, initialY: -80, finalX: -550, finalY: -100, mobileInitialX: -120, mobileInitialY: -60, mobileFinalX: -250, mobileFinalY: -80 },
    { id: 2, Icon: stickerIcons[1], initialX: 180, initialY: -60, finalX: 600, finalY: -250, mobileInitialX: 120, mobileInitialY: -40, mobileFinalX: 200, mobileFinalY: -120 },
    { id: 3, Icon: stickerIcons[2], initialX: -160, initialY: 240, finalX: -200, finalY: 380, mobileInitialX: -100, mobileInitialY: 160, mobileFinalX: -120, mobileFinalY: 220 },
    { id: 4, Icon: stickerIcons[3], initialX: 190, initialY: 260, finalX: 500, finalY: 150, mobileInitialX: 110, mobileInitialY: 180, mobileFinalX: 180, mobileFinalY: 120 },
    { id: 5, Icon: stickerIcons[4], initialX: -200, initialY: 120, finalX: -200, finalY: -380, mobileInitialX: -130, mobileInitialY: 80, mobileFinalX: -130, mobileFinalY: -180 },
    { id: 6, Icon: stickerIcons[5], initialX: 170, initialY: 100, finalX: 150, finalY: -360, mobileInitialX: 110, mobileInitialY: 70, mobileFinalX: 100, mobileFinalY: -160 },
    { id: 7, Icon: stickerIcons[6], initialX: -130, initialY: -130, finalX: -450, finalY: -380, mobileInitialX: -90, mobileInitialY: -90, mobileFinalX: -200, mobileFinalY: -200 },
    { id: 8, Icon: stickerIcons[7], initialX: 150, initialY: 200, finalX: 200, finalY: 350, mobileInitialX: 100, mobileInitialY: 140, mobileFinalX: 130, mobileFinalY: 200 },
    { id: 9, Icon: stickerIcons[8], initialX: -140, initialY: 300, finalX: -500, finalY: 200, mobileInitialX: -90, mobileInitialY: 200, mobileFinalX: -180, mobileFinalY: 160 },
    { id: 10, Icon: stickerIcons[9], initialX: 200, initialY: 120, finalX: 500, finalY: -380, mobileInitialX: 130, mobileInitialY: 80, mobileFinalX: 200, mobileFinalY: -180 },
    { id: 11, Icon: stickerIcons[10], initialX: -220, initialY: -40, finalX: 600, finalY: 10, mobileInitialX: -140, mobileInitialY: -30, mobileFinalX: 220, mobileFinalY: 10 },
    { id: 12, Icon: stickerIcons[11], initialX: 110, initialY: -180, finalX: 500, finalY: 300, mobileInitialX: 80, mobileInitialY: -120, mobileFinalX: 180, mobileFinalY: 180 },
    { id: 13, Icon: stickerIcons[12], initialX: -120, initialY: 360, finalX: 500, finalY: -100, mobileInitialX: -80, mobileInitialY: 240, mobileFinalX: 180, mobileFinalY: -80 },
    { id: 14, Icon: stickerIcons[13], initialX: 210, initialY: 40, finalX: -640, finalY: -220, mobileInitialX: 140, mobileInitialY: 30, mobileFinalX: -220, mobileFinalY: -140 },
    { id: 15, Icon: stickerIcons[14], initialX: -100, initialY: 160, finalX: -400, finalY: 320, mobileInitialX: -70, mobileInitialY: 110, mobileFinalX: -150, mobileFinalY: 200 },
    { id: 16, Icon: stickerIcons[15], initialX: 130, initialY: -100, finalX: -600, finalY: 100, mobileInitialX: 90, mobileInitialY: -70, mobileFinalX: -200, mobileFinalY: 80 },
  ];

  const getStickerStyle = (sticker: typeof stickers[0]) => {
    const progress = scrollProgress; // Direct progress for spreading effect when closer
    const isMobile = window.innerWidth < 768;
    const isVerySmall = window.innerWidth < 375; // iPhone SE and similar

    // Use mobile positioning on smaller screens
    const initialX = isMobile ? sticker.mobileInitialX : sticker.initialX;
    const initialY = isMobile ? sticker.mobileInitialY : sticker.initialY;
    const finalX = isMobile ? sticker.mobileFinalX : sticker.finalX;
    const finalY = isMobile ? sticker.mobileFinalY : sticker.finalY;

    // Further constrain for very small screens to prevent ANY horizontal overflow
    const constrainedFinalX = isVerySmall
      ? Math.max(-100, Math.min(100, finalX * 0.3))
      : isMobile
        ? Math.max(-150, Math.min(150, finalX * 0.5))
        : finalX;
    const constrainedFinalY = isVerySmall ? finalY * 0.6 : finalY * 0.8;

    const x = initialX + (constrainedFinalX - initialX) * progress;
    const y = initialY + (constrainedFinalY - initialY) * progress;
    const scale = isVerySmall ? 0.4 + (0.15 * progress) : isMobile ? 0.6 + (0.2 * progress) : 0.8 + (0.4 * progress);
    const opacity = 0.9 + (0.1 * progress);
    const rotation = progress * 20; // Add slight rotation

    return {
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
      opacity,
      transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
      willChange: 'transform, opacity',
      width: isVerySmall ? '50px' : isMobile ? '60px' : '80px',
      height: isVerySmall ? '50px' : isMobile ? '60px' : '80px',
      filter: `drop-shadow(0 4px 8px ${themeColors.effects.dropShadow})`
    };
  };

  return (
    <section id="about" ref={sectionRef} className="min-h-screen" style={{
      background: themeColors.background.sections?.about || themeColors.background.gradient,
      transition: 'background 0.3s ease-in-out',
      width: '100%',
      maxWidth: '100vw',
      contain: 'layout style'
    }}>
      {/* Hero Section */}
      <div className="py-10 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start max-w-6xl mx-auto gap-8">
            <div className="text-left w-full md:w-auto">
              <div className="ascii-container justify-start text-3xl md:text-4xl lg:text-5xl">
                <AsciiMorphText text={`Hi, I'm ${profile.shortName}`} />
              </div>
              <div className="hero-subtitle justify-start text-base md:text-lg lg:text-xl mt-2">
                <div className="flex flex-wrap items-center justify-start">
                  <span className={isDarkMode ? 'hero-subtitle-dark' : 'hero-subtitle-light'}>I am a&nbsp;</span>
                  <TypewriterCarousel roles={roles} className={isDarkMode ? 'hero-subtitle-dark' : 'hero-subtitle-light'} />
                </div>
              </div>
              <div className="hero-buttons flex justify-start gap-3 mt-4">
                <button
                  className="hero-action-btn text-sm md:text-base px-4 py-2 md:px-5 md:py-2.5"
                  onClick={() => {
                    window.open(resolveImage(profile.resumeUrl) || '/resume.pdf', '_blank');
                  }}
                >
                  Resume →
                </button>
                <Link
                  to="/contact"
                  className="hero-action-btn text-sm md:text-base px-4 py-2 md:px-5 md:py-2.5"
                >
                  Contact →
                </Link>
              </div>
            </div>
            <div className="hidden md:block" style={{ fontSize: '0.8rem', lineHeight: '1', fontFamily: 'monospace', minHeight: '150px', color: isDarkMode ? themeColors.primary : themeColors.colors.pink[500] }}>
              <pre>{asciiText}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* About Section with Stickers and Journal */}
      <div className="py-8 md:py-12" style={{
        background: isDarkMode
          ? 'transparent'
          : `linear-gradient(180deg, transparent 0%, ${withAlpha(themeColors.colors.pink[50], 0.5)} 50%, ${themeColors.colors.pink[25]} 100%)`
      }}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center relative min-h-[400px] md:min-h-[600px]">
            {/* Animated Stickers */}
            <div className="absolute inset-0 flex items-center justify-center">
              {stickers.map((sticker) => {
                const isVerySmall = window.innerWidth < 375;
                const isMobile = window.innerWidth < 768;
                return (
                  <div
                    key={sticker.id}
                    aria-hidden="true"
                    className="absolute z-10 pointer-events-none select-none sticker-tile"
                    style={{
                      ...getStickerStyle(sticker),
                      background: isDarkMode ? '#111827' : '#FFFFFF',
                      color: isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[600],
                      border: `1px solid ${isDarkMode ? '#1F2A3A' : '#E2E8F0'}`,
                    }}
                  >
                    <sticker.Icon width={isVerySmall ? 24 : isMobile ? 28 : 36} height={isVerySmall ? 24 : isMobile ? 28 : 36} strokeWidth={1.75} />
                  </div>
                );
              })}
            </div>

            {/* About: security ID badge + terminal */}
            <div className="about-card-grid relative z-20 w-full">
              {/* ID badge */}
              <div className={`id-badge ${isDarkMode ? 'id-badge--dark' : ''}`}>
                <div className="id-badge__clip" aria-hidden="true" />
                <div className="id-badge__header">
                  <span className="id-badge__chip" aria-hidden="true" />
                  <span>{about.org}</span>
                </div>
                <button
                  type="button"
                  className="id-badge__photo"
                  onClick={() => setShowProfileModal(true)}
                  aria-label="View profile photo"
                >
                  <img src={photo} alt={profile.name} loading="eager" />
                </button>
                <h3 className="id-badge__name">{profile.name}</h3>
                <dl className="id-badge__fields">
                  {about.fields.map((f) => (
                    <div key={f.label}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="id-badge__status">
                  <span className="id-badge__dot" aria-hidden="true" />
                  {about.status}
                </div>
                <div className="id-badge__barcode" aria-hidden="true">
                  {barcode.map((w, i) => (
                    <span key={i} style={{ width: `${w * 2}px`, marginRight: i % 3 === 0 ? '3px' : '2px' }} />
                  ))}
                </div>
              </div>

              {/* Terminal */}
              <div className="about-terminal" role="region" aria-label="About me">
                <div className="about-terminal__bar">
                  <span className="about-terminal__dots" aria-hidden="true"><i /><i /><i /></span>
                  <span>{about.terminalTitle}</span>
                </div>
                <div className="about-terminal__body">
                  <p className="cmd"><span className="prompt">$</span> {about.cmdAbout}</p>
                  {about.paragraphs.map((p, i) => (
                    <p key={i} className="out">{p}</p>
                  ))}
                  <p className="cmd"><span className="prompt">$</span> {about.cmdHighlights}</p>
                  <ul>
                    {about.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <p className="cmd"><span className="prompt">$</span> <span className="about-terminal__cursor" aria-hidden="true" /></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
          style={{ backgroundColor: themeColors.background.overlay }}
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => {
              setShowProfileModal(false);
              setIsClosing(false);
            }, 300);
          }}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className={`relative w-full max-w-sm md:max-w-md ${isClosing ? 'animate-scaleOut' : 'animate-scaleIn'}`} onClick={(e) => e.stopPropagation()}>
            {/* Carousel Container */}
            <div
              className="relative w-full bg-black rounded-lg shadow-2xl overflow-hidden focus:outline-none"
              style={{
                aspectRatio: '4/5',
                minHeight: '300px',
                maxHeight: '80vh'
              }}
              role="region"
              aria-label="Profile photo carousel"
              aria-live="polite"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              {/* Image Display */}
              <div className="relative w-full h-full flex items-center justify-center">
                {profileImages.map((image, index) => (
                  <img
                    key={index}
                    src={image.src}
                    alt={`Profile photo ${index + 1}`}
                    className={`absolute w-full h-full object-contain transition-opacity duration-500 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="eager"
                    onError={(e) => {
                      console.error('Image failed to load:', image.src);
                      e.currentTarget.style.display = 'block';
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-300"
                style={{
                  backgroundColor: isDarkMode ? withAlpha(themeColors.colors.dark[700], 0.9) : withAlpha(themeColors.colors.white, 0.8),
                  color: isDarkMode ? themeColors.colors.white : themeColors.colors.dark[700],
                  border: isDarkMode ? '2px solid #374151' : 'none',
                  boxShadow: isDarkMode ? `0 4px 12px ${withAlpha(themeColors.colors.black, 0.6)}` : undefined
                } as React.CSSProperties}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-300"
                style={{
                  backgroundColor: isDarkMode ? withAlpha(themeColors.colors.dark[700], 0.9) : withAlpha(themeColors.colors.white, 0.8),
                  color: isDarkMode ? themeColors.colors.white : themeColors.colors.dark[700],
                  border: isDarkMode ? '2px solid #374151' : 'none',
                  boxShadow: isDarkMode ? `0 4px 12px ${withAlpha(themeColors.colors.black, 0.6)}` : undefined
                } as React.CSSProperties}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {profileImages.length}
              </div>

              {/* Caption */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-base font-medium max-w-[220px] text-center">
                {profileImages[currentImageIndex].caption}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-0 mt-4">
              {profileImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 flex items-center justify-center"
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    padding: '0',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  } as React.CSSProperties}
                  aria-label={`Go to image ${index + 1}`}
                >
                  <span
                    className="rounded-full transition-all"
                    style={{
                      width: index === currentImageIndex ? '32px' : '12px',
                      height: '12px',
                      backgroundColor: index === currentImageIndex ? themeColors.colors.pink[300] : (isDarkMode ? withAlpha(themeColors.colors.pink[300], 0.3) : themeColors.colors.dark[300])
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white rounded-full w-11 h-11 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90"
              style={{ 
                backgroundColor: themeColors.colors.pink[500],
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.colors.pink[600]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeColors.colors.pink[500]}
              aria-label="Close modal"
              onClick={(e) => {
                e.stopPropagation();
                setIsClosing(true);
                setTimeout(() => {
                  setShowProfileModal(false);
                  setIsClosing(false);
                }, 300);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default About;