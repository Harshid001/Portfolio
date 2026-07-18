import { motion } from 'framer-motion';
import { FaReact, FaNodeJs, FaPython } from 'react-icons/fa';
import { DiJavascript1 } from 'react-icons/di';
import { SiTailwindcss, SiExpress, SiNextdotjs, SiRedis } from 'react-icons/si';
import GrainText from './GrainText';

const skills = [
  // ── Frontend ───────────────────────────────────────────
  { name: 'React', category: 'Frontend', description: 'Component-driven UI architecture with hooks, context, and state management', icon: FaReact },
  { name: 'Next.js', category: 'Frontend', description: 'React framework for production with server-side rendering and static generation', icon: SiNextdotjs },
  { name: 'JavaScript', category: 'Frontend', description: 'ES6+ features, async patterns, DOM manipulation, and event-driven programming', icon: DiJavascript1 },
  { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework for rapid, responsive UI development', icon: SiTailwindcss },

  // ── Backend ────────────────────────────────────────────
  { name: 'Node.js', category: 'Backend', description: 'Server-side JavaScript runtime for scalable network applications', icon: FaNodeJs },
  { name: 'Express', category: 'Backend', description: 'RESTful API design, middleware patterns, and route architecture', icon: SiExpress },
  { name: 'Python', category: 'Backend', description: 'General-purpose scripting, data processing, and AI/ML integration', icon: FaPython },
  { name: 'Redis', category: 'Backend', description: 'In-memory data structure store, used as a database, cache, and message broker', icon: SiRedis },
];

const SkillItem = ({ skill }) => {
  const Icon = skill.icon;
  return (
    <motion.div
      tabIndex="0"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      className="group relative z-10 hover:z-20 focus:z-20 outline-none cursor-pointer"
      style={{ height: '240px' }}
    >
      {/* Static Brutalist Shadow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundColor: 'var(--color-ink)',
          transform: 'translate(6px, 6px)'
        }}
      />

      <div className="absolute inset-0 w-full h-full [perspective:1000px] transition-transform duration-500 group-hover:-translate-y-1 group-focus:-translate-y-1">
        <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateX(180deg)] group-focus:[transform:rotateX(180deg)]">
          
          {/* Front Face */}
          <div 
            className="absolute inset-0 flex flex-col gap-4 p-5 border-2 bg-[var(--color-paper-2)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateX(0deg)]"
            style={{ borderColor: 'var(--color-ink)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="p-3 border-2 transition-colors duration-300 group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-paper)] flex-shrink-0" 
                style={{ 
                  borderColor: 'var(--color-ink)', 
                  backgroundColor: 'var(--color-paper)',
                  color: 'var(--color-ink)'
                }}
              >
                <Icon size={28} className="transition-colors duration-300" />
              </div>
              <div>
                <h4 
                  className="font-bold text-xl leading-tight" 
                  style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink)' }}
                >
                  {skill.name}
                </h4>
              </div>
            </div>
            <p 
              className="text-sm mt-2 flex-grow" 
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)', lineHeight: 1.5 }}
            >
              {skill.description}
            </p>
          </div>

          {/* Back Face */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center border-2 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateX(180deg)]"
            style={{
              borderColor: 'var(--color-ink)',
              backgroundColor: 'var(--color-ink)',
              color: 'var(--color-paper)'
            }}
          >
            <Icon size={80} />
            <p 
              className="mt-6 font-bold text-2xl" 
              style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {skill.name}
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

const SkillCategory = ({ title, categorySkills }) => (
  <div className="mb-20 last:mb-0">
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      className="mb-8 border-b-2 pb-4 inline-block pr-12"
      style={{ borderColor: 'var(--color-ink)' }}
    >
      <h3 
        style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '2rem', 
          color: 'var(--color-ink)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
          lineHeight: 1
        }}
      >
        {title}
      </h3>
    </motion.div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categorySkills.map((skill) => (
        <SkillItem key={skill.name} skill={skill} />
      ))}
    </div>
  </div>
);

const Skills = () => {
  const frontendSkills = skills.filter(s => s.category === 'Frontend');
  const backendSkills = skills.filter(s => s.category === 'Backend');

  return (
    <section
      id="skills"
      className="py-24 relative border-t-2"
      style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)' }}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
        >
          <span className="section-label mb-4 block" style={{ color: 'var(--color-ink)' }}>02 / SKILLS</span>
          <h2
            style={{
              fontSize: 'clamp(40px, 10vw, 120px)',
              lineHeight: 0.9,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-ink)',
              textTransform: 'uppercase',
              margin: 0
            }}
          >
            <GrainText style={{ display: 'block', width: '100%' }}>
              TOOLS OF
              <br />
              THE TRADE
            </GrainText>
          </h2>
        </motion.div>

        <div className="mt-16">
          <SkillCategory title="Frontend" categorySkills={frontendSkills} />
          <SkillCategory title="Backend" categorySkills={backendSkills} />
        </div>
      </div>
    </section>
  );
};

export default Skills;
