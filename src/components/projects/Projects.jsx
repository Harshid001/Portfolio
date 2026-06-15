import { useState } from 'react';
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
    description: "AI-powered study assistant to help students manage learning efficiently. Features a smart chatbot and resource management.", 
    tech: ["React", "Node.js", "MongoDB", "Express"], 
    github: "https://github.com/Harshid001/studybuddy", 
    image: studybuddyImg,
    category: "APPLICATIONS"
  },
  { 
    title: "PINCODE", 
    description: "Full-stack pincode directory app with search, filter by state/district/taluk, and dashboard analytics for Indian postal data.", 
    tech: ["React", "Node.js", "MongoDB", "Express"], 
    github: "https://github.com/Harshid001/PINCODE", 
    live: "https://pincode-delta.vercel.app", 
    image: pincodeImg,
    category: "APPLICATIONS"
  },
  { 
    title: "Smart Factory AI", 
    description: "AI-based system to optimize smart factory operations and automation using real-time data analysis.", 
    tech: ["Python", "AI/ML", "REST API", "Web"], 
    github: "https://github.com/Harshid001/smartfactoryAIsystem", 
    image: smartfactoryImg,
    category: "APPLICATIONS"
  },
  {
    title: "Radhe Jewellers",
    description: "An elegant, responsive jewelry e-commerce frontend displaying luxurious collections, interactive catalog, and user-friendly navigation.",
    tech: ["React", "Vite", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/Harshid001/Radhe-Jwellers",
    live: "https://frontend-three-black-sifmjuce7w.vercel.app/",
    image: radheJewellersImg,
    category: "WEBSITES"
  },
  {
    title: "Website Maker",
    description: "A dynamic website builder platform letting users customize layouts, elements, and styles in real-time with an intuitive, interactive workspace.",
    tech: ["React", "Vite", "Tailwind CSS", "State Management"],
    github: "https://github.com/Harshid001/Website-maker",
    live: "https://website-maker-gevx.vercel.app/",
    image: websiteMakerImg,
    category: "WEBSITES"
  },
  {
    title: "Fund Hunters",
    description: "A secure online banking and financial platform interface (PayX / Emerald Trust) designed for seamless and modern digital transactions.",
    tech: ["HTML", "CSS", "JavaScript", "Responsive Design"],
    github: "https://github.com/Harshid001/fund_hunters",
    live: "https://fund-hunters.vercel.app/",
    image: fundHuntersImg,
    category: "WEBSITES"
  },
  {
    title: "Crop Sphere",
    description: "A comprehensive agricultural platform and web dashboard.",
    tech: ["React", "Tailwind CSS", "JavaScript"],
    github: "https://github.com/Harshid001/crop_sphere",
    live: "https://crop-sphere.vercel.app/",
    image: "https://res.cloudinary.com/dh0xawlig/image/upload/q_auto/f_auto/v1781498309/Screenshot_2026-06-15_100751_vqz10c.png",
    category: "WEBSITES"
  },
  { 
    title: "Logitech clone", 
    description: "Logitech responsive UI clone showcasing frontend and design skills with vibrant animations.", 
    tech: ["HTML", "CSS", "JS"], 
    live: "https://diwalicloneproject5.netlify.app/", 
    image: logitechImg,
    category: "WEBSITES"
  },
  { 
    title: "Rockstart clone", 
    description: "Modern UI clone focused on layout accuracy and responsiveness for festive applications.", 
    tech: ["HTML", "CSS", "JS"], 
    live: "https://diwalicloneproject2.netlify.app/", 
    image: rockstarImg,
    category: "WEBSITES"
  },
  { 
    title: "NumerAI clone", 
    description: "Animation-focused festive UI project with advanced CSS styling and smooth transitions.", 
    tech: ["HTML", "CSS", "JS"], 
    live: "https://diwalicloneproject3.netlify.app/", 
    image: numeraiImg,
    category: "WEBSITES"
  }
];


const Projects = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeProject = projects[activeIndex];
  const activeCategory = activeProject?.category || 'APPLICATIONS';
  const categoryProjects = projects.filter(p => p.category === activeCategory);
  const localIndex = categoryProjects.indexOf(activeProject);

  return (
    <section 
      id="projects" 
      className="py-16 lg:py-24 relative border-t-2" 
      style={{ backgroundColor: 'var(--color-paper-2)', borderColor: 'var(--color-ink)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="section-label mb-4 block">03 / PORTFOLIO</span>
            <h2 style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 0.9 }}>
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
