import { motion, AnimatePresence } from 'framer-motion';

const ProjectShowcase = ({ project, index }) => {
  if (!project) return null;

  return (
    <div className="w-full flex flex-col h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={project.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
          >
            {project.image ? (
              <>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  loading="lazy"
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   {(project.live || project.github) ? (
                     <a 
                       href={project.live || project.github} 
                       target="_blank" 
                       rel="noreferrer" 
                       className="px-6 py-3 cursor-none"
                       style={{
                         border: '1px solid var(--color-paper)',
                         color: 'var(--color-paper)',
                         fontFamily: 'var(--font-mono)',
                         fontSize: '12px',
                         fontWeight: 'bold',
                         letterSpacing: '0.1em',
                         transition: 'all 0.3s',
                         textTransform: 'uppercase'
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.backgroundColor = 'var(--color-paper)';
                         e.currentTarget.style.color = 'var(--color-ink)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.backgroundColor = 'transparent';
                         e.currentTarget.style.color = 'var(--color-paper)';
                       }}
                     >
                       VIEW PROJECT
                     </a>
                   ) : (
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
                    className="tag rounded-none"
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
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div 
              className="flex flex-wrap gap-4 mt-auto" 
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 'bold' }}
            >
              {project.live && (
                <motion.a 
                  href={project.live} 
                  target="_blank" 
                  rel="noreferrer" 
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center px-6 py-3 transition-colors cursor-none rounded-none" 
                  style={{ 
                    backgroundColor: 'var(--color-ink)',
                    color: 'var(--color-paper)',
                    border: '1px solid var(--color-ink)',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-ink)';
                  }} 
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-ink)';
                    e.currentTarget.style.color = 'var(--color-paper)';
                  }}
                  aria-label={`View live demo of ${project.title}`}
                >
                  → LIVE DEMO
                </motion.a>
              )}
              {project.github && (
                <motion.a 
                  href={project.github} 
                  target="_blank" 
                  rel="noreferrer" 
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center px-6 py-3 transition-colors cursor-none rounded-none" 
                  style={{ 
                    backgroundColor: 'transparent',
                    color: 'var(--color-ink)',
                    border: '1px solid var(--color-ink)',
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
                  aria-label={`View source code for ${project.title}`}
                >
                  → VIEW CODE
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProjectShowcase;
