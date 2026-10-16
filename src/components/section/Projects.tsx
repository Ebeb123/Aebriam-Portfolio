import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ExternalLink, Code, Terminal, ChevronLeft, ChevronRight, MonitorPlay, Github, Star } from 'lucide-react';
import { fetchPortfolioRepos, githubConfig, githubSnapshot, languageColor, sortRepos } from '../../lib/github';
import type { GithubRepoInfo } from '../../content/types';
import ProjectPreviewModal from '../ProjectPreviewModal';
import { useContent } from '../../contexts/ContentContext';
import { resolveImage } from '../../content/icons';

// Code symbols that float in the background (drag them around)
const GLYPHS = ['{ }', '</>', '01', '#', '$_', '&&', '[ ]', '=>', '0x', '::', '//', '!=', '++', '()'];
import { comingSoon } from '../../assets';

const Projects = () => {
  const { isDarkMode } = useDarkMode();
  const themeColors = useThemeColors();

  // track all the random background stars
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; image: string; isDragging: boolean }>>([]);
  const [draggedStar, setDraggedStar] = useState<number | null>(null);

  // the special "drag me" star
  const [specialStar, setSpecialStar] = useState<{ x: number; y: number }>({ x: 85, y: 8 });
  const [isDraggingSpecial, setIsDraggingSpecial] = useState(false);

  // carousel state
  const [currentPage, setCurrentPage] = useState(0);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const projectsPerPage = 4;

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    // spawn stars when component mounts or dark mode changes
    const generatedStars = Array.from({ length: 30 }, (_, i) => {
      let x, y;

      // Keep stars away from the title and cards area (roughly 20-80% horizontally, 15-85% vertically)
      const zone = i % 4;
      if (zone === 0) {
        // top area - above the title
        x = Math.random() * 90 + 5;
        y = Math.random() * 10; // Only in top 10%
      } else if (zone === 1) {
        // bottom area - below the cards
        x = Math.random() * 90 + 5;
        y = Math.random() * 10 + 90; // Only in bottom 10%
      } else if (zone === 2) {
        // left side
        x = Math.random() * 15; // Only in left 15%
        y = Math.random() * 60 + 20; // Middle vertical area
      } else {
        // right side
        x = Math.random() * 15 + 85; // Only in right 15%
        y = Math.random() * 60 + 20; // Middle vertical area
      }

      return {
        id: i,
        x: x,
        y: y,
        image: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        isDragging: false
      };
    });
    setStars(generatedStars);
  }, [isDarkMode]);

  // Drag handlers for special star
  const handleSpecialStarMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingSpecial(true);
    isDraggingRef.current = true;
  };

  const handleSpecialStarTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingSpecial(true);
    isDraggingRef.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSpecial && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Keep within bounds
        const clampedX = Math.max(0, Math.min(95, x));
        const clampedY = Math.max(0, Math.min(95, y));

        setSpecialStar({ x: clampedX, y: clampedY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingSpecial && containerRef.current && e.touches.length > 0) {
        const rect = containerRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;

        // Keep within bounds
        const clampedX = Math.max(0, Math.min(95, x));
        const clampedY = Math.max(0, Math.min(95, y));

        setSpecialStar({ x: clampedX, y: clampedY });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSpecial(false);
      isDraggingRef.current = false;
    };

    const handleTouchEnd = () => {
      setIsDraggingSpecial(false);
      isDraggingRef.current = false;
    };

    if (isDraggingSpecial) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingSpecial]);

  // Drag handlers for regular stars
  const handleStarMouseDown = (starId: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedStar(starId);
    isDraggingRef.current = true;
    setStars(prevStars =>
      prevStars.map(s => s.id === starId ? { ...s, isDragging: true } : s)
    );
  };

  const handleStarTouchStart = (starId: number) => (e: React.TouchEvent) => {
    e.stopPropagation();
    setDraggedStar(starId);
    isDraggingRef.current = true;
    setStars(prevStars =>
      prevStars.map(s => s.id === starId ? { ...s, isDragging: true } : s)
    );
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedStar !== null && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Keep within bounds
        const clampedX = Math.max(0, Math.min(95, x));
        const clampedY = Math.max(0, Math.min(95, y));

        setStars(prevStars =>
          prevStars.map(s =>
            s.id === draggedStar ? { ...s, x: clampedX, y: clampedY } : s
          )
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (draggedStar !== null && containerRef.current && e.touches.length > 0) {
        const rect = containerRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;

        // Keep within bounds
        const clampedX = Math.max(0, Math.min(95, x));
        const clampedY = Math.max(0, Math.min(95, y));

        setStars(prevStars =>
          prevStars.map(s =>
            s.id === draggedStar ? { ...s, x: clampedX, y: clampedY } : s
          )
        );
      }
    };

    const handleMouseUp = () => {
      if (draggedStar !== null) {
        setStars(prevStars =>
          prevStars.map(s => s.id === draggedStar ? { ...s, isDragging: false } : s)
        );
        setDraggedStar(null);
        isDraggingRef.current = false;
      }
    };

    const handleTouchEnd = () => {
      if (draggedStar !== null) {
        setStars(prevStars =>
          prevStars.map(s => s.id === draggedStar ? { ...s, isDragging: false } : s)
        );
        setDraggedStar(null);
        isDraggingRef.current = false;
      }
    };

    if (draggedStar !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggedStar]);

  // project data - these are the main cards
  const { content } = useContent();
  const gh = githubConfig;

  // Repos tagged with your portfolio topic on GitHub (snapshot first, then live)
  const [ghRepos, setGhRepos] = useState<GithubRepoInfo[]>(() => sortRepos(githubSnapshot, gh.order));
  useEffect(() => {
    if (!gh.username) return;
    let alive = true;
    fetchPortfolioRepos()
      .then((live) => { if (alive) setGhRepos(live); })
      .catch(() => { /* keep the build-time snapshot */ });
    return () => { alive = false; };
  }, [gh.username]);

  type Tag = { label: string; color?: string };
  type CardItem = {
    key: string;
    title: string;
    description: string;
    icon?: string;
    monogram?: { text: string; color: string };
    tags: Tag[];
    preview: { kind: 'modal'; slug: string } | { kind: 'link'; url: string } | null;
    details: { kind: 'internal'; to: string } | { kind: 'external'; url: string };
    codeUrl?: string;
    meta?: string;
  };

  const manualCards: CardItem[] = content.projects.map((p) => ({
    key: `p-${p.slug}`,
    title: p.title,
    description: p.summary,
    icon: resolveImage(p.icon) || comingSoon,
    tags: p.technologies.filter((t) => t.trim() !== '').map((label) => ({ label })),
    preview: { kind: 'modal', slug: p.slug },
    details: { kind: 'internal', to: `/projects/${p.slug}` },
    codeUrl: p.githubUrl || undefined,
  }));

  const timeAgo = (iso: string) => {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (!iso || Number.isNaN(days)) return '';
    if (days < 1) return 'updated today';
    if (days < 30) return `updated ${days}d ago`;
    if (days < 365) return `updated ${Math.floor(days / 30)}mo ago`;
    return `updated ${Math.floor(days / 365)}y ago`;
  };

  const githubCards: CardItem[] = ghRepos.map((r) => {
    const top = r.languages[0]?.name ?? '';
    const initials = r.name.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'GH';
    return {
      key: `gh-${r.name}`,
      title: r.name,
      description: r.description || 'No description yet — add one in the repo’s About section on GitHub.',
      monogram: { text: initials, color: top ? languageColor(top) : '#475569' },
      tags: [
        ...r.languages.slice(0, 4).map((l) => ({ label: `${l.name} ${l.pct}%`, color: languageColor(l.name) })),
        ...(gh.showTopics ? r.topics.slice(0, 4).map((t) => ({ label: `#${t}` })) : []),
      ],
      preview: r.homepage ? { kind: 'link', url: r.homepage.startsWith('http') ? r.homepage : `https://${r.homepage}` } : null,
      details: { kind: 'external', url: r.htmlUrl },
      meta: [r.stars > 0 ? `★ ${r.stars}` : '', timeAgo(r.pushedAt)].filter(Boolean).join(' · '),
    };
  });

  const projects = gh.position === 'before' ? [...githubCards, ...manualCards] : [...manualCards, ...githubCards];
  const previewProject = content.projects.find((p) => p.slug === previewSlug);


  // Calculate carousel pagination
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const startIndex = currentPage * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  // Create placeholder cards for "Coming Soon" projects
  const placeholderCount = projectsPerPage - currentProjects.length;
  const placeholders = Array.from({ length: placeholderCount }, (_, i) => ({
    id: `placeholder-${i}`,
    isPlaceholder: true
  }));

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setDirection('left');
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setDirection('right');
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <section
      id="projects"
      className="py-20 relative transition-colors duration-300"
      style={{
        background: themeColors.background.sections?.projects || themeColors.background.gradient,
        transition: 'background 0.3s ease-in-out'
      }}
      ref={containerRef}
    >
      {/* Gradient overlay for smooth transition from previous section */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '150px',
          background: isDarkMode
            ? `linear-gradient(180deg, ${themeColors.background.gradientEnd} 0%, transparent 100%)`
            : `linear-gradient(180deg, ${themeColors.colors.pink[25]} 0%, transparent 100%)`,
          zIndex: 2
        }}
      />
      {/* Special Drag Me Star - Interactive with Click Me arrow */}
      <div
        className="special-draggable-star"
        onMouseDown={handleSpecialStarMouseDown}
        onTouchStart={handleSpecialStarTouchStart}
        style={{
          position: 'absolute',
          left: `${specialStar.x}%`,
          top: `${specialStar.y}%`,
          width: '44px',
          height: '44px',
          zIndex: 15,
          cursor: isDraggingSpecial ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <span
          className="glyph-token glyph-token--special"
          style={{
            color: isDarkMode ? '#8DB4D9' : '#2E5C86',
            borderColor: isDarkMode ? '#2E5C86' : '#8DB4D9',
            background: isDarkMode ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          }}
        >
          &lt;/&gt;
        </span>
      </div>

      {/* Static "drag me!" text with arrow */}
      <div
        style={{
          position: 'absolute',
          left: '85%',
          top: '5%',
          zIndex: 16,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none'
        }}
      >
        <span aria-hidden="true" style={{ marginLeft: '48px', fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', color: isDarkMode ? '#5B8FC2' : '#8DB4D9' }}>
          ←
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            letterSpacing: '0.04em',
            color: isDarkMode ? '#8DB4D9' : '#2E5C86',
            fontWeight: 600,
            userSelect: 'none',
          }}
        >
          // drag me
        </span>
      </div>

      {/* all the regular draggable stars scattered around */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="draggable-star"
          onMouseDown={handleStarMouseDown(star.id)}
          onTouchStart={handleStarTouchStart(star.id)}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: '50px',
            height: '50px',
            zIndex: 1,
            cursor: star.isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          <span
            className="glyph-token"
            style={{ color: isDarkMode ? 'rgba(141, 180, 217, 0.45)' : 'rgba(46, 92, 134, 0.35)' }}
          >
            {star.image}
          </span>
        </div>
      ))}

      {/* main content container with the project cards */}
      <TooltipProvider delayDuration={200}>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center justify-center gap-1 mb-4">
            <h2 className="text-4xl font-bold" style={{ color: isDarkMode ? themeColors.colors.white : themeColors.colors.pink[500] }}>Projects</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="inline-flex items-center justify-center bg-transparent border-none outline-none focus:outline-none" 
                  style={{ minWidth: '44px', minHeight: '44px' }}
                  aria-label="Information about project icons"
                >
                  <Terminal
                    className="h-5 w-5 cursor-pointer transition-colors"
                    style={{ color: themeColors.primary }}
                    onMouseEnter={(e) => e.currentTarget.style.color = themeColors.secondary}
                    onMouseLeave={(e) => e.currentTarget.style.color = themeColors.primary}
                    fill="none"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-gray-800 border-pink-200">
                <p>hit Preview to see a project in action</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-center mb-12 text-lg text-gray-600 dark:text-gray-300">
            Here are some of the projects I've worked on recently
          </p>

          {/* grid layout for project cards */}
          <div
            key={currentPage}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8"
            style={{
              animation: `slideIn${direction === 'right' ? 'Right' : 'Left'} 0.4s ease-out`
            }}
          >
            {currentProjects.map((project) => (
              <Card key={project.key} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative" style={{
                backgroundColor: themeColors.card.background,
                border: `1px solid ${themeColors.card.border}`
              }} aria-label={`${project.title} project`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {project.icon ? (
                      <img
                        src={project.icon}
                        alt={`${project.title} icon`}
                        className="w-12 h-12 rounded-lg object-cover"
                        loading="lazy"
                        width="48"
                        height="48"
                      />
                    ) : project.monogram ? (
                      <div
                        className="w-12 h-12 shrink-0 rounded-lg flex items-center justify-center font-mono font-bold text-sm"
                        style={{ background: isDarkMode ? '#0B1220' : '#1E293B', color: '#E2E8F0', borderBottom: `3px solid ${project.monogram.color}` }}
                        aria-hidden="true"
                      >
                        {project.monogram.text}
                      </div>
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl dark:text-gray-100 transition-colors group-hover:!text-pink-500 dark:group-hover:!text-pink-400 flex items-center gap-2">
                        {project.details.kind === 'external' && <Github className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />}
                        <span className="truncate">{project.title}</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                        {project.description}
                      </CardDescription>
                      {project.meta && (
                        <p className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {project.meta.includes('★') && <Star className="h-3 w-3" aria-hidden="true" />}
                          {project.meta.replace('★ ', '')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="flex flex-wrap gap-2 mb-4" style={{ flex: '1 0 auto' }}>
                    {project.tags.map((tag) => (
                      <Badge key={tag.label} variant="secondary" className="text-xs inline-flex items-center gap-1.5"
                        style={{
                          backgroundColor: themeColors.interactive.primary,
                          color: themeColors.text.accent,
                          borderColor: themeColors.primary,
                          border: '1px solid'
                        }}>
                        {tag.color && <span className="inline-block w-2 h-2 rounded-full" style={{ background: tag.color }} aria-hidden="true" />}
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-3" style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    {project.preview?.kind === 'modal' && (
                      <button type="button" onClick={() => setPreviewSlug((project.preview as { slug: string }).slug)} className="project-btn flex items-center gap-1" style={{ color: 'white' }} aria-label={`Preview ${project.title}`}>
                        <MonitorPlay className="h-4 w-4" aria-hidden="true" />
                        Preview
                      </button>
                    )}
                    {project.preview?.kind === 'link' && (
                      <a href={project.preview.url} target="_blank" rel="noopener noreferrer" className="project-btn flex items-center gap-1" style={{ color: 'white', textDecoration: 'none' }} aria-label={`Open the live ${project.title} site (new tab)`}>
                        <MonitorPlay className="h-4 w-4" aria-hidden="true" />
                        Preview
                      </a>
                    )}
                    {project.details.kind === 'internal' ? (
                      <Link to={project.details.to} className="project-btn-outline flex items-center gap-1" style={{ textDecoration: 'none' }} aria-label={`View ${project.title} project details`}>
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Details
                      </Link>
                    ) : (
                      <a href={project.details.url} target="_blank" rel="noopener noreferrer" className="project-btn-outline flex items-center gap-1" style={{ textDecoration: 'none' }} aria-label={`Open ${project.title} on GitHub (new tab)`}>
                        <Github className="h-4 w-4" aria-hidden="true" />
                        Details
                      </a>
                    )}
                    {project.codeUrl && (
                      <a href={project.codeUrl} className="project-btn-outline flex items-center gap-1" style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} source code on GitHub`}>
                        <Code className="h-4 w-4" aria-hidden="true" />
                        Code
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Placeholder "Coming Soon" cards */}
            {placeholders.map((placeholder) => (
              <Card key={placeholder.id} className="group relative" style={{
                backgroundColor: themeColors.card.background,
                border: `1px dashed ${themeColors.card.border}`,
                opacity: 0.5
              }} aria-label="Coming soon project">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <img
                      src={comingSoon}
                      alt="Coming soon"
                      className="w-12 h-12 rounded-lg object-cover opacity-60"
                      loading="lazy"
                      width="48"
                      height="48"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-xl" style={{ color: isDarkMode ? themeColors.colors.white : themeColors.colors.dark[600] }}>
                        Coming Soon
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                        More exciting projects on the way! Check back soon to see what I'm working on next.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="flex flex-wrap gap-2 mb-4" style={{ flex: '1 0 auto' }}>
                    <Badge variant="secondary" className="text-xs" style={{
                      backgroundColor: themeColors.interactive.primary,
                      color: themeColors.text.accent,
                      borderColor: themeColors.primary,
                      border: '1px solid',
                      opacity: 0.5
                    }}>
                      TBA
                    </Badge>
                  </div>
                  <div className="flex gap-3 opacity-30" style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    <div className="project-btn flex items-center gap-1" style={{ pointerEvents: 'none' }}>
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Details
                    </div>
                    <div className="project-btn-outline flex items-center gap-1" style={{ pointerEvents: 'none' }}>
                      <Code className="h-4 w-4" aria-hidden="true" />
                      Code
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Carousel navigation - subtle dots at bottom */}
          <div className="flex items-center justify-center gap-3 mt-4 relative z-10" style={{ minHeight: '32px' }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="transition-all duration-200 hover:scale-110"
              style={{
                color: isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[400],
                opacity: currentPage === 0 ? 0.2 : 0.6,
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                background: 'none',
                border: 'none',
                padding: '4px',
                minWidth: '28px',
                minHeight: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Previous projects"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Page dots */}
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i !== currentPage) {
                      setDirection(i > currentPage ? 'right' : 'left');
                      setCurrentPage(i);
                    }
                  }}
                  className="transition-all duration-200"
                  style={{
                    width: currentPage === i ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: currentPage === i
                      ? (isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[400])
                      : (isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[400]),
                    opacity: currentPage === i ? 1 : 0.3,
                    cursor: 'pointer',
                    border: 'none',
                    padding: 0
                  }}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="transition-all duration-200 hover:scale-110"
              style={{
                color: isDarkMode ? themeColors.colors.pink[300] : themeColors.colors.pink[400],
                opacity: currentPage === totalPages - 1 ? 0.2 : 0.6,
                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                background: 'none',
                border: 'none',
                padding: '4px',
                minWidth: '28px',
                minHeight: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Next projects"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </TooltipProvider>
      
      {/* Gradient overlay for smooth transition to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '150px',
          background: isDarkMode
            ? `linear-gradient(180deg, transparent 0%, ${themeColors.background.gradientEnd} 100%)`
            : `linear-gradient(180deg, transparent 0%, ${themeColors.colors.pink[25]} 100%)`,
          zIndex: 1
        }}
      />
      <ProjectPreviewModal
        open={previewSlug !== null}
        onClose={() => setPreviewSlug(null)}
        title={previewProject?.title ?? ''}
        preview={previewProject?.preview}
      />
    </section>
  );
};

export default Projects;