import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';

const ProjectShowcase = ({ project, index }) => {
  if (!project) return null;

  return (
    <div className="w-full flex flex-col h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={project.title}
          initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.98, transition: { duration: 0.15 } }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col flex-grow"
        >
          {/* Project Image with View Project Overlay */}
          <div 
            className="w-full overflow-hidden relative mb-6 lg:mb-8 group"
            style={{ 
              border: '1px solid var(--color-ink)',
              aspectRatio: '16 / 9',
              backgroundColor: 'var(--color-paper)'
            }}
            onTouchStart={() => {}} // Enables :active state on mobile Safari
          >
            {project.image ? (
              <>
                <img 
                  src={project.image} 
                  alt={`${project.title} project screenshot`} 
                  loading="lazy"
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-active:grayscale-0 group-hover:scale-105 group-active:scale-105" 
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300">
                   {project.live && (
                     <a 
                       href={project.live} 
                       target="_blank" 
                       rel="noreferrer" 
                       className="flex items-center gap-2 px-6 py-3 cursor-none transition-all duration-300"
                       style={{
                         border: '1px solid var(--color-paper)',
                         backgroundColor: 'var(--color-paper)',
                         color: 'var(--color-ink)',
                         fontFamily: 'var(--font-mono)',
                         fontSize: '12px',
                         fontWeight: 'bold',
                         letterSpacing: '0.1em',
                         textTransform: 'uppercase'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.backgroundColor = 'transparent';
                         e.currentTarget.style.color = 'var(--color-paper)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.backgroundColor = 'var(--color-paper)';
                         e.currentTarget.style.color = 'var(--color-ink)';
                       }}
                     >
                       <FiExternalLink className="text-lg" /> LIVE DEMO
                     </a>
                   )}
                   {project.github && (
                     <a 
                       href={project.github} 
                       target="_blank" 
                       rel="noreferrer" 
                       className="flex items-center gap-2 px-6 py-3 cursor-none transition-all duration-300"
                       style={{
                         border: '1px solid var(--color-paper)',
                         backgroundColor: 'var(--color-paper)',
                         color: 'var(--color-ink)',
                         fontFamily: 'var(--font-mono)',
                         fontSize: '12px',
                         fontWeight: 'bold',
                         letterSpacing: '0.1em',
                         textTransform: 'uppercase'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.backgroundColor = 'transparent';
                         e.currentTarget.style.color = 'var(--color-paper)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.backgroundColor = 'var(--color-paper)';
                         e.currentTarget.style.color = 'var(--color-ink)';
                       }}
                     >
                       <FaGithub className="text-lg" /> VIEW CODE
                     </a>
                   )}
                   {!project.live && !project.github && (
                     <span style={{ color: 'var(--color-paper)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>COMING SOON</span>
                   )}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-3 font-mono text-sm uppercase tracking-widest">
                No preview available
              </div>
            )}
          </div>

          <div className="flex flex-col flex-grow">
            {/* Title & Number Inline */}
            <div className="flex items-baseline gap-4 mb-4">
              <span 
                style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: 'clamp(24px, 3vw, 36px)', 
                  color: 'var(--color-ink)',
                  opacity: 0.3,
                  fontWeight: 700
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 
                style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontWeight: 700, 
                  fontSize: 'clamp(28px, 4vw, 42px)', 
                  color: 'var(--color-ink)',
                  lineHeight: 1.1
                }}
              >
                {project.title}
              </h3>
            </div>

            {/* Description */}
            <p 
              className="mb-6"
              style={{ 
                fontFamily: 'var(--font-body)',
                color: 'var(--color-ink-2)', 
                fontSize: 'clamp(15px, 2vw, 16px)', 
                lineHeight: 1.6,
                maxWidth: '65ch'
              }}
            >
              {project.description}
            </p>

            {/* Tech Stack */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t, i) => (
                  <span 
                    key={i} 
                    className="tag rounded-none transition-colors duration-300"
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: 'var(--color-ink)', 
                      border: '1px solid var(--color-ink)', 
                      fontSize: '11px',
                      padding: '4px 10px',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-ink)';
                      e.currentTarget.style.color = 'var(--color-paper)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-ink)';
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons removed */}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProjectShowcase;
