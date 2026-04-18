import { motion } from 'framer-motion';
import { FaReact, FaNodeJs, FaGitAlt, FaFigma, FaHtml5, FaCss3Alt, FaPython } from 'react-icons/fa';
import { DiMongodb, DiJavascript1 } from 'react-icons/di';
import { SiTypescript, SiTailwindcss, SiPostgresql, SiExpress, SiBlender, SiC, SiCplusplus } from 'react-icons/si';
import SectionPresence from './SectionPresence';

const skills = [
  { name: 'React', category: 'Frontend', description: 'Component-driven UI architecture', level: 'Advanced', icon: FaReact },
  { name: 'JavaScript', category: 'Frontend', description: 'Dynamic, prototype-based scripting', level: 'Advanced', icon: DiJavascript1 },
  { name: 'TypeScript', category: 'Frontend', description: 'Typed superset of JavaScript', level: 'Intermediate', icon: SiTypescript },
  { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework', level: 'Advanced', icon: SiTailwindcss },
  { name: 'Node.js', category: 'Backend', description: 'Server-side JavaScript runtime', level: 'Advanced', icon: FaNodeJs },
  { name: 'MongoDB', category: 'Backend', description: 'NoSQL document database', level: 'Advanced', icon: DiMongodb },
  { name: 'PostgreSQL', category: 'Backend', description: 'Relational SQL database', level: 'Intermediate', icon: SiPostgresql },
  { name: 'Git', category: 'Other', description: 'Distributed version control', level: 'Advanced', icon: FaGitAlt },
  { name: 'Figma', category: 'Other', description: 'Collaborative design tool', level: 'Intermediate', icon: FaFigma },
  { name: 'React Native', category: 'Frontend', description: 'Cross-platform mobile apps', level: 'Intermediate', icon: FaReact },
  { name: 'HTML', category: 'Frontend', description: 'Structure of the web', level: 'Advanced', icon: FaHtml5 },
  { name: 'CSS', category: 'Frontend', description: 'Styling and layout', level: 'Advanced', icon: FaCss3Alt },
  { name: 'Express JS', category: 'Backend', description: 'Minimalist web framework', level: 'Intermediate', icon: SiExpress },
  { name: 'Blender 3D', category: 'Other', description: '3D creation suite', level: 'Intermediate', icon: SiBlender },
  { name: 'C Language', category: 'Backend', description: 'Low-level systems programming', level: 'Intermediate', icon: SiC },
  { name: 'C++', category: 'Backend', description: 'Object-oriented systems coding', level: 'Intermediate', icon: SiCplusplus },
  { name: 'Python', category: 'Backend', description: 'General-purpose programming', level: 'Advanced', icon: FaPython },
];

const SkillItem = ({ skill }) => {
  const Icon = skill.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      className="group h-full relative cursor-none"
    >
      {/* Static Brutalist Shadow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundColor: 'var(--color-ink)',
          transform: 'translate(6px, 6px)'
        }}
      />

      <div className="relative h-full w-full [perspective:1000px] transition-transform duration-500 group-hover:-translate-y-1">
        <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateX(180deg)]">
          
          {/* Front Face */}
          <div 
            className="relative flex flex-col gap-4 p-5 border-2 h-full bg-[var(--color-paper-2)] backface-hidden [-webkit-backface-visibility:hidden] [transform:rotateX(0deg)]"
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
                <p 
                  className="text-[10px] mt-2 inline-block border px-2 py-0.5" 
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-3)', borderColor: 'var(--color-ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  {skill.level}
                </p>
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
            className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center border-2 backface-hidden [-webkit-backface-visibility:hidden] [transform:rotateX(180deg)]"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categorySkills.map((skill) => (
        <SkillItem key={skill.name} skill={skill} />
      ))}
    </div>
  </div>
);

const Skills = () => {
  const frontendSkills = skills.filter(s => s.category === 'Frontend');
  const backendSkills = skills.filter(s => s.category === 'Backend');
  const otherSkills = skills.filter(s => s.category === 'Other');

  return (
    <section
      id="skills"
      className="py-24 relative border-t-2"
      style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)' }}
    >
      <SectionPresence sectionId="skills" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
        >
          <span className="section-label mb-4 block" style={{ color: 'var(--color-ink)' }}>02 / SKILLS</span>
          <h2
            style={{
              fontSize: 'clamp(50px, 10vw, 120px)',
              lineHeight: 0.9,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-ink)',
              textTransform: 'uppercase',
              margin: 0
            }}
          >
            TOOLS OF
            <br />
            THE TRADE
          </h2>
        </motion.div>

        <div className="mt-16">
          <SkillCategory title="Frontend" categorySkills={frontendSkills} />
          <SkillCategory title="Backend" categorySkills={backendSkills} />
          <SkillCategory title="Other Skills" categorySkills={otherSkills} />
        </div>
      </div>
    </section>
  );
};

export default Skills;
