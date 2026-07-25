/* eslint-disable */
import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  lazy,
  Suspense,
} from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Icons
import { HiMenuAlt3, HiX, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import {
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaTwitter,
  FaReact,
  FaNodeJs,
  FaPython,
} from 'react-icons/fa';
import { DiJavascript1 } from 'react-icons/di';
import { SiTailwindcss, SiExpress, SiNextdotjs, SiRedis } from 'react-icons/si';

gsap.registerPlugin(ScrollTrigger);

/* ===========================================================================
   1. GLOBAL STYLES & DESIGN SYSTEM (INJECTED INLINE)
   =========================================================================== */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

    :root {
      --color-paper: #f5f2ed;
      --color-paper-2: #ede9e2;
      --color-paper-3: #e0dcd4;
      --color-ink: #0d0d0d;
      --color-ink-2: #3a3a3a;
      --color-ink-3: #888888;
      --color-accent: #0d0d0d;
      --color-red: #c0392b;
      --color-white: #ffffff;

      --font-heading: "Poppins", ui-sans-serif, system-ui, sans-serif;
      --font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
      --font-code: "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --font-display: var(--font-heading);
      --font-mono: var(--font-code);
    }

    html.dark {
      --color-paper: #0d0d0d;
      --color-paper-2: #161616;
      --color-paper-3: #222222;
      --color-ink: #f5f2ed;
      --color-ink-2: #c4c4c4;
      --color-ink-3: #888888;
      --color-accent: #f5f2ed;
      --color-red: #ff4757;
      --color-white: #000000;
    }

    html, body {
      max-width: 100vw;
      overflow-x: hidden;
      margin: 0;
      padding: 0;
      background-color: var(--color-paper);
      color: var(--color-ink);
      font-family: var(--font-body);
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    ::-webkit-scrollbar { display: none; }

    ::selection {
      background: var(--color-ink);
      color: var(--color-paper);
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
      font-weight: 600;
      color: var(--color-ink);
      margin: 0;
    }

    .brutal-border { border: 2px solid var(--color-ink); }
    .brutal-card {
      background: var(--color-paper-2);
      border: 2px solid var(--color-ink);
    }

    .section-label {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--color-ink-3);
    }

    .btn-primary {
      background: var(--color-ink);
      color: var(--color-paper);
      border: 2px solid var(--color-ink);
      padding: 14px 24px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 800;
      transition: all 0.15s;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-primary:hover {
      background: var(--color-paper);
      color: var(--color-ink);
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-ink);
      border: 2px solid var(--color-ink);
      padding: 14px 24px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 800;
      transition: all 0.15s;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-secondary:hover {
      background: var(--color-ink);
      color: var(--color-paper);
    }

    @keyframes pulse-dot {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.4); }
    }

    @keyframes marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }

    .skills-marquee-track {
      animation: marquee 25s linear infinite;
    }
    .skills-marquee-track:hover {
      animation-play-state: paused;
    }

    body.hide-cursor * {
      cursor: none !important;
    }
  `}</style>
);

/* ===========================================================================
   2. GHOST CURSOR COMPONENT
   =========================================================================== */
const CURSOR_RING_SIZE = 40;

const GhostCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x: pos.x - CURSOR_RING_SIZE / 2,
        y: pos.y - CURSOR_RING_SIZE / 2,
        width: CURSOR_RING_SIZE,
        height: CURSOR_RING_SIZE,
        border: '2px solid var(--color-ink)',
        transform: 'rotate(45deg)',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'difference',
        backgroundColor: '#FFFFFF',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    />
  );
};

/* ===========================================================================
   3. INTRO ANIMATION COMPONENT
   =========================================================================== */
const IntroAnimation = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="intro"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: '#0a0a0a',
            color: '#f5f2ed',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={handleFinish}
            style={{
              position: 'absolute',
              top: 32,
              right: 32,
              background: 'transparent',
              border: 'none',
              color: '#666',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              cursor: 'pointer',
              letterSpacing: '0.15em',
            }}
          >
            SKIP →
          </button>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{
              fontSize: 'clamp(36px, 8vw, 90px)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '0.08em',
              textAlign: 'center',
            }}
          >
            HARSHID SONI
          </motion.h1>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              color: '#888',
              letterSpacing: '0.3em',
              marginTop: '16px',
            }}
          >
            FULL STACK DEVELOPER
          </p>

          <motion.button
            onClick={handleFinish}
            whileHover={{ scale: 1.05 }}
            style={{
              marginTop: '40px',
              padding: '12px 32px',
              background: 'transparent',
              border: '1px solid #444',
              color: '#f5f2ed',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              cursor: 'pointer',
              letterSpacing: '0.2em',
            }}
          >
            [ ENTER ]
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ===========================================================================
   4. NAVBAR COMPONENT
   =========================================================================== */
const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Experience', href: '#experience' },
];

const Navbar = () => {
  const [isDark, setIsDark] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '75px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        backgroundColor:
          'color-mix(in srgb, var(--color-paper) 85%, transparent)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--color-ink-3)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <a
          href="#home"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.4rem',
            textDecoration: 'none',
            color: 'var(--color-ink)',
          }}
        >
          &lt;HS /&gt;
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex" style={{ gap: '24px' }}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-ink-2)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--color-red)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--color-ink-2)')
              }
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid var(--color-ink)',
              background: 'var(--color-paper-2)',
              color: 'var(--color-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isDark ? <HiOutlineMoon size={20} /> : <HiOutlineSun size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

/* ===========================================================================
   5. HERO COMPONENT
   =========================================================================== */
const Hero = () => {
  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          width: '100%',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                display: 'inline-block',
                animation: 'pulse-dot 2s infinite ease-in-out',
              }}
            />
            <span className="section-label">AVAILABLE FOR WORK</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(44px, 12vw, 110px)',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            HARSHID <br />
            <span
              style={{
                textDecoration: 'underline',
                textDecorationColor: 'var(--color-ink)',
                textUnderlineOffset: '12px',
              }}
            >
              SONI
            </span>
          </h1>

          <div
            style={{
              margin: '32px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              color: 'var(--color-ink-2)',
            }}
          >
            [ FULL STACK DEVELOPER ]_
          </div>

          <p
            style={{
              fontSize: '18px',
              maxWidth: '480px',
              color: 'var(--color-ink-2)',
              marginBottom: '40px',
            }}
          >
            Building scalable web applications & solving real-world problems. No
            fluff, just functional code and brutal aesthetics.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#projects" className="btn-primary">
              VIEW PROJECTS
            </a>
            <a href="#contact" className="btn-secondary">
              CONTACT ME
            </a>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '48px' }}>
            {[
              { icon: <FaGithub />, link: 'https://github.com/Harshid001' },
              {
                icon: <FaLinkedin />,
                link: 'https://www.linkedin.com/in/harshid-soni-441500385/',
              },
              {
                icon: <FaYoutube />,
                link: 'https://www.youtube.com/@Harshid001',
              },
              { icon: <FaTwitter />, link: 'https://x.com/HarshidSoni2007' },
            ].map((s, i) => (
              <a
                key={i}
                href={s.link}
                target="_blank"
                rel="noreferrer"
                className="brutal-border"
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                  backgroundColor: 'var(--color-paper)',
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ===========================================================================
   6. ABOUT COMPONENT
   =========================================================================== */
const About = () => {
  return (
    <section
      id="about"
      style={{ padding: '96px 0', borderTop: '2px solid var(--color-ink)' }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <span
          className="section-label"
          style={{ display: 'block', marginBottom: '16px' }}
        >
          01 / ABOUT ME
        </span>
        <h2
          style={{
            fontSize: 'clamp(40px, 8vw, 90px)',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}
        >
          MORE THAN JUST CODE
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          <div className="brutal-card" style={{ padding: '32px' }}>
            <h3
              style={{
                fontSize: '24px',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              BEYOND CODE
            </h3>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.8,
                color: 'var(--color-ink-2)',
              }}
            >
              I am a driven Full Stack Developer with a strong foundation in
              modern web technologies, currently pursuing my B.E. in Computer
              Science at Swaminarayan University.
            </p>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.8,
                color: 'var(--color-ink-2)',
                marginTop: '16px',
              }}
            >
              I specialize in building high-performance, scalable applications
              with intuitive user experiences. My focus is on writing clean,
              maintainable code and solving complex real-world problems
              efficiently.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===========================================================================
   7. SKILLS MARQUEE COMPONENT
   =========================================================================== */
const skillsList = [
  'REACT',
  'NEXT.JS',
  'NODE.JS',
  'EXPRESS',
  'PYTHON',
  'TAILWIND CSS',
  'MONGODB',
  'POSTGRESQL',
  'REDIS',
  'TYPESCRIPT',
];

const SkillsMarquee = () => {
  return (
    <div
      style={{
        borderTop: '2px solid var(--color-ink)',
        borderBottom: '2px solid var(--color-ink)',
        overflow: 'hidden',
        padding: '16px 0',
        backgroundColor: 'var(--color-paper-2)',
      }}
    >
      <div
        style={{ display: 'flex', whiteSpace: 'nowrap' }}
        className="skills-marquee-track"
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{ display: 'flex', gap: '32px', paddingRight: '32px' }}
          >
            {skillsList.map((skill, sIdx) => (
              <span
                key={sIdx}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '24px',
                  letterSpacing: '0.05em',
                }}
              >
                {skill} ·
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===========================================================================
   8. SKILLS COMPONENT
   =========================================================================== */
const skillsData = [
  { name: 'React', icon: FaReact, desc: 'Component-driven UI architecture' },
  {
    name: 'Next.js',
    icon: SiNextdotjs,
    desc: 'Server-side rendering & static gen',
  },
  { name: 'Node.js', icon: FaNodeJs, desc: 'Backend runtime & event loops' },
  { name: 'Express', icon: SiExpress, desc: 'RESTful API architecture' },
  {
    name: 'JavaScript',
    icon: DiJavascript1,
    desc: 'ES6+, async patterns, DOM',
  },
  {
    name: 'Tailwind CSS',
    icon: SiTailwindcss,
    desc: 'Utility-first modern styling',
  },
  { name: 'Python', icon: FaPython, desc: 'Data processing & AI integration' },
  { name: 'Redis', icon: SiRedis, desc: 'In-memory caching & messaging' },
];

const Skills = () => {
  return (
    <section
      id="skills"
      style={{ padding: '96px 0', borderTop: '2px solid var(--color-ink)' }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <span
          className="section-label"
          style={{ display: 'block', marginBottom: '16px' }}
        >
          02 / SKILLS
        </span>
        <h2
          style={{
            fontSize: 'clamp(40px, 8vw, 90px)',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}
        >
          TOOLS OF THE TRADE
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '24px',
          }}
        >
          {skillsData.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="brutal-card" style={{ padding: '24px' }}>
                <Icon size={32} style={{ color: 'var(--color-ink)' }} />
                <h3
                  style={{
                    fontSize: '20px',
                    marginTop: '16px',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.name}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--color-ink-2)',
                    marginTop: '8px',
                  }}
                >
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ===========================================================================
   9. PROJECTS COMPONENT
   =========================================================================== */
const projectsData = [
  {
    title: 'StudyBuddy',
    desc: 'AI-powered study assistant with smart chatbot, resource management, and progress tracking using React, Node.js, and MongoDB.',
    tech: ['React', 'Node.js', 'MongoDB', 'Express'],
    github: 'https://github.com/Harshid001/studybuddy',
  },
  {
    title: 'MF-advisor',
    desc: 'Voice-first mutual fund advisory platform enabling real-time conversational interfaces using OpenAI STT and WebSocket streaming.',
    tech: ['React', 'Vite', 'Express', 'TypeScript'],
    github: 'https://github.com/Harshid001/team_hacksheild',
    live: 'https://mf-advisor-seven.vercel.app/',
  },
  {
    title: 'PINCODE Directory',
    desc: 'Full-stack Indian pincode directory with bulk processing, geolocation services, and RESTful APIs using Python, Flask, and PostgreSQL.',
    tech: ['React', 'Python', 'Flask', 'PostgreSQL'],
    github: 'https://github.com/Harshid001/PINCODE',
    live: 'https://pincode-delta.vercel.app',
  },
];

const Projects = () => {
  return (
    <section
      id="projects"
      style={{
        padding: '96px 0',
        borderTop: '2px solid var(--color-ink)',
        backgroundColor: 'var(--color-paper-2)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <span
          className="section-label"
          style={{ display: 'block', marginBottom: '16px' }}
        >
          03 / PORTFOLIO
        </span>
        <h2
          style={{
            fontSize: 'clamp(40px, 8vw, 90px)',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}
        >
          FEATURED PROJECTS
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {projectsData.map((p, i) => (
            <div
              key={i}
              className="brutal-card"
              style={{
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '24px', textTransform: 'uppercase' }}>
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--color-ink-2)',
                    margin: '16px 0',
                    lineHeight: 1.6,
                  }}
                >
                  {p.desc}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '24px',
                  }}
                >
                  {p.tech.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        border: '1px solid var(--color-ink)',
                        padding: '2px 8px',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                  >
                    GITHUB
                  </a>
                )}
                {p.live && (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                  >
                    LIVE DEMO
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ===========================================================================
   10. EXPERIENCE COMPONENT
   =========================================================================== */
const Experience = () => {
  return (
    <section
      id="experience"
      style={{ padding: '96px 0', borderTop: '2px solid var(--color-ink)' }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <span
          className="section-label"
          style={{ display: 'block', marginBottom: '16px' }}
        >
          04 / MY JOURNEY
        </span>
        <h2
          style={{
            fontSize: 'clamp(40px, 8vw, 90px)',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}
        >
          EXPERIENCE & GROWTH
        </h2>

        <div className="brutal-card" style={{ padding: '32px' }}>
          <p
            style={{
              fontSize: '20px',
              lineHeight: 1.7,
              color: 'var(--color-ink-2)',
              fontFamily: 'var(--font-body)',
            }}
          >
            In 2025, I started my journey with HTML, CSS, and JavaScript,
            exploring web architecture and responsive design. I quickly moved on
            to building real-world projects like StudyBuddy and e-commerce
            platforms, mastering React.js and incorporating Node.js and MongoDB.
            Currently, I am actively looking for internships, freelance
            projects, and full-time roles to apply my skills and continue
            growing.
          </p>
        </div>
      </div>
    </section>
  );
};

/* ===========================================================================
   11. CONTACT COMPONENT
   =========================================================================== */
const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Message sent successfully!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section
      id="contact"
      style={{
        padding: '96px 0',
        borderTop: '2px solid var(--color-ink)',
        backgroundColor: 'var(--color-paper-2)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
          }}
        >
          <div>
            <span
              className="section-label"
              style={{ display: 'block', marginBottom: '16px' }}
            >
              05 / GET IN TOUCH
            </span>
            <h2
              style={{
                fontSize: 'clamp(40px, 8vw, 90px)',
                lineHeight: 0.9,
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              LET'S CONNECT
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-ink-2)' }}>
              Open for opportunities, freelance projects, or just a chat. Don't
              hesitate to reach out.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="brutal-card"
            style={{ padding: '32px', backgroundColor: 'var(--color-white)' }}
          >
            {status && (
              <div
                style={{
                  marginBottom: '16px',
                  color: '#22C55E',
                  fontWeight: 'bold',
                }}
              >
                {status}
              </div>
            )}

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  NAME
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid var(--color-ink)',
                    background: 'var(--color-paper)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid var(--color-ink)',
                    background: 'var(--color-paper)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  MESSAGE
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid var(--color-ink)',
                    background: 'var(--color-paper)',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: '16px' }}
              >
                SEND MESSAGE
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

/* ===========================================================================
   12. FOOTER COMPONENT
   =========================================================================== */
const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        padding: '48px 0',
        borderTop: '3px solid var(--color-ink)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>
          &lt;HS /&gt;
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-ink-3)',
          }}
        >
          DESIGNED & BUILT BY HARSHID SONI © 2025
        </span>
      </div>
    </footer>
  );
};

/* ===========================================================================
   13. MAIN APPLICATION ENTRY
   =========================================================================== */
export default function FrontendSingleFile() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <BrowserRouter>
      <GlobalStyles />
      {!showIntro && <GhostCursor />}
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      <div
        style={{
          backgroundColor: 'var(--color-paper)',
          color: 'var(--color-ink)',
          minHeight: '100vh',
        }}
      >
        {!showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Navbar />
            <main>
              <Hero />
              <About />
              <SkillsMarquee />
              <Skills />
              <Projects />
              <Experience />
              <Contact />
            </main>
            <Footer />
          </motion.div>
        )}
      </div>
    </BrowserRouter>
  );
}
