import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { HiMenuAlt3, HiX, HiMoon, HiSun } from 'react-icons/hi';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Experience', href: '#experience' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [navY, setNavY] = useState(-100);
  const [isDark, setIsDark] = useState(() => {
    // Check local storage or classlist on initial render
    if (typeof window !== 'undefined') {
      return localStorage.theme !== 'light';
    }
    return true;
  });
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious();
    if (latest < 80) {
      setNavY(-100);
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
        const sections = navLinks.map((l) => l.href.slice(1));
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i]);
          if (el && el.getBoundingClientRect().top <= 120) {
            setActiveSection(sections[i]);
            break;
          }
        }
        scrollTimeout = null;
      });
    };
    window.addEventListener('scroll', handleScrollTracking, { passive: true });
    
    // Theme init
    if (localStorage.theme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    return () => window.removeEventListener('scroll', handleScrollTracking);
  }, []);

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
    e.preventDefault();
    setIsMobileMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      animate={{ y: navY }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 w-full z-50 flex items-center nav-dots"
      style={{
        height: '60px',
        backgroundColor: 'var(--color-paper)',
        borderBottom: `${isScrolled ? '3px' : '2px'} solid var(--color-ink)`
      }}
    >
      <div className="w-full max-w-7xl mx-auto pl-4 sm:pl-6 lg:pl-8 pr-20 md:pr-28 flex justify-between items-center h-full">
        <a 
          href="#home" 
          onClick={(e) => scrollTo(e, '#home')} 
          className="text-2xl transition-colors cursor-none hover:bg-ink hover:text-white"
          style={{ 
            fontFamily: 'var(--font-display)', 
            color: 'var(--color-ink)',
            lineHeight: 1,
            padding: '4px 8px',
            marginLeft: '-8px'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-ink)'; e.currentTarget.style.color = 'var(--color-paper)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-ink)'; }}
        >
          &lt;HS /&gt;
        </a>

        <div className="hidden md:flex items-center h-full">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={(e) => scrollTo(e, link.href)}
              className="h-full flex items-center px-5 cursor-none transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: activeSection === link.href.slice(1) ? 'var(--color-ink)' : 'var(--color-ink-2)',
                borderBottom: activeSection === link.href.slice(1) ? '2px solid var(--color-ink)' : '2px solid transparent'
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

      {/* Theme Toggle - Positioned at extreme right of navbar */}
      <div className="absolute right-4 md:right-8 lg:right-10 top-0 h-full flex items-center z-50">
        {/* Desktop Theme Toggle */}
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
          {/* Sliding Circle Background */}
          <motion.div 
            className="absolute z-0 w-[22px] h-[22px] rounded-full"
            style={{ backgroundColor: 'var(--color-ink)', top: '1px', left: '1px' }}
            initial={false}
            animate={{ x: isDark ? 28 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
          {/* Sun Icon Container */}
          <div className="absolute left-0 top-0 w-[24px] h-[24px] flex items-center justify-center z-10 pointer-events-none">
            <HiSun className="text-[13px] transition-colors duration-300" style={{ color: !isDark ? 'var(--color-paper)' : 'var(--color-ink)' }} />
          </div>
          {/* Moon Icon Container */}
          <div className="absolute right-0 top-0 w-[24px] h-[24px] flex items-center justify-center z-10 pointer-events-none">
            <HiMoon className="text-[13px] transition-colors duration-300" style={{ color: isDark ? 'var(--color-paper)' : 'var(--color-ink)' }} />
          </div>
        </button>

        {/* Mobile Theme Toggle */}
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
          {/* Sliding Circle Background */}
          <motion.div 
            className="absolute z-0 w-5 h-5 rounded-full"
            style={{ backgroundColor: 'var(--color-ink)', top: '1px', left: '1px' }}
            initial={false}
            animate={{ x: isDark ? 26 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
          {/* Sun Icon Container */}
          <div className="absolute left-0 top-0 w-[22px] h-[22px] flex items-center justify-center z-10 pointer-events-none">
            <HiSun className="text-[12px] transition-colors duration-300" style={{ color: !isDark ? 'var(--color-paper)' : 'var(--color-ink)' }} />
          </div>
          {/* Moon Icon Container */}
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
              {navLinks.map((link, i) => (
                <motion.a 
                  key={link.name} 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 0.9, x: 10 }}
                  href={link.href} 
                  onClick={(e) => scrollTo(e, link.href)}
                  className="text-4xl sm:text-5xl cursor-none transition-colors"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: activeSection === link.href.slice(1) ? 'var(--color-red)' : 'var(--color-paper)' 
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
    </motion.nav>
  );
};

export default Navbar;
