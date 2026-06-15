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
  const [isDark, setIsDark] = useState(false);
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
    const handleScrollTracking = () => {
      setIsScrolled(window.scrollY > 20);
      const sections = navLinks.map((l) => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScrollTracking);
    
    // Theme init
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    return () => window.removeEventListener('scroll', handleScrollTracking);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
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
          
          {/* Desktop Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center ml-6 cursor-none transition-colors border-2"
            style={{
              width: '56px',
              height: '28px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-paper-2)',
              borderColor: 'var(--color-ink)'
            }}
            aria-label="Toggle Dark Mode"
          >
            <span className="absolute left-[6px] text-[12px] z-20 transition-colors duration-300 pointer-events-none" style={{ color: isDark ? 'var(--color-paper)' : 'var(--color-ink)' }}><HiMoon /></span>
            <span className="absolute right-[6px] text-[12px] z-20 transition-colors duration-300 pointer-events-none" style={{ color: !isDark ? 'var(--color-paper)' : 'var(--color-ink)' }}><HiSun /></span>
            <motion.div 
              className="w-[20px] h-[20px] rounded-full absolute z-10"
              style={{ backgroundColor: 'var(--color-ink)', top: '2px' }}
              initial={false}
              animate={{ left: isDark ? '2px' : '30px' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        <div className="flex items-center md:hidden gap-4">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center cursor-none transition-colors border-2"
            style={{
              width: '52px',
              height: '26px',
              borderRadius: '13px',
              backgroundColor: 'var(--color-paper-2)',
              borderColor: 'var(--color-ink)'
            }}
            aria-label="Toggle Dark Mode"
          >
            <span className="absolute left-[5px] text-[12px] z-20 transition-colors duration-300 pointer-events-none" style={{ color: isDark ? 'var(--color-paper)' : 'var(--color-ink)' }}><HiMoon /></span>
            <span className="absolute right-[5px] text-[12px] z-20 transition-colors duration-300 pointer-events-none" style={{ color: !isDark ? 'var(--color-paper)' : 'var(--color-ink)' }}><HiSun /></span>
            <motion.div 
              className="w-[18px] h-[18px] rounded-full absolute z-10"
              style={{ backgroundColor: 'var(--color-ink)', top: '2px' }}
              initial={false}
              animate={{ left: isDark ? '2px' : '28px' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <button 
            className="text-3xl cursor-none" 
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
