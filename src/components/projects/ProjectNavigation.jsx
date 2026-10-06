import { motion } from 'framer-motion';

const ProjectNavigation = ({ projects, activeIndex, setActiveIndex }) => {
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  // Group projects for the explorer dynamically by category
  const applications = projects.filter((p) => p.category === 'APPLICATIONS');
  const websites = projects.filter((p) => p.category === 'WEBSITES');

  // Derive active tab from current activeIndex
  const activeTab = projects[activeIndex]?.category || 'APPLICATIONS';

  const handleTabClick = (tab) => {
    const firstIndex = projects.findIndex((p) => p.category === tab);
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
        type="button"
        aria-pressed={isActive}
        aria-label={`Select ${project.title}`}
        onClick={() => setActiveIndex(globalIndex)}
        onKeyDown={(e) => handleKeyDown(e, globalIndex)}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex shrink-0 justify-start items-start gap-4 px-4 py-3 lg:px-5 lg:py-4 transition-all duration-200 cursor-pointer ${
          isActive
            ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
            : 'hover:bg-[var(--color-paper-3)] hover:pl-5 lg:hover:pl-6 text-[var(--color-ink)]'
        }`}
        style={{
          borderLeft: isActive
            ? '4px solid var(--color-red)'
            : '4px solid transparent',
          fontFamily: 'var(--font-heading)',
          textAlign: 'left',
        }}
      >
        <div
          className="mt-0.5"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: isActive ? '14px' : '13px',
            color: isActive ? 'var(--color-red)' : 'var(--color-ink-3)',
            fontWeight: isActive ? 700 : 500,
            transition: 'all 0.2s ease',
          }}
        >
          {isActive ? '►' : String(localIndex + 1).padStart(2, '0')}
        </div>
        <div className="flex flex-col">
          <span
            style={{
              fontWeight: isActive ? 700 : 600,
              fontSize: isActive ? '16px' : '15px',
              transition: 'all 0.2s ease',
              color: isActive ? 'var(--color-paper)' : 'var(--color-ink)',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              opacity: isActive ? 1 : 0.9,
            }}
          >
            {project.title}
          </span>
          <span
            className="mt-1"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              opacity: isActive ? 0.85 : 0.65,
              color: isActive ? 'var(--color-paper)' : 'var(--color-ink-2)',
            }}
          >
            {project.tech.slice(0, 3).join(' • ')}
          </span>
        </div>
      </motion.button>
    );
  };

  return (
    <div
      role="region"
      aria-label="Project selection"
      className="w-full flex flex-col h-full bg-[var(--color-paper-2)] border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)]"
    >
      {/* Category Tabs */}
      <div
        className="flex mb-0 border-b-2 border-[var(--color-ink)]"
        aria-label="Project Categories"
      >
        <button
          type="button"
          aria-pressed={activeTab === 'APPLICATIONS'}
          onClick={() => handleTabClick('APPLICATIONS')}
          className="flex-1 py-3 text-center transition-colors cursor-pointer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            backgroundColor:
              activeTab === 'APPLICATIONS' ? 'var(--color-ink)' : 'transparent',
            color:
              activeTab === 'APPLICATIONS'
                ? 'var(--color-paper)'
                : 'var(--color-ink)',
          }}
        >
          APPLICATIONS
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'WEBSITES'}
          onClick={() => handleTabClick('WEBSITES')}
          className="flex-1 py-3 text-center transition-colors cursor-pointer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            backgroundColor:
              activeTab === 'WEBSITES' ? 'var(--color-ink)' : 'transparent',
            color:
              activeTab === 'WEBSITES'
                ? 'var(--color-paper)'
                : 'var(--color-ink)',
            borderLeft: '2px solid var(--color-ink)',
          }}
        >
          WEBSITES
        </button>
      </div>

      {/* Navigation List - Mobile Horizontal / Desktop Vertical */}
      <div
        className="flex flex-col flex-grow w-full py-2 space-y-0.5 overflow-y-auto max-h-[250px] md:max-h-[300px] lg:max-h-[550px]"
        role="tablist"
        aria-label="Project selection"
        data-lenis-prevent="true"
        style={{
          backgroundColor: 'transparent',
          overscrollBehavior: 'auto',
          scrollBehavior: 'smooth',
        }}
      >
        {activeTab === 'APPLICATIONS'
          ? applications.map((project, index) =>
              renderProjectItem(project, index, 0),
            )
          : websites.map((project, index) =>
              renderProjectItem(project, index, applications.length),
            )}
      </div>
    </div>
  );
};

export default ProjectNavigation;
