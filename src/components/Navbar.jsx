import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { HiMenuAlt3, HiX, HiOutlineMoon, HiOutlineSun } from "react-icons/hi";
import { useGridTransition } from "./transition/GridTransitionContext";
import CodingActivity from "./CodingActivity";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Projects", href: "#projects" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
];

const mobileNavLinks = [
  { name: "Home", href: "#home" },
  { name: "Projects", href: "#projects" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
  { name: "Achievements", href: "#achievements" },
  { name: "Contact", href: "#contact" },
];

const HOME_LABEL = "<HS />";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const {
    triggerTransition: triggerGridTransition,
    isTransitioning: isGridTransitioning,
  } = useGridTransition();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [clickedLink, setClickedLink] = useState(null);
  const [isAtFooter, setIsAtFooter] = useState(false);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);

  useEffect(() => {
    const handlePreviewMaximize = (e) => {
      const isMax = !!(e.detail?.isMaximized ?? e.detail);
      setIsPreviewMaximized(isMax);
      if (isMax) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("preview:maximize", handlePreviewMaximize);
    return () => {
      window.removeEventListener("preview:maximize", handlePreviewMaximize);
    };
  }, []);

  const openerButtonRef = useRef(null);

  // Lock body scroll and trap accessibility focus when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const mainEl = document.querySelector("main");
      if (mainEl) mainEl.setAttribute("inert", "");

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setIsMobileMenuOpen(false);
          openerButtonRef.current?.focus();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        if (mainEl) mainEl.removeAttribute("inert");
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
      const mainEl = document.querySelector("main");
      if (mainEl) mainEl.removeAttribute("inert");
    }
  }, [isMobileMenuOpen]);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.theme !== "light";
    }
    return true;
  });
  const { scrollY } = useScroll();

  // ---- Logo: scroll-triggered morph animation ----
  const [isScrolledLogo, setIsScrolledLogo] = useState(false);
  // ---- Nav slider state ----
  const [hoveredNav, setHoveredNav] = useState(null);

  // ---- B3: cached section offsets ----
  // The old scroll handler called getBoundingClientRect() on up to six
  // elements per scroll frame, forcing a synchronous layout every time.
  // Document-space offsets only change on resize, so they are measured once
  // and refreshed on a debounced resize instead.
  const offsetsRef = useRef({ sections: [], footerTop: Infinity });

  useEffect(() => {
    const measure = () => {
      const y = window.scrollY;
      offsetsRef.current = {
        sections: navLinks.map((l) => {
          const id = l.href.slice(1);
          const el = document.getElementById(id);
          return {
            id,
            top: el ? el.getBoundingClientRect().top + y : Infinity,
          };
        }),
        footerTop: (() => {
          const f = document.getElementById("footer");
          return f ? f.getBoundingClientRect().top + y : Infinity;
        })(),
      };
    };

    measure();

    let timer = null;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, 150);
    };

    window.addEventListener("resize", schedule, { passive: true });
    // Sections mount lazily, so document height keeps changing after first
    // paint — re-measure when the body box settles.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, []);

  // ---- B1: single scroll source ----
  // This component previously added a second window 'scroll' listener with
  // its own rAF throttle, on top of framer-motion's shared scrollY (which
  // Lenis already drives). Everything now rides that one source.
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (typeof window === "undefined") return;

    // Anthropic-style logo shrink at ~25% of viewport height.
    // Guarded so React only re-renders when the boolean actually flips.
    const nextLogo = latest > window.innerHeight * 0.25;
    setIsScrolledLogo((prev) => (prev === nextLogo ? prev : nextLogo));

    const nextScrolled = latest > 20;
    setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));

    const { sections, footerTop } = offsetsRef.current;

    if (isHome && !isGridTransitioning) {
      // `rect.top <= 120` is algebraically `documentTop - scrollY <= 120`.
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].top - latest <= 120) {
          const id = sections[i].id;
          setActiveSection((prev) => (prev === id ? prev : id));
          break;
        }
      }
    }

    const nextAtFooter = footerTop - latest < window.innerHeight - 50;
    setIsAtFooter((prev) => (prev === nextAtFooter ? prev : nextAtFooter));
  });

  // Sync theme class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  const scrollTo = (e, href) => {
    if (!isHome || isGridTransitioning) return;
    e.preventDefault();
    setIsMobileMenuOpen(false);

    // Calculate direction
    const currentIdx = navLinks.findIndex(
      (l) => l.href.slice(1) === activeSection,
    );
    const targetIdx = navLinks.findIndex((l) => l.href === href);
    const direction = targetIdx > currentIdx ? "down" : "up";

    setClickedLink(href);

    setTimeout(() => {
      triggerGridTransition(href, direction);
      setClickedLink(null);
      // Optimistically update active section so colors update instantly
      setActiveSection(href.slice(1));
    }, 100);
  };

  return (
    <>
      <motion.nav
      animate={{
        y: isAtFooter || isPreviewMaximized ? "-100%" : 0,
        opacity: isPreviewMaximized ? 0 : 1,
      }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full z-50 flex items-center backdrop-blur-md"
      style={{
        height: "75px",
        backgroundColor:
          "color-mix(in srgb, var(--color-paper) 85%, transparent)",
        borderBottom: `${isScrolled ? "1px" : "0px"} solid var(--color-ink-3)`,
        pointerEvents: isPreviewMaximized ? "none" : "auto",
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-3 sm:gap-6 xl:gap-8 h-full relative">
        {/* LEFT SECTION: LOGO */}
        <div className="shrink-0 flex justify-start items-center mr-auto lg:mr-0">
          <div
            className="logo-base select-none text-[1.05rem] sm:text-[1.3rem]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              color: "var(--color-ink)",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <motion.span
              initial={false}
              animate={{ fontSize: isScrolledLogo ? "1em" : "1.25em" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", alignItems: "center" }}
            >
              &lt;
            </motion.span>
            <span>H</span>
            <motion.span
              initial={false}
              animate={{
                width: isScrolledLogo ? 0 : "auto",
                opacity: isScrolledLogo ? 0 : 1,
              }}
              style={{
                overflow: "hidden",
                display: "inline-flex",
                whiteSpace: "pre",
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {"arshid "}
            </motion.span>
            <span>S</span>
            <motion.span
              initial={false}
              animate={{
                width: isScrolledLogo ? 0 : "auto",
                opacity: isScrolledLogo ? 0 : 1,
              }}
              style={{
                overflow: "hidden",
                display: "inline-flex",
                whiteSpace: "pre",
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {"oni"}
            </motion.span>
            <motion.span
              initial={false}
              animate={{ fontSize: isScrolledLogo ? "1em" : "1.25em" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", alignItems: "center" }}
            >
              /&gt;
            </motion.span>
          </div>
        </div>

        {/* CENTER SECTION: NAVIGATION LINKS */}
        <div
          className="hidden lg:flex flex-1 justify-center items-center h-full gap-1 xl:gap-2"
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
                  padding: "8px 10px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color:
                    isActive || isHovered
                      ? "var(--color-ink)"
                      : "var(--color-ink-2)",
                  transform:
                    clickedLink === link.href ? "scale(0.92)" : "scale(1)",
                }}
              >
                {showSlider && (
                  <motion.div
                    layoutId="navSlider"
                    className="absolute inset-0 z-[-1]"
                    style={{
                      backgroundColor: "var(--color-ink)",
                      opacity: 0.08,
                      borderRadius: "0px" /* Square box as requested */,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span
                  className="relative z-10 transition-colors duration-200"
                  style={{
                    color: isHovered
                      ? "var(--color-red)"
                      : isActive
                        ? "var(--color-ink)"
                        : "var(--color-ink-2)",
                  }}
                >
                  {link.name}
                </span>
              </a>
            );
          })}
        </div>

        {/* RIGHT SECTION: ACTIONS */}
        <div className="shrink-0 flex justify-end items-center gap-3 xl:gap-4">
          <div className="hidden xl:flex items-center gap-3">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary h-[40px] flex items-center justify-center transition-transform hover:scale-[1.02]"
              style={{
                padding: "0 20px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "13px",
                letterSpacing: "0.1em",
              }}
            >
              RESUME
            </a>
            <a
              href="#contact"
              onClick={(e) => scrollTo(e, "#contact")}
              className="btn-primary h-[40px] flex items-center justify-center transition-transform hover:scale-[1.02]"
              style={{
                padding: "0 20px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "13px",
                letterSpacing: "0.1em",
              }}
            >
              CONTACT
            </a>
          </div>

          <div className="flex items-center gap-2">
          <CodingActivity />
          {/* THEME TOGGLE (Visible everywhere) */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="w-[40px] h-[40px] rounded-none flex items-center justify-center border-2 transition-colors shrink-0 cursor-pointer"
            style={{
              borderColor: "var(--color-ink)",
              backgroundColor: "var(--color-ink)",
              color: "var(--color-paper)",
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <motion.div
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              {isDark ? (
                <HiOutlineMoon size={20} strokeWidth={1.5} />
              ) : (
                <HiOutlineSun size={20} strokeWidth={1.5} />
              )}
            </motion.div>
          </motion.button>
          </div>

          {/* MOBILE & TABLET HAMBURGER MENU (< 1024px) */}
          <button
            ref={openerButtonRef}
            className="min-w-[44px] min-h-[44px] flex lg:hidden items-center justify-center text-3xl transition-transform active:scale-95 shrink-0 cursor-pointer"
            style={{ color: "var(--color-ink)" }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open navigation menu"}
          >
            {isMobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
          </button>
        </div>
      </div>

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

    {/* PORTALED FULLSCREEN MOBILE & TABLET DRAWER */}
    {typeof document !== "undefined" &&
      createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              key="mobile-drawer"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[9999] flex flex-col justify-between p-5 sm:p-7 md:p-8 overflow-y-auto lg:hidden"
              style={{
                backgroundColor: "var(--color-paper)",
                color: "var(--color-ink)",
              }}
            >
              {/* Top Drawer Header */}
              <div
                className="flex items-center justify-between pb-4 border-b-2 shrink-0"
                style={{ borderColor: "var(--color-ink-3)" }}
              >
                <div
                  className="flex items-center gap-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--color-ink)",
                  }}
                >
                  &lt;HARSHID /&gt;
                </div>

                <div className="flex items-center gap-3">
                  {/* Theme Toggle Button in Drawer */}
                  <button
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-none flex items-center justify-center border-2 transition-transform active:scale-95 cursor-pointer"
                    style={{
                      borderColor: "var(--color-ink)",
                      backgroundColor: "var(--color-ink)",
                      color: "var(--color-paper)",
                    }}
                    aria-label="Toggle Dark Mode"
                  >
                    {isDark ? (
                      <HiOutlineMoon size={20} strokeWidth={1.5} />
                    ) : (
                      <HiOutlineSun size={20} strokeWidth={1.5} />
                    )}
                  </button>

                  {/* Close Drawer Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center text-2xl border-2 transition-transform active:scale-95 cursor-pointer"
                    style={{
                      borderColor: "var(--color-ink)",
                      backgroundColor: "var(--color-ink)",
                      color: "var(--color-paper)",
                    }}
                    aria-label="Close menu"
                  >
                    <HiX />
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-2.5 sm:gap-3.5 py-3 sm:py-5 my-auto overflow-y-auto min-h-0">
                {mobileNavLinks.map((link, idx) => {
                  const isActive = activeSection === link.href.slice(1);
                  return (
                    <motion.a
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * idx, duration: 0.2 }}
                      href={link.href}
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        scrollTo(e, link.href);
                      }}
                      className="flex items-baseline gap-3 transition-transform active:translate-x-2 cursor-pointer w-fit"
                    >
                      <span
                        className="text-xs font-mono opacity-50"
                        style={{
                          color: isActive
                            ? "var(--color-red)"
                            : "var(--color-ink-2)",
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")} //
                      </span>
                      <span
                        className="text-2xl sm:text-3xl font-black uppercase tracking-tight transition-colors"
                        style={{
                          fontFamily: "var(--font-heading)",
                          color: isActive
                            ? "var(--color-red)"
                            : "var(--color-ink)",
                        }}
                      >
                        {link.name}
                      </span>
                      {isActive && (
                        <span
                          className="w-2 h-2 rounded-full mb-1"
                          style={{ backgroundColor: "var(--color-red)" }}
                        />
                      )}
                    </motion.a>
                  );
                })}
              </div>

              {/* Bottom Actions & Socials */}
              <div
                className="flex flex-col gap-3 pt-4 border-t-2 shrink-0"
                style={{ borderColor: "var(--color-ink-3)" }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href="/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary h-[42px] sm:h-[46px] flex items-center justify-center font-bold text-xs sm:text-sm tracking-widest uppercase cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    DOWNLOAD RESUME
                  </a>
                  <a
                    href="#contact"
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      scrollTo(e, "#contact");
                    }}
                    className="btn-primary h-[42px] sm:h-[46px] flex items-center justify-center font-bold text-xs sm:text-sm tracking-widest uppercase cursor-pointer"
                  >
                    CONTACT ME
                  </a>
                </div>

                <div
                  className="flex items-center justify-between text-xs font-mono pt-2"
                  style={{ color: "var(--color-ink-2)" }}
                >
                  <a
                    href="https://github.com/Harshid001"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    GITHUB
                  </a>
                  <span>•</span>
                  <a
                    href="https://www.linkedin.com/in/harshid-soni-441500385/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    LINKEDIN
                  </a>
                  <span>•</span>
                  <a
                    href="https://www.youtube.com/@Harshid001"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    YOUTUBE
                  </a>
                  <span>•</span>
                  <a
                    href="https://x.com/HarshidSoni2007"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    TWITTER
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Navbar;
