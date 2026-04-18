import { motion } from 'framer-motion';
import SectionPresence from './SectionPresence';
import studybuddyImg from '../assets/studdy-buddy.png';
import pincodeImg from '../assets/Pincode.png';
import smartfactoryImg from '../assets/smartfactory.png';
import logitechImg from '../assets/Logitech.png';
import rockstarImg from '../assets/Rockstar.png';
import numeraiImg from '../assets/NumerAI.png';

const projects = [
  { title: "StudyBuddy", description: "AI-powered study assistant to help students manage learning efficiently. Features a smart chatbot and resource management.", tech: ["React", "Node.js", "MongoDB", "Express"], github: "https://github.com/Harshid001/studybuddy", image: studybuddyImg },
  { title: "PINCODE", description: "Full-stack pincode directory app with search, filter by state/district/taluk, and dashboard analytics for Indian postal data.", tech: ["React", "Node.js", "MongoDB", "Express"], github: "https://github.com/Harshid001/PINCODE", live: "https://pincode-delta.vercel.app", image: pincodeImg },
  { title: "Smart Factory AI", description: "AI-based system to optimize smart factory operations and automation using real-time data analysis.", tech: ["Python", "AI/ML", "REST API", "Web"], github: "https://github.com/Harshid001/smartfactoryAIsystem", image: smartfactoryImg },
  { title: "Logitech clone", description: "Logitech responsive UI clone showcasing frontend and design skills with vibrant animations.", tech: ["HTML", "CSS", "JS"], live: "https://diwalicloneproject5.netlify.app/", image: logitechImg },
  { title: "Rockstart clone", description: "Modern UI clone focused on layout accuracy and responsiveness for festive applications.", tech: ["HTML", "CSS", "JS"], live: "https://diwalicloneproject2.netlify.app/", image: rockstarImg },
  { title: "NumerAI clone", description: "Animation-focused festive UI project with advanced CSS styling and smooth transitions.", tech: ["HTML", "CSS", "JS"], live: "https://diwalicloneproject3.netlify.app/", image: numeraiImg }
];

const ProjectCard = ({ project, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    viewport={{ once: true, margin: "-60px" }}
    transition={{ delay: (index % 2) * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} 
    whileHover={{ y: -4, boxShadow: "6px 6px 0px var(--color-ink)" }}
    className="group relative overflow-hidden transition-all duration-150 cursor-none flex flex-col"
    style={{ 
      border: '2px solid var(--color-ink)', 
      backgroundColor: 'var(--color-paper)',
      boxShadow: '0 0 0 transparent',
      height: '100%'
    }}
  >
    {/* Top color bar */}
    <div 
      className="absolute top-0 left-0 w-full transition-all duration-150 z-20" 
      style={{ height: '4px', backgroundColor: 'var(--color-ink)' }} 
    />
    
    {/* Project Image Preview */}
    {project.image && (
      <div className="w-full h-48 sm:h-56 border-b-2 overflow-hidden relative z-10" style={{ borderColor: 'var(--color-ink)' }}>
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-105" 
        />
      </div>
    )}
    
    <div className={`p-8 ${project.image ? 'pt-6' : 'pt-10'} flex flex-col flex-grow relative z-10`}>
      {/* Decorative Number */}
      <div 
        className="absolute bottom-4 right-6 pointer-events-none transition-transform duration-300 group-hover:-translate-y-2 opacity-20"
        style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '64px', 
          color: 'var(--color-ink)',
          lineHeight: 1
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <h3 className="mb-4" style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '20px', color: 'var(--color-ink)' }}>
        {project.title}
      </h3>
      
      <p className="mb-6 flex-grow" style={{ color: 'var(--color-ink-2)', fontSize: '14px', lineHeight: 1.6 }}>
        {project.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {project.tech.map((t, i) => (
          <span 
            key={i} 
            className="tag"
            style={{ backgroundColor: 'transparent', color: 'var(--color-ink-2)', border: '1.5px solid var(--color-ink-3)', fontSize: '10px' }}
          >
            {t}
          </span>
        ))}
      </div>
      
      <div className="flex gap-6 mt-auto" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold' }}>
        {project.github && (
          <a href={project.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 transition-colors cursor-none" style={{ color: 'var(--color-ink)' }}
             onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-red)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-ink)'}>
            → CODE
          </a>
        )}
        {project.live && (
          <a href={project.live} target="_blank" rel="noreferrer" className="flex items-center gap-1 transition-colors cursor-none" style={{ color: 'var(--color-ink)' }}
             onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-red)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-ink)'}>
            → LIVE
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

const Projects = () => {
  return (
    <section id="projects" className="py-24 relative border-t-2" style={{ backgroundColor: 'var(--color-paper-2)', borderColor: 'var(--color-ink)' }}>
      <SectionPresence sectionId="projects" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ borderTop: '2px solid var(--color-ink)', width: '100%', marginBottom: '64px' }} />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="section-label mb-4 block">03 / PORTFOLIO</span>
            <h2 style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 0.9 }}>
              FEATURED<br/>PROJECTS
            </h2>
          </div>
          <p className="max-w-sm mb-2" style={{ color: 'var(--color-ink-2)', fontWeight: 500 }}>A collection of selected works in web development, AI, and UI design.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => <ProjectCard key={idx} project={project} index={idx} />)}
        </div>
      </div>
    </section>
  );
};

export default Projects;
