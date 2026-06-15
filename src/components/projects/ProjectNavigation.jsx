import { motion } from 'framer-motion';

const ProjectNavigation = ({ projects, activeIndex, setActiveIndex }) => {
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  // Group projects for the explorer dynamically by category
  const applications = projects.filter(p => p.category === 'APPLICATIONS');
  const websites = projects.filter(p => p.category === 'WEBSITES');

  // Derive active tab from current activeIndex
  const activeTab = projects[activeIndex]?.category || 'APPLICATIONS';

  const handleTabClick = (tab) => {
    const firstIndex = projects.findIndex(p => p.category === tab);
    if (firstIndex !== -1) {
      setActiveIndex(firstIndex);
    }
  };

  const renderProjectItem = (project, localIndex, offset) => {
    const globalIndex = localIndex + offset;
    const isActive = globalIndex === activeIndex;

    return (
      <motion.button
        key={project.title}
        role="tab"
        aria-selected={isActive}
        aria-controls="project-showcase"
        onClick={() => setActiveIndex(globalIndex)}
        onKeyDown={(e) => handleKeyDown(e, globalIndex)}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex shrink-0 justify-start items-start gap-4 px-4 py-3 lg:px-5 lg:py-4 transition-all duration-300 cursor-none ${
          isActive ? '' : 'hover:pl-5 lg:hover:pl-7'
        }`}
        style={{
          backgroundColor: 'transparent',
          color: 'var(--color-paper)',
          borderLeft: isActive ? '4px solid var(--color-paper)' : '4px solid transparent',
          fontFamily: 'var(--font-heading)',
          textAlign: 'left',
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent'
        }}
      >
        <div 
          className="mt-1"
          style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: isActive ? '14px' : '13px',
            opacity: isActive ? 1 : 0.5,
            transition: 'all 0.3s ease'
          }}
        >
          {isActive ? '►' : String(localIndex + 1).padStart(2, '0')}
        </div>
        <div className="flex flex-col">
          <span 
            style={{ 
              fontWeight: isActive ? 700 : 500,
              fontSize: isActive ? '16px' : '15px',
              transition: 'all 0.3s ease',
              color: 'var(--color-paper)',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              opacity: isActive ? 1 : 0.7
            }}
          >
            {project.title}
          </span>
          <span
            className="mt-1"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              opacity: isActive ? 0.8 : 0.5,
              color: 'var(--color-paper)'
            }}
          >
            {project.tech.slice(0, 3).join(' • ')}
          </span>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Category Tabs */}
      <div 
        className="flex mb-0" 
        style={{ borderBottom: '2px solid var(--color-ink)' }}
        role="tablist"
        aria-label="Project Categories"
      >
        <button 
          role="tab"
          aria-selected={activeTab === 'APPLICATIONS'}
          onClick={() => handleTabClick('APPLICATIONS')}
          className="flex-1 py-3 text-center transition-colors cursor-none"
          style={{
             fontFamily: 'var(--font-mono)',
             fontSize: '12px',
             fontWeight: 'bold',
             letterSpacing: '0.1em',
             backgroundColor: activeTab === 'APPLICATIONS' ? 'var(--color-ink)' : 'transparent',
             color: activeTab === 'APPLICATIONS' ? 'var(--color-paper)' : 'var(--color-ink)',
          }}
        >
          APPLICATIONS
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'WEBSITES'}
          onClick={() => handleTabClick('WEBSITES')}
          className="flex-1 py-3 text-center transition-colors cursor-none"
          style={{
             fontFamily: 'var(--font-mono)',
             fontSize: '12px',
             fontWeight: 'bold',
             letterSpacing: '0.1em',
             backgroundColor: activeTab === 'WEBSITES' ? 'var(--color-ink)' : 'transparent',
             color: activeTab === 'WEBSITES' ? 'var(--color-paper)' : 'var(--color-ink)',
             borderLeft: '2px solid var(--color-ink)'
          }}
        >
          WEBSITES
        </button>
      </div>

      {/* Navigation List - Mobile Horizontal / Desktop Vertical */}
      <div 
        className="flex flex-col flex-grow w-full py-4 space-y-1 dark-section overflow-y-auto dark-scrollbar max-h-[250px] md:max-h-[300px] lg:max-h-[550px]"
        role="tablist"
        aria-label="Project selection"
        style={{
          backgroundColor: 'var(--color-ink)'
        }}
      >
        {activeTab === 'APPLICATIONS' 
          ? applications.map((project, index) => renderProjectItem(project, index, 0))
          : websites.map((project, index) => renderProjectItem(project, index, applications.length))
        }
      </div>
    </div>
  );
};

export default ProjectNavigation;
