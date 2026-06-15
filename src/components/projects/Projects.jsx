import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionPresence from '../SectionPresence';
import ProjectShowcase from './ProjectShowcase';
import ProjectNavigation from './ProjectNavigation';
import './projects.css';

// ── Project data ─────────────────────────────────────────
import studybuddyImg from '../../assets/studdy-buddy.png';
import pincodeImg from '../../assets/Pincode.png';
import smartfactoryImg from '../../assets/smartfactory.png';
import logitechImg from '../../assets/Logitech.png';
import rockstarImg from '../../assets/Rockstar.png';
import numeraiImg from '../../assets/NumerAI.png';
import radheJewellersImg from '../../assets/radhe-jewellers.png';
import websiteMakerImg from '../../assets/website-maker.png';
import fundHuntersImg from '../../assets/fund-hunters.png';

const projects = [
  { 
    title: "StudyBuddy", 
    description: "Students struggle to organize learning resources across scattered platforms. Built an AI-powered study assistant with smart chatbot, resource management, and progress tracking using React, Node.js, and MongoDB. Reduced study material lookup time by centralizing resources into a single searchable dashboard.", 
    tech: ["React", "Node.js", "MongoDB", "Express"], 
    github: "https://github.com/Harshid001/studybuddy", 
    image: studybuddyImg,
    category: "APPLICATIONS"
  },
  { 
    title: "PINCODE", 
    description: "Finding accurate Indian postal data requires navigating outdated government portals. Built a full-stack pincode directory with search, state/district/taluk filtering, and dashboard analytics powered by MongoDB aggregation pipelines. Serves 150,000+ pincode records with sub-200ms search response times.", 
    tech: ["React", "Node.js", "MongoDB", "Express"], 
    github: "https://github.com/Harshid001/PINCODE", 
    live: "https://pincode-delta.vercel.app", 
    image: pincodeImg,
    category: "APPLICATIONS"
  },
  { 
    title: "Smart Factory AI", 
    description: "Manufacturing facilities lack real-time visibility into production line anomalies. Built an AI-based monitoring system using Python and ML models to detect inefficiencies and predict maintenance needs via REST APIs. Processes real-time sensor data streams to flag anomalies before they cause downtime.", 
    tech: ["Python", "AI/ML", "REST API", "Web"], 
    github: "https://github.com/Harshid001/smartfactoryAIsystem", 
    image: smartfactoryImg,
    category: "APPLICATIONS"
  },
  {
    title: "Radhe Jewellers",
    description: "Jewelry businesses need elegant digital storefronts to showcase premium collections online. Built a responsive e-commerce frontend with interactive catalog, smooth animations, and mobile-first navigation using React and Framer Motion. Achieved 95+ Lighthouse performance score with optimized image loading.",
    tech: ["React", "Vite", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/Harshid001/Radhe-Jwellers",
    live: "https://frontend-three-black-sifmjuce7w.vercel.app/",
    image: radheJewellersImg,
    category: "WEBSITES"
  },
  {
    title: "Website Maker",
    description: "Non-technical users need an intuitive way to build web pages without writing code. Built a drag-and-drop website builder with real-time layout customization, element styling, and live preview using React state management. Supports real-time editing with instant visual feedback across all viewport sizes.",
    tech: ["React", "Vite", "Tailwind CSS", "State Management"],
    github: "https://github.com/Harshid001/Website-maker",
    live: "https://website-maker-gevx.vercel.app/",
    image: websiteMakerImg,
    category: "WEBSITES"
  },
  {
    title: "Fund Hunters",
    description: "Digital banking interfaces often feel dated and unintuitive for everyday transactions. Designed a modern fintech platform UI with secure transaction flows and responsive dashboard using vanilla HTML/CSS/JS. Built fully responsive layouts that adapt seamlessly from 320px mobile to 4K desktop screens.",
    tech: ["HTML", "CSS", "JavaScript", "Responsive Design"],
    github: "https://github.com/Harshid001/fund_hunters",
    live: "https://fund-hunters.vercel.app/",
    image: fundHuntersImg,
    category: "WEBSITES"
  },
  {
    title: "Crop Sphere",
    description: "Farmers need accessible digital tools to manage crop data and agricultural planning. Built a comprehensive agricultural dashboard with crop tracking, weather integration, and analytics using React and Tailwind CSS. Delivers real-time agricultural insights through an intuitive, mobile-friendly dashboard interface.",
    tech: ["React", "Tailwind CSS", "JavaScript"],
    github: "https://github.com/Harshid001/crop_sphere",
    live: "https://crop-sphere.vercel.app/",
    image: "https://res.cloudinary.com/dh0xawlig/image/upload/q_auto/f_auto/v1781498309/Screenshot_2026-06-15_100751_vqz10c.png",
    category: "WEBSITES"
  },
  {
    title: "MediPrice",
    description: "Patients struggle to compare healthcare costs across different providers and services. Built a medical pricing platform with provider search, cost comparison, and transparent pricing data using React. Aggregates pricing data from multiple sources into a single, easy-to-navigate comparison interface.",
    tech: ["React", "Tailwind CSS", "JavaScript"],
    github: "https://github.com/codinggita/mediPrice",
    live: "https://mediprice-five.vercel.app/about",
    image: "https://res.cloudinary.com/dh0xawlig/image/upload/q_auto/f_auto/v1778065370/Screenshot_2026-05-06_161814_g2g0bn.png",
    category: "WEBSITES"
  },
  {
    title: "Payfair",
    description: "Peer-to-peer payments need simple, trustworthy interfaces that minimize friction. Built a digital payment platform with secure transaction processing, wallet management, and payment history using React. Implemented smooth payment flows with real-time balance updates and transaction confirmation.",
    tech: ["React", "Tailwind CSS", "JavaScript"],
    github: "https://github.com/Harshid001/PAYFAIR",
    live: "https://payfair-nine.vercel.app/",
    image: "https://res.cloudinary.com/dh0xawlig/image/upload/q_auto/f_auto/v1778339333/Screenshot_2026-05-09_203414_mi2sxq.png",
    category: "WEBSITES"
  },
  { 
    title: "Logitech clone", 
    description: "Recreating production-quality UIs teaches advanced CSS layout and animation techniques. Built a pixel-perfect responsive clone of the Logitech website with vibrant animations and exact design fidelity. Matched the original layout across all breakpoints using only HTML, CSS, and vanilla JavaScript.", 
    tech: ["HTML", "CSS", "JS"], 
    live: "https://diwalicloneproject5.netlify.app/", 
    image: logitechImg,
    category: "WEBSITES"
  },
  { 
    title: "Rockstart clone", 
    description: "Studying AAA game studio websites reveals advanced layout patterns and micro-interactions. Built a responsive UI clone focused on pixel-perfect layout accuracy and smooth hover transitions. Achieved near-identical visual fidelity to the original using semantic HTML and custom CSS animations.", 
    tech: ["HTML", "CSS", "JS"], 
    live: "https://diwalicloneproject2.netlify.app/", 
    image: rockstarImg,
    category: "WEBSITES"
  },
  { 
    title: "NumerAI clone", 
    description: "Complex data science platforms need approachable, animation-rich landing pages to attract users. Built an animation-focused clone with advanced CSS transitions, scroll effects, and smooth page flow. Implemented 10+ custom CSS animations including parallax scrolling and staggered element reveals.", 
    tech: ["HTML", "CSS", "JS"], 
    live: "https://diwalicloneproject3.netlify.app/", 
    image: numeraiImg,
    category: "WEBSITES"
  }
];


const Projects = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % projects.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, activeIndex]);

  const activeProject = projects[activeIndex];
  const activeCategory = activeProject?.category || 'APPLICATIONS';
  const categoryProjects = projects.filter(p => p.category === activeCategory);
  const localIndex = categoryProjects.indexOf(activeProject);

  return (
    <section 
      id="projects" 
      className="py-16 lg:py-24 relative border-t-2" 
      style={{ backgroundColor: 'var(--color-paper-2)', borderColor: 'var(--color-ink)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="section-label mb-4 block">03 / PORTFOLIO</span>
            <h2 style={{ fontSize: 'clamp(32px, 10vw, 80px)', lineHeight: 0.9 }}>
              FEATURED<br/>PROJECTS
            </h2>
          </div>
        </div>

        {/* Screen reader live region for active project announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Viewing project {localIndex + 1} of {categoryProjects.length} in {activeCategory.toLowerCase()}: {activeProject?.title}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12" id="project-showcase" role="tabpanel" aria-labelledby={`tab-${activeIndex}`}>
          {/* Mobile Navigation */}
          <div className="lg:hidden w-full">
            <ProjectNavigation 
              projects={projects} 
              activeIndex={activeIndex} 
              setActiveIndex={setActiveIndex} 
            />
          </div>

          {/* Left Showcase - 70% */}
          <div className="w-full lg:w-[70%]">
            <ProjectShowcase 
              project={activeProject} 
              index={localIndex} 
            />
          </div>

          {/* Desktop Navigation Rail - 30% */}
          <div className="hidden lg:block lg:w-[30%]">
            <ProjectNavigation 
              projects={projects} 
              activeIndex={activeIndex} 
              setActiveIndex={setActiveIndex} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
