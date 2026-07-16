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

  // ---- Logo: one-time boot-up typewriter on route change ----
  const [logoText, setLogoText] = useState('');
  useEffect(() => {
    setLogoText('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLogoText(HOME_LABEL.slice(0, i));
      if (i >= HOME_LABEL.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, [location.pathname]);

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
    const prev = scrollY.getPrevious();
    if (latest < 80) {
      setNavY(0);
    } else if (latest > prev && latest > 150) {
      setNavY(-100);
    } else {
      setNavY(0);
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
      className="fixed top-0 left-0 w-full z-50 flex items-center nav-dots"
      style={{
        height: '60px',
        backgroundColor: 'var(--color-paper)',
        borderBottom: `${isScrolled ? '3px' : '2px'} solid var(--color-ink)`
      }}
    >
      <div className="w-full max-w-7xl mx-auto pl-4 sm:pl-6 lg:pl-8 pr-20 md:pr-28 flex justify-between items-center h-full">
        <div
          className="logo-base select-none" 
          style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.5rem', 
            color: 'var(--color-ink)',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          {logoText}
          <span className="logo-cursor" style={{ marginLeft: '2px', animation: 'blink 1s steps(1) infinite' }}>|</span>
        </div>

        <div className="hidden md:flex items-center h-full">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className="h-full flex items-center px-5 cursor-none transition-all duration-100"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: activeSection === link.href.slice(1) ? 'var(--color-ink)' : 'var(--color-ink-2)',
                borderBottom: activeSection === link.href.slice(1) ? '2px solid var(--color-ink)' : '2px solid transparent',
                transform: clickedLink === link.href ? 'scale(0.92)' : 'scale(1)',
                opacity: clickedLink === link.href ? 0.8 : 1
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-red)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = activeSection === link.href.slice(1) ? 'var(--color-ink)' : 'var(--color-ink-2)'; }}
            >
              {link.name}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary cursor-none ml-4 h-[40px] flex items-center"
            style={{ padding: '0 24px' }}
          >
            RESUME
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollTo(e, '#contact')}
            className="btn-primary cursor-none ml-4 h-[40px] flex items-center"
            style={{ padding: '0 24px' }}
          >
            CONTACT
          </a>
        </div>

        <div className="flex items-center md:hidden gap-4">
          <button
            className="w-11 h-11 flex items-center justify-center text-3xl cursor-none"
            style={{ color: 'var(--color-ink)' }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
          </button>
        </div>
      </div>

      {/* Theme Toggle - unchanged, present on every page */}
      <div className="absolute right-4 md:right-8 lg:right-10 top-0 h-full flex items-center z-50">
        <button
          onClick={toggleTheme}
          className="hidden md:block relative cursor-none transition-colors border-2"
          style={{
            width: '56px',
            height: '28px',
            borderRadius: '14px',
            backgroundColor: 'var(--color-paper-2)',
            borderColor: 'var(--color-ink)'
          }}
          aria-label="Toggle Dark Mode"
        >
          <motion.div
            className="absolute z-0 w-[22px] h-[22px] rounded-full"
            style={{ backgroundColor: 'var(--color-ink)', top: '1px', left: '1px' }}
            initial={false}
            animate={{ x: isDark ? 28 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
          <div className="absolute left-0 top-0 w-[24px] h-[24px] flex items-center justify-center z-10 pointer-events-none">
            <HiSun className="text-[13px] transition-colors duration-300" style={{ color: !isDark ? 'var(--color-paper)' : 'var(--color-ink)' }} />
          </div>
          <div className="absolute right-0 top-0 w-[24px] h-[24px] flex items-center justify-center z-10 pointer-events-none">
            <HiMoon className="text-[13px] transition-colors duration-300" style={{ color: isDark ? 'var(--color-paper)' : 'var(--color-ink)' }} />
          </div>
        </button>

        <button
          onClick={toggleTheme}
          className="md:hidden relative cursor-none transition-colors border-2"
          style={{
            width: '52px',
            height: '26px',
            borderRadius: '13px',
            backgroundColor: 'var(--color-paper-2)',
            borderColor: 'var(--color-ink)'
          }}
          aria-label="Toggle Dark Mode"
        >
          <motion.div
            className="absolute z-0 w-5 h-5 rounded-full"
            style={{ backgroundColor: 'var(--color-ink)', top: '1px', left: '1px' }}
            initial={false}
            animate={{ x: isDark ? 26 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
          <div className="absolute left-0 top-0 w-[22px] h-[22px] flex items-center justify-center z-10 pointer-events-none">
            <HiSun className="text-[12px] transition-colors duration-300" style={{ color: !isDark ? 'var(--color-paper)' : 'var(--color-ink)' }} />
          </div>
          <div className="absolute right-0 top-0 w-[22px] h-[22px] flex items-center justify-center z-10 pointer-events-none">
            <HiMoon className="text-[12px] transition-colors duration-300" style={{ color: isDark ? 'var(--color-paper)' : 'var(--color-ink)' }} />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 flex flex-col p-10 z-[100] md:hidden cursor-none"
            style={{ backgroundColor: 'var(--color-ink)' }}
          >
            <div className="flex justify-end mb-12">
              <button
                className="text-4xl cursor-none"
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
                  className="text-4xl sm:text-5xl cursor-none transition-all duration-100"
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
                className="text-4xl sm:text-5xl cursor-none transition-colors mt-4"
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
        .logo-cursor {
          display: inline-block;
          margin-left: 2px;
          animation: blink 1s steps(1) infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-cursor { animation: none; opacity: 1; }
          .logo-base, .logo-caption { transition: none; }
        }
      `}</style>
    </motion.nav>
  );
};

export default Navbar;
