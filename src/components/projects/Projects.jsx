import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import ProjectShowcase from './ProjectShowcase';
import ProjectNavigation from './ProjectNavigation';
import './projects.css';

// --- Project data ---------------------------------------------
import studybuddyImg from '../../assets/studdy-buddy.png';
import studybuddyImgWebp from '../../assets/studdy-buddy.webp';
import pincodeImg from '../../assets/Pincode.png';
import pincodeImgWebp from '../../assets/Pincode.webp';
import smartfactoryImg from '../../assets/smartfactory.png';
import smartfactoryImgWebp from '../../assets/smartfactory.webp';
import websiteMakerImg from '../../assets/website-maker.png';
import websiteMakerImgWebp from '../../assets/website-maker.webp';

const projects = [
  {
    title: 'StudyBuddy',
    description:
      'Centralizes learning resources into a single searchable dashboard. Features smart AI study assistant capabilities, course material indexing, and progress tracking using React, Node.js, Express, and MongoDB.',
    tech: ['React', 'Node.js', 'MongoDB', 'Express'],
    github: 'https://github.com/Harshid001/studybuddy',
    image: studybuddyImg,
    imageWebp: studybuddyImgWebp,
    category: 'APPLICATIONS',
  },
  {
    title: 'MF-advisor',
    description:
      'Educational voice-first mutual fund advisory prototype with simulated portfolios, computed performance metrics, and conversational interfaces using OpenAI STT and streaming WebSockets.',
    tech: ['React', 'Vite', 'Express', 'TypeScript'],
    github: 'https://github.com/Harshid001/team_hacksheild',
    live: 'https://mf-advisor-seven.vercel.app/',
    image:
      'https://res.cloudinary.com/dh0xawlig/image/upload/q_auto/f_auto/v1783864799/Screenshot_2026-07-12_192909_llxok0.png',
    category: 'WEBSITES',
  },
  {
    title: 'Traveloop',
    description:
      'Modern travel discovery interface prototype with personalized destination onboarding and interactive itinerary workflows built with React and responsive layouts across viewports.',
    tech: ['React', 'Vite', 'JavaScript'],
    github: 'https://github.com/Harshid001/traveloop',
    image:
      'https://res.cloudinary.com/dxvggspmi/image/upload/q_auto/f_auto/v1781610545/Screenshot_2026-06-16_171746_oub72r.png',
    category: 'WEBSITES',
  },
  {
    title: 'Crop Sphere (AgriMind AI)',
    description:
      'Agricultural decision-support dashboard for crop planning, farm parameter tracking, and weather integration using dynamic React state management and accessible forms.',
    tech: ['React', 'JavaScript', 'Tailwind CSS'],
    github: 'https://github.com/Harshid001/crop_sphere',
    live: 'https://crop-sphere.vercel.app/',
    image:
      'https://res.cloudinary.com/dh0xawlig/image/upload/q_auto/f_auto/v1781498309/Screenshot_2026-06-15_100751_vqz10c.png',
    category: 'WEBSITES',
  },
  {
    title: 'MediPrice',
    description:
      'Pharmaceutical price comparison interface allowing users to explore provider options, compare pricing tiers, and find affordable medicine alternatives across multiple healthcare data points.',
    tech: ['React', 'JavaScript'],
    github: 'https://github.com/codinggita/mediPrice',
    live: 'https://mediprice-five.vercel.app/about',
    image:
      'https://res.cloudinary.com/dh0xawlig/image/upload/q_auto/f_auto/v1778065370/Screenshot_2026-05-06_161814_g2g0bn.png',
    category: 'WEBSITES',
  },
  {
    title: 'Payfair',
    description:
      'An invoice-financing interface prototype connecting businesses with funding sources. Features clean dashboard workflows for invoice listing, verification status, and request handling with responsive React components.',
    tech: ['React', 'JavaScript'],
    github: 'https://github.com/Harshid001/PAYFAIR',
    live: 'https://payfair-nine.vercel.app/',
    image:
      'https://res.cloudinary.com/dh0xawlig/image/upload/q_auto/f_auto/v1778339333/Screenshot_2026-05-09_203414_mi2sxq.png',
    category: 'WEBSITES',
  },
  {
    title: 'Website Maker (ShopCraft Studio)',
    description:
      'Interactive website builder suite with layout customization, component selection, live preview canvas, and state management built with React.',
    tech: ['React', 'Vite', 'State Management'],
    github: 'https://github.com/Harshid001/Website-maker',
    live: 'https://website-maker-gevx.vercel.app/',
    image: websiteMakerImg,
    imageWebp: websiteMakerImgWebp,
    category: 'WEBSITES',
  },
  {
    title: 'PINCODE',
    description:
      'Indian postal directory and search interface backed by a REST API. Built with React, Python, Flask, and PostgreSQL with Docker containerization for regional lookup and exploration.',
    tech: ['React', 'Python', 'Flask', 'PostgreSQL', 'Docker'],
    github: 'https://github.com/Harshid001/PINCODE',
    live: 'https://pincode-delta.vercel.app',
    image: pincodeImg,
    imageWebp: pincodeImgWebp,
    category: 'WEBSITES',
  },
  {
    title: 'Smart Factory AI',
    description:
      'Industrial anomaly detection dashboard prototype using Python and machine learning models to identify equipment inefficiency patterns and simulated maintenance alerts.',
    tech: ['Python', 'AI/ML', 'REST API', 'React'],
    github: 'https://github.com/Harshid001/smartfactoryAIsystem',
    image: smartfactoryImg,
    imageWebp: smartfactoryImgWebp,
    category: 'WEBSITES',
  },
];

const Projects = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);

  // Deliberate manual navigation restores reading control and stops disorientation
  useEffect(() => {
    if (isMaximized) {
      document.body.classList.add('preview-maximized');
      window.dispatchEvent(
        new CustomEvent('preview:maximize', { detail: { isMaximized: true } }),
      );
    } else {
      document.body.classList.remove('preview-maximized');
      window.dispatchEvent(
        new CustomEvent('preview:maximize', { detail: { isMaximized: false } }),
      );
    }
    return () => {
      document.body.classList.remove('preview-maximized');
      window.dispatchEvent(
        new CustomEvent('preview:maximize', { detail: { isMaximized: false } }),
      );
    };
  }, [isMaximized]);

  const activeProject = projects[activeIndex];
  const activeCategory = activeProject?.category || 'APPLICATIONS';
  const categoryProjects = projects.filter(
    (p) => p.category === activeCategory,
  );
  const localIndex = categoryProjects.indexOf(activeProject);

  return (
    <section
      id="projects"
      className={`relative border-t-2 transition-all duration-500 ${
        isMaximized ? 'py-2 sm:py-4' : 'py-16 lg:py-24'
      }`}
      style={{
        backgroundColor: 'var(--color-paper-2)',
        borderColor: 'var(--color-ink)',
      }}
    >
      <div
        className={`mx-auto transition-all duration-500 ease-out ${
          isMaximized
            ? 'w-full max-w-full px-1 sm:px-2 md:px-3'
            : 'max-w-7xl px-4 sm:px-6 lg:px-8'
        }`}
      >
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between transition-all duration-300 gap-6 ${
            isMaximized ? 'mb-4' : 'mb-12'
          }`}
        >
          <div className="max-w-2xl">
            <span className="section-label mb-4 block">01 / SELECTED PROJECTS</span>
            <h2
              style={{ fontSize: 'clamp(32px, 10vw, 80px)', lineHeight: 0.9 }}
            >
              FEATURED
              <br />
              PROJECTS
            </h2>
          </div>
        </div>

        {/* Screen reader live region for active project announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Viewing project {localIndex + 1} of {categoryProjects.length} in{' '}
          {activeCategory.toLowerCase()}: {activeProject?.title}
        </div>

        <LayoutGroup id="featured-projects-layout">
          <div
            className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start"
            id="project-showcase"
            role="region"
            aria-label="Project showcase"
          >
            {/* Mobile Navigation */}
            <div className="lg:hidden w-full">
              <ProjectNavigation
                projects={projects}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
            </div>

            {/* Left Showcase - 70% normally, or full width in-place when maximized */}
            <motion.div
              layout
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full ${
                isMaximized ? 'lg:w-full' : 'lg:w-[70%]'
              }`}
            >
              <ProjectShowcase
                project={activeProject}
                index={localIndex}
                isMaximized={isMaximized}
                setIsMaximized={setIsMaximized}
                onPrev={() =>
                  setActiveIndex(
                    (prev) => (prev - 1 + projects.length) % projects.length,
                  )
                }
                onNext={() =>
                  setActiveIndex((prev) => (prev + 1) % projects.length)
                }
              />
            </motion.div>

            {/* Desktop Navigation Rail - smoothly moves ASIDE to the right with fluid slide animation */}
            <AnimatePresence mode="popLayout">
              {!isMaximized && (
                <motion.div
                  key="desktop-project-nav"
                  layout
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: 90,
                    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                  }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="hidden lg:block lg:w-[30%] shrink-0"
                >
                  <ProjectNavigation
                    projects={projects}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* When maximized, keep navigation rail accessible right below the showcase in the same plane */}
          <AnimatePresence>
            {isMaximized && (
              <motion.div
                key="maximized-project-nav"
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{
                  delay: 0.15,
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="hidden lg:block w-full mt-8"
              >
                <ProjectNavigation
                  projects={projects}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
};

export default Projects;

