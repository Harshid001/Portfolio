import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import {
  FiExternalLink,
  FiMaximize2,
  FiMinimize2,
  FiMonitor,
  FiTablet,
  FiSmartphone,
  FiRefreshCw,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

const ProjectShowcase = ({
  project,
  index,
  isMaximized: propIsMaximized,
  setIsMaximized: propSetIsMaximized,
  onPrev,
  onNext,
}) => {
  const [internalMaximized, setInternalMaximized] = useState(false);
  const isMaximized =
    propIsMaximized !== undefined ? propIsMaximized : internalMaximized;
  const setIsMaximized = propSetIsMaximized || setInternalMaximized;

  const [device, setDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [viewMode, setViewMode] = useState(() => (project?.live ? 'live' : 'image'));
  const [isInteracting, setIsInteracting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [prevTitle, setPrevTitle] = useState(project?.title);
  const previewBoxRef = useRef(null);

  // Sync mode during render whenever project changes
  if (project && project.title !== prevTitle) {
    setPrevTitle(project.title);
    setViewMode(project.live ? 'live' : 'image');
    setIsInteracting(false);
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  }

  // Lock outer page scroll while interacting so live demo scrolling never distorts or moves the page
  useEffect(() => {
    if (!isInteracting) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.__lenis?.start();
      return;
    }

    // Completely lock main page scrolling across body, documentElement, and Lenis
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.__lenis?.stop();

    // Lock the current scroll position so even aggressive momentum scrolling cannot move the page
    const lockedScrollY = window.scrollY;
    const lockScrollPosition = () => {
      if (window.scrollY !== lockedScrollY) {
        window.scrollTo(0, lockedScrollY);
      }
    };
    window.addEventListener('scroll', lockScrollPosition, {
      passive: false,
      capture: true,
    });

    // Unconditionally prevent ALL wheel and touch scrolling on parent window/document.
    // The iframe has its own window/document so its internal scrolling works normally,
    // but overscroll chaining is completely blocked at the parent root.
    const preventParentScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('wheel', preventParentScroll, {
      passive: false,
      capture: true,
    });
    document.addEventListener('wheel', preventParentScroll, {
      passive: false,
      capture: true,
    });
    window.addEventListener('touchmove', preventParentScroll, {
      passive: false,
      capture: true,
    });
    document.addEventListener('touchmove', preventParentScroll, {
      passive: false,
      capture: true,
    });

    // Prevent keyboard scroll keys (Space, PageUp, PageDown, Arrows) from moving the parent page
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsInteracting(false);
        return;
      }
      if (
        [
          'Space',
          'PageUp',
          'PageDown',
          'End',
          'Home',
          'ArrowUp',
          'ArrowDown',
        ].includes(e.code)
      ) {
        if (
          e.target === document.body ||
          e.target === document.documentElement
        ) {
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    // Clicking outside the preview box exits interaction mode smoothly
    const handlePointerDownOutside = (e) => {
      if (previewBoxRef.current && !previewBoxRef.current.contains(e.target)) {
        setIsInteracting(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDownOutside);

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.__lenis?.start();
      window.removeEventListener('scroll', lockScrollPosition, {
        capture: true,
      });
      window.removeEventListener('wheel', preventParentScroll, {
        capture: true,
      });
      document.removeEventListener('wheel', preventParentScroll, {
        capture: true,
      });
      window.removeEventListener('touchmove', preventParentScroll, {
        capture: true,
      });
      document.removeEventListener('touchmove', preventParentScroll, {
        capture: true,
      });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [isInteracting]);

  if (!project) return null;

  // Computes the optimal viewport scroll position so the entire preview box (top bar, demo, bottom bar) is completely visible
  const getOptimalScrollPosition = () => {
    if (!previewBoxRef.current) return undefined;
    const rect = previewBoxRef.current.getBoundingClientRect();
    const currentScrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const boxHeight = rect.height;

    // If box fits with room to spare, center it vertically; otherwise dock 12px from the top so the control bar is clear
    if (boxHeight < viewportHeight - 24) {
      return Math.max(
        0,
        currentScrollY + rect.top - (viewportHeight - boxHeight) / 2,
      );
    }
    return Math.max(0, currentScrollY + rect.top - 12);
  };

  // Automatically adjusts the preview box to the user's viewport on clicking interact, then locks scroll
  const handleStartInteraction = () => {
    const targetTop = getOptimalScrollPosition();

    if (targetTop !== undefined) {
      let settled = false;
      const activateInteraction = () => {
        if (settled) return;
        settled = true;
        setIsInteracting(true);
      };

      if (window.__lenis) {
        window.__lenis.scrollTo(targetTop, {
          duration: 0.55,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          onComplete: activateInteraction,
        });
        setTimeout(activateInteraction, 600);
      } else {
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
        setTimeout(activateInteraction, 550);
      }
    } else {
      setIsInteracting(true);
    }
  };

  const handleRefresh = () => {
    setIsInteracting(false);
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleMaximize = (val) => {
    setIsMaximized(val);
    if (!val) {
      setIsInteracting(false);
    }
    window.dispatchEvent(
      new CustomEvent('preview:maximize', { detail: { isMaximized: val } }),
    );
    if (val && previewBoxRef.current) {
      setTimeout(() => {
        const targetTop = getOptimalScrollPosition();
        if (targetTop !== undefined) {
          if (window.__lenis) {
            window.__lenis.scrollTo(targetTop, { duration: 0.6 });
          } else {
            window.scrollTo({ top: targetTop, behavior: 'smooth' });
          }
        }
      }, 120);
    }
  };

  return (
    <div className="w-full flex flex-col h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={project.title}
          initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{
            opacity: 0,
            filter: 'blur(10px)',
            scale: 0.98,
            transition: { duration: 0.15 },
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col flex-grow"
        >
          {/* Project Preview Box: Expands and contracts in-place in both X and Y directions */}
          <motion.div
            ref={previewBoxRef}
            layout
            transition={{
              layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
            }}
            className={`w-full overflow-hidden relative ${
              isMaximized ? 'flex flex-col mb-2' : 'group mb-6 lg:mb-8'
            }`}
            style={{
              border: isMaximized
                ? '2px solid var(--color-ink)'
                : '1px solid var(--color-ink)',
              backgroundColor: isMaximized
                ? 'var(--color-paper-2)'
                : 'var(--color-paper)',
              boxShadow: isMaximized ? '8px 8px 0px var(--color-ink)' : 'none',
              height: isMaximized
                ? 'clamp(620px, 94vh, 1200px)'
                : 'clamp(260px, 52vw, 480px)',
            }}
            onTouchStart={() => {}}
          >
            {/* === MAXIMIZED IN-PLACE PREVIEW VIEW === */}
            {isMaximized ? (
              <div className="flex flex-col w-full h-full">
                {/* Top Control Bar */}
                <div
                  className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b-2 shrink-0"
                  style={{
                    borderColor: 'var(--color-ink)',
                    backgroundColor: 'var(--color-paper-3)',
                  }}
                >
                  {/* Left: Project Badge & Live Status */}
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        backgroundColor: 'var(--color-ink)',
                        color: 'var(--color-paper)',
                        padding: '3px 8px',
                      }}
                    >
                      PREVIEW // {project.title}
                    </span>

                    {project.live ? (
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE DEMO
                      </span>
                    ) : (
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                        <span className="w-2 h-2 rounded-full bg-neutral-400" />
                        STATIC PREVIEW
                      </span>
                    )}
                  </div>

                  {/* Center: Device Viewport Adjust Controls */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span
                      className="hidden md:inline text-[11px] font-mono mr-1"
                      style={{ color: 'var(--color-ink-3)' }}
                    >
                      ADJUST:
                    </span>

                    <div
                      className="flex items-center border"
                      style={{
                        borderColor: 'var(--color-ink)',
                        backgroundColor: 'var(--color-paper)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setDevice('desktop')}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer"
                        style={{
                          backgroundColor:
                            device === 'desktop'
                              ? 'var(--color-ink)'
                              : 'transparent',
                          color:
                            device === 'desktop'
                              ? 'var(--color-paper)'
                              : 'var(--color-ink)',
                        }}
                        title="Desktop View (100%)"
                      >
                        <FiMonitor className="text-sm" />
                        <span className="hidden sm:inline">DESKTOP</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDevice('tablet')}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer border-l"
                        style={{
                          borderColor: 'var(--color-ink)',
                          backgroundColor:
                            device === 'tablet'
                              ? 'var(--color-ink)'
                              : 'transparent',
                          color:
                            device === 'tablet'
                              ? 'var(--color-paper)'
                              : 'var(--color-ink)',
                        }}
                        title="Tablet View (768px)"
                      >
                        <FiTablet className="text-sm" />
                        <span className="hidden sm:inline">TABLET</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDevice('mobile')}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer border-l"
                        style={{
                          borderColor: 'var(--color-ink)',
                          backgroundColor:
                            device === 'mobile'
                              ? 'var(--color-ink)'
                              : 'transparent',
                          color:
                            device === 'mobile'
                              ? 'var(--color-paper)'
                              : 'var(--color-ink)',
                        }}
                        title="Mobile View (380px)"
                      >
                        <FiSmartphone className="text-sm" />
                        <span className="hidden sm:inline">MOBILE</span>
                      </button>
                    </div>

                    {/* Switch Projects: Prev and Next buttons */}
                    {(onPrev || onNext) && (
                      <div
                        className="flex items-center border ml-1 sm:ml-2"
                        style={{
                          borderColor: 'var(--color-ink)',
                          backgroundColor: 'var(--color-paper)',
                        }}
                      >
                        {onPrev && (
                          <button
                            type="button"
                            onClick={onPrev}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer"
                            style={{
                              backgroundColor: 'transparent',
                              color: 'var(--color-ink)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                'var(--color-ink)';
                              e.currentTarget.style.color = 'var(--color-paper)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                'transparent';
                              e.currentTarget.style.color = 'var(--color-ink)';
                            }}
                            title="Previous Project"
                          >
                            <FiChevronLeft className="text-sm" />
                            <span>PREV</span>
                          </button>
                        )}
                        {onNext && (
                          <button
                            type="button"
                            onClick={onNext}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer border-l"
                            style={{
                              borderColor: 'var(--color-ink)',
                              backgroundColor: 'transparent',
                              color: 'var(--color-ink)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                'var(--color-ink)';
                              e.currentTarget.style.color = 'var(--color-paper)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                'transparent';
                              e.currentTarget.style.color = 'var(--color-ink)';
                            }}
                            title="Next Project"
                          >
                            <span>NEXT</span>
                            <FiChevronRight className="text-sm" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Refresh button for live iframe */}
                    {project.live && (
                      <button
                        type="button"
                        onClick={handleRefresh}
                        className="p-1.5 border transition-colors cursor-pointer ml-1"
                        style={{
                          borderColor: 'var(--color-ink)',
                          backgroundColor: 'var(--color-paper)',
                          color: 'var(--color-ink)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            'var(--color-ink)';
                          e.currentTarget.style.color = 'var(--color-paper)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            'var(--color-paper)';
                          e.currentTarget.style.color = 'var(--color-ink)';
                        }}
                        title="Refresh website"
                        aria-label="Refresh preview"
                      >
                        <FiRefreshCw
                          className={`text-sm ${isLoading ? 'animate-spin' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Right: Exit Interaction (when active), External Link & Minimize Button */}
                  <div className="flex items-center gap-2">
                    {/* Active Interaction Mode: Exit Button in Top Control Bar */}
                    {isInteracting && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsInteracting(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono cursor-pointer transition-all shadow-sm"
                        style={{
                          border: '1px solid var(--color-ink)',
                          backgroundColor: 'var(--color-ink)',
                          color: 'var(--color-paper)',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-red, #ff4757)';
                          e.currentTarget.style.borderColor = 'var(--color-red, #ff4757)';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-ink)';
                          e.currentTarget.style.borderColor = 'var(--color-ink)';
                          e.currentTarget.style.color = 'var(--color-paper)';
                        }}
                        title="Exit interaction mode and restore page scroll (ESC)"
                      >
                        <FiX className="text-sm" />
                        <span>EXIT INTERACTION (ESC)</span>
                      </button>
                    )}

                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-mono transition-all cursor-pointer"
                        style={{
                          border: '1px solid var(--color-ink)',
                          backgroundColor: 'transparent',
                          color: 'var(--color-ink)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            'var(--color-ink)';
                          e.currentTarget.style.color = 'var(--color-paper)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--color-ink)';
                        }}
                      >
                        <FiExternalLink className="text-sm" />
                        <span>OPEN</span>
                      </a>
                    )}

                    {/* Minimize button: collapses the box in-place */}
                    <button
                      type="button"
                      onClick={() => handleMaximize(false)}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono cursor-pointer transition-all shadow-sm"
                      style={{
                        border: '1px solid var(--color-ink)',
                        backgroundColor: 'var(--color-ink)',
                        color: 'var(--color-paper)',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                      }}
                      title="Minimize preview back to normal size"
                    >
                      <FiMinimize2 className="text-sm" />
                      <span>MINIMIZE</span>
                    </button>
                  </div>
                </div>

                {/* Viewport Workbench / Preview Canvas */}
                <div
                  className={`flex-grow w-full overflow-hidden flex items-center justify-center relative ${
                    device === 'desktop' ? 'p-0' : 'p-2 sm:p-4'
                  }`}
                  style={{
                    backgroundColor: 'var(--color-paper)',
                    backgroundImage:
                      'radial-gradient(var(--color-paper-3) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  {/* Device Container with Responsive Width Adjustment */}
                  <div
                    className={`h-full flex flex-col transition-all duration-300 ease-out relative ${
                      device === 'desktop'
                        ? 'w-full'
                        : device === 'tablet'
                          ? 'w-[768px] max-w-full border-2 border-[var(--color-ink)] shadow-2xl bg-white'
                          : 'w-[380px] max-w-full border-4 border-[var(--color-ink)] rounded-[24px] overflow-hidden shadow-2xl bg-white my-auto max-h-[95%]'
                    }`}
                  >
                    {/* Mobile Device Speaker Notch */}
                    {device === 'mobile' && (
                      <div className="w-full bg-neutral-900 py-1.5 flex items-center justify-center shrink-0 border-b border-neutral-800">
                        <div className="w-16 h-2.5 rounded-full bg-neutral-800 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 mr-2" />
                          <div className="w-7 h-1 rounded-full bg-neutral-700" />
                        </div>
                      </div>
                    )}

                    {/* View Content: Live iframe or Static Image */}
                    {viewMode === 'live' && project.live ? (
                      <div
                        className="relative w-full h-full flex-grow overflow-hidden bg-white"
                        style={{ overscrollBehavior: 'contain' }}
                      >
                        {project.image && (
                          <img
                            src={project.image}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}

                        <iframe
                          key={iframeKey}
                          src={project.live}
                          title={`${project.title} live preview`}
                          className="relative z-10 w-full h-full border-0 bg-white"
                          style={{ overscrollBehavior: 'contain' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        />

                        {/* Preview Mode Overlay: Shows 'CLICK TO INTERACT' and allows normal outer page scrolling */}
                        {!isInteracting && (
                          <div
                            onClick={handleStartInteraction}
                            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/25 backdrop-blur-[1px] transition-all duration-300 cursor-pointer group/overlay hover:bg-black/35"
                            title="Click to interact with live demo"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartInteraction();
                              }}
                              className="flex items-center gap-3 px-6 py-3 border-2 shadow-2xl transition-all duration-300 transform group-hover/overlay:scale-105 cursor-pointer"
                              style={{
                                backgroundColor: 'var(--color-ink)',
                                borderColor: 'var(--color-paper)',
                                color: 'var(--color-paper)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '13px',
                                fontWeight: 700,
                                letterSpacing: '0.12em',
                                boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                              }}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>CLICK TO INTERACT</span>
                            </button>
                            <span
                              className="mt-3 px-3 py-1 text-[11px] font-mono tracking-wider uppercase border text-center shadow-md"
                              style={{
                                backgroundColor: 'var(--color-paper)',
                                borderColor: 'var(--color-ink)',
                                color: 'var(--color-ink)',
                              }}
                            >
                              Locks page scroll for seamless demo interaction
                            </span>
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="w-full h-full flex-grow overflow-auto flex items-start justify-center p-2 sm:p-4 bg-neutral-950">
                        <img
                          src={project.image}
                          alt={`${project.title} full screenshot`}
                          className="max-w-full h-auto object-contain border border-neutral-800 shadow-xl"
                        />
                      </div>
                    )}

                    {/* Mobile Device Home Bar */}
                    {device === 'mobile' && (
                      <div className="w-full bg-neutral-900 py-1.5 flex items-center justify-center shrink-0 border-t border-neutral-800">
                        <div className="w-28 h-1 rounded-full bg-neutral-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Bar: Quick Info & Resolution */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-t-2 text-xs shrink-0"
                  style={{
                    borderColor: 'var(--color-ink)',
                    backgroundColor: 'var(--color-paper-3)',
                  }}
                >
                  <span className="font-mono text-[11px] text-[var(--color-ink-3)]">
                    VIEWPORT:{' '}
                    {device === 'desktop'
                      ? 'FULL WIDTH'
                      : device === 'tablet'
                        ? '768 × 1024'
                        : '380 × 800'}
                  </span>

                  <div className="flex items-center gap-3">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 font-mono text-[11px] hover:underline"
                        style={{ color: 'var(--color-ink)' }}
                      >
                        <FaGithub className="text-sm" /> CODE
                      </a>
                    )}

                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 hover:underline"
                      >
                        <FiExternalLink className="text-sm" /> LIVE SITE
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* === NORMAL 16:9 THUMBNAIL VIEW === */
              <>
                {/* Top-Right Maximize Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMaximize(true);
                  }}
                  aria-label={`Maximize ${project.title} preview`}
                  className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 cursor-pointer shadow-md"
                  style={{
                    backgroundColor: 'var(--color-paper)',
                    color: 'var(--color-ink)',
                    border: '1px solid var(--color-ink)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-ink)';
                    e.currentTarget.style.color = 'var(--color-paper)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      'var(--color-paper)';
                    e.currentTarget.style.color = 'var(--color-ink)';
                  }}
                >
                  <FiMaximize2 className="text-sm" />
                  <span className="hidden sm:inline">MAXIMIZE</span>
                </button>

                {project.image ? (
                  <>
                    <picture>
                      {project.imageWebp && (
                        <source srcSet={project.imageWebp} type="image/webp" />
                      )}
                      <img
                        src={project.image}
                        alt={`${project.title} project screenshot`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-active:grayscale-0 group-hover:scale-105 group-active:scale-105"
                      />
                    </picture>
                    <div className="absolute inset-0 bg-black/70 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 group-hover:opacity-100 group-active:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                      <span className="absolute top-4 text-white/70 text-xs tracking-widest font-mono lg:hidden pointer-events-none">
                        TAP TO VIEW LINKS
                      </span>

                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2.5 px-6 py-3 min-w-[160px] h-[46px] transition-all duration-300 shadow-md box-border"
                          style={{
                            border: '1px solid #f5f2ed',
                            backgroundColor: '#f5f2ed',
                            color: '#0d0d0d',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            lineHeight: 1,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'transparent';
                            e.currentTarget.style.color = '#f5f2ed';
                            e.currentTarget.style.borderColor = '#f5f2ed';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f2ed';
                            e.currentTarget.style.color = '#0d0d0d';
                            e.currentTarget.style.borderColor = '#f5f2ed';
                          }}
                        >
                          <FiExternalLink className="text-lg shrink-0" /> LIVE DEMO
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2.5 px-6 py-3 min-w-[160px] h-[46px] transition-all duration-300 shadow-md box-border"
                          style={{
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            backgroundColor: '#0d0d0d',
                            color: '#f5f2ed',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            lineHeight: 1,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#24292e';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor =
                              'rgba(255, 255, 255, 0.7)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#0d0d0d';
                            e.currentTarget.style.color = '#f5f2ed';
                            e.currentTarget.style.borderColor =
                              'rgba(255, 255, 255, 0.3)';
                          }}
                        >
                          <FaGithub className="text-lg shrink-0" /> GITHUB
                        </a>
                      )}
                      {!project.live && !project.github && (
                        <span
                          style={{
                            color: 'var(--color-paper)',
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.1em',
                          }}
                        >
                          COMING SOON
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-3 font-mono text-sm uppercase tracking-widest">
                    No preview available
                  </div>
                )}
              </>
            )}
          </motion.div>

          <motion.div
            layout
            animate={{
              opacity: isMaximized ? 0.7 : 1,
              y: isMaximized ? 16 : 0,
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col flex-grow"
          >
            {/* Title & Number Inline */}
            <div className="flex items-baseline gap-4 mb-4">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  color: 'var(--color-ink)',
                  opacity: 0.3,
                  fontWeight: 700,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  color: 'var(--color-ink)',
                  lineHeight: 1.1,
                }}
              >
                {project.title}
              </h3>
            </div>

            {/* Description */}
            <p
              className="mb-6"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-ink-2)',
                fontSize: 'clamp(15px, 2vw, 16px)',
                lineHeight: 1.6,
                maxWidth: '65ch',
              }}
            >
              {project.description}
            </p>

            {/* Tech Stack */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t, i) => (
                  <span
                    key={i}
                    className="tag rounded-none transition-colors duration-300"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-ink)',
                      border: '1px solid var(--color-ink)',
                      fontSize: '11px',
                      padding: '4px 10px',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'var(--color-ink)';
                      e.currentTarget.style.color = 'var(--color-paper)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-ink)';
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProjectShowcase;
