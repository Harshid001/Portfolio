import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { HiMenuAlt3, HiX, HiMoon, HiSun } from 'react-icons/hi';
// CHANGED: wire the logo into the cinematic portal transition.
import { usePortalTransition } from './transition/PortalTransitionProvider';
import { useGridTransition } from './transition/GridTransitionContext';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Experience', href: '#experience' },
];

const HOME_LABEL = '<HS />';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  // CHANGED: pull in the transition trigger + busy flag.
  const { triggerPortal, isTransitioning } = usePortalTransition();
  const { triggerTransition: triggerGridTransition, isTransitioning: isGridTransitioning } = useGridTransition();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [clickedLink, setClickedLink] = useState(null);
  const [navY, setNavY] = useState(0);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme !== 'light';
    }
    return true;
  });
  const { scrollY } = useScroll();

  // ---- Logo: scroll-triggered morph animation ----
  const [isScrolledLogo, setIsScrolledLogo] = useState(false);
  // ---- Nav slider state ----
  const [hoveredNav, setHoveredNav] = useState(null);

  // ---- Logo: pointer-driven parallax for the hover caption ----
  // Written directly to CSS custom properties via the ref (not React state)
  // so mousemove doesn't trigger a re-render on every pixel.
  const logoRef = useRef(null);
  const handleLogoMove = (e) => {
    const el = logoRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--mx', px.toFixed(3));
    el.style.setProperty('--my', py.toFixed(3));
  };
  const resetLogoMove = () => {
    logoRef.current?.style.setProperty('--mx', 0);
    logoRef.current?.style.setProperty('--my', 0);
  };

  // Transition trigger
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (isTransitioning || isGridTransitioning) return;
    triggerPortal({ 
      logoEl: logoRef.current, 
      targetPath: '/',
      clickX: e.clientX,
      clickY: e.clientY
    });
  };

  const logoCaption = 'Click to Level Up';

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Keep nav visible at all times by keeping navY at 0
    setNavY(0);
    // Anthropic-style logo shrink at ~25% of viewport height
    if (typeof window !== 'undefined') {
      setIsScrolledLogo(latest > window.innerHeight * 0.25);
    }
  });

  useEffect(() => {
    let scrollTimeout = null;
    const handleScrollTracking = () => {
      if (scrollTimeout) return;
      scrollTimeout = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        if (isHome && !isGridTransitioning) {
          const sections = navLinks.map((l) => l.href.slice(1));
          for (let i = sections.length - 1; i >= 0; i--) {
            const el = document.getElementById(sections[i]);
            if (el && el.getBoundingClientRect().top <= 120) {
              setActiveSection(sections[i]);
              break;
            }
          }
        }
        scrollTimeout = null;
      });
    };
    window.addEventListener('scroll', handleScrollTracking, { passive: true });

    if (localStorage.theme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    return () => window.removeEventListener('scroll', handleScrollTracking);
  }, [isHome, isGridTransitioning]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const scrollTo = (e, href) => {
    if (!isHome || isGridTransitioning) return;
    e.preventDefault();
    setIsMobileMenuOpen(false);

    // Calculate direction
    const currentIdx = navLinks.findIndex(l => l.href.slice(1) === activeSection);
    const targetIdx = navLinks.findIndex(l => l.href === href);
    const direction = targetIdx > currentIdx ? 'down' : 'up';

    setClickedLink(href);

    setTimeout(() => {
      triggerGridTransition(href, direction);
      setClickedLink(null);
      // Optimistically update active section so colors update instantly
      setActiveSection(href.slice(1));
    }, 100);
  };

  return (
    <motion.nav
      animate={{ y: isTransitioning ? -100 : navY }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 w-full z-50 flex items-center backdrop-blur-md"
      style={{
        height: '75px',
        backgroundColor: 'color-mix(in srgb, var(--color-paper) 85%, transparent)',
        borderBottom: `${isScrolled ? '1px' : '0px'} solid var(--color-ink-3)`
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full relative">
        {/* LEFT SECTION: LOGO */}
        <div className="flex-1 flex justify-start items-center">
          <div
            className="logo-base select-none" 
            style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.3rem', 
              fontWeight: 600,
              color: 'var(--color-ink)',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <motion.span 
              initial={false}
              animate={{ fontSize: isScrolledLogo ? '1em' : '1.25em' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              &lt;
            </motion.span>
            <span>H</span>
            <motion.span
              initial={false}
              animate={{ 
                width: isScrolledLogo ? 0 : "auto", 
                opacity: isScrolledLogo ? 0 : 1
              }}
              style={{ overflow: "hidden", display: "inline-flex", whiteSpace: "pre" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {"arshid "}
            </motion.span>
            <span>S</span>
            <motion.span
              initial={false}
              animate={{ 
                width: isScrolledLogo ? 0 : "auto", 
                opacity: isScrolledLogo ? 0 : 1
              }}
              style={{ overflow: "hidden", display: "inline-flex", whiteSpace: "pre" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {"oni"}
            </motion.span>
            <motion.span 
              initial={false}
              animate={{ fontSize: isScrolledLogo ? '1em' : '1.25em' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              /&gt;
            </motion.span>
          </div>
        </div>

        {/* CENTER SECTION: NAVIGATION LINKS */}
        <div 
          className="hidden lg:flex justify-center items-center h-full gap-2 xl:gap-4 shrink-0"
          onMouseLeave={() => setHoveredNav(null)}
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            const isHovered = hoveredNav === link.name;
            const showSlider = hoveredNav ? isHovered : isActive;

            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                onMouseEnter={() => setHoveredNav(link.name)}
                className="relative flex items-center justify-center transition-all duration-100"
                style={{
                  padding: '8px 16px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: (isActive || isHovered) ? 'var(--color-ink)' : 'var(--color-ink-2)',
                  transform: clickedLink === link.href ? 'scale(0.92)' : 'scale(1)',
                }}
              >
                {showSlider && (
                  <motion.div
                    layoutId="navSlider"
                    className="absolute inset-0 z-[-1]"
                    style={{ 
                      backgroundColor: 'var(--color-ink)', 
                      opacity: 0.08,
                      borderRadius: '0px' /* Square box as requested */
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 transition-colors duration-200" style={{ color: isHovered ? 'var(--color-red)' : (isActive ? 'var(--color-ink)' : 'var(--color-ink-2)') }}>{link.name}</span>
              </a>
            );
          })}
        </div>

        {/* RIGHT SECTION: ACTIONS */}
        <div className="flex-1 flex justify-end items-center gap-6 sm:gap-8 translate-x-2 lg:translate-x-6">
          <div className="hidden md:flex items-center gap-6 sm:gap-8">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary h-[40px] flex items-center justify-center transition-transform hover:scale-[1.02]"
              style={{ padding: '0 32px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.1em' }}
            >
              RESUME
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollTo(e, '#contact')}
              className="btn-primary h-[40px] flex items-center justify-center transition-transform hover:scale-[1.02]"
              style={{ padding: '0 32px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.1em' }}
            >
              CONTACT
            </a>
          </div>

          {/* THEME TOGGLE (Visible everywhere) */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-2 transition-colors"
            style={{ 
              borderColor: 'var(--color-ink)', 
              backgroundColor: 'var(--color-paper-2)',
              color: 'var(--color-ink)' 
            }}
            aria-label="Toggle Dark Mode"
          >
            <motion.div
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              {isDark ? <HiMoon size={18} /> : <HiSun size={18} />}
            </motion.div>
          </motion.button>

          {/* MOBILE HAMBURGER MENU */}
          <button
            className="w-10 h-10 flex md:hidden items-center justify-end text-3xl transition-transform active:scale-95"
            style={{ color: 'var(--color-ink)' }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 flex flex-col p-10 z-[100] md:hidden"
            style={{ backgroundColor: 'var(--color-ink)' }}
          >
            <div className="flex justify-end mb-12">
              <button
                className="text-4xl"
                style={{ color: 'var(--color-paper)' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HiX />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 0.9, x: 10 }}
                  href={link.href}
                  onClick={(e) => scrollTo(e, link.href)}
                  className="text-4xl sm:text-5xl transition-all duration-100"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: activeSection === link.href.slice(1) ? 'var(--color-red)' : 'var(--color-paper)',
                    transform: clickedLink === link.href ? 'scale(0.92)' : 'scale(1)',
                    opacity: clickedLink === link.href ? 0.8 : 1
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-red)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = activeSection === link.href.slice(1) ? 'var(--color-red)' : 'var(--color-paper)'; }}
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.a
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.9, x: 10 }}
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-4xl sm:text-5xl transition-colors mt-4"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-ink)',
                  WebkitTextStroke: '1px var(--color-paper)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-red)'; e.currentTarget.style.WebkitTextStroke = '0px'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)'; e.currentTarget.style.WebkitTextStroke = '1px var(--color-paper)'; }}
              >
                RESUME
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .logo-link {
          --mx: 0;
          --my: 0;
          display: inline-flex;
          flex-direction: column;
          padding: 4px 8px;
          margin-left: -8px;
          line-height: 1;
        }
        .logo-base {
          display: inline-block;
          font-size: 1.5rem;
          color: var(--color-ink);
          transform: translate3d(calc(var(--mx) * 4px), calc(var(--my) * 3px), 0);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), color 0.25s ease;
        }
        .logo-link:hover .logo-base,
        .logo-link:focus-visible .logo-base {
          color: var(--color-red);
          transform: translate3d(calc(var(--mx) * 4px), -6px, 0);
        }
        .logo-caption {
          display: block;
          margin-top: 2px;
          font-family: var(--font-body);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-ink-2);
          opacity: 0;
          pointer-events: none;
          transform: translate3d(calc(var(--mx) * 10px), 10px, 0);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s, opacity 0.3s ease 0.05s;
        }
        .logo-link:hover .logo-caption,
        .logo-link:focus-visible .logo-caption {
          opacity: 1;
          transform: translate3d(calc(var(--mx) * 10px), 0, 0);
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-base, .logo-caption { transition: none; }
        }
      `}</style>
    </motion.nav>
  );
};

export default Navbar;
