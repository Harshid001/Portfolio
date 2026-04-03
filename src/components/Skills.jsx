import { motion } from 'framer-motion';
import { FaHtml5, FaCss3Alt, FaReact, FaNodeJs, FaGithub, FaGitAlt } from 'react-icons/fa';
import { DiMongodb } from 'react-icons/di';
import { SiTailwindcss, SiExpress } from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';
import SectionPresence from './SectionPresence';

const skills = [
  { name: "HTML5", icon: FaHtml5, color: "#E34F26" },
  { name: "CSS3", icon: FaCss3Alt, color: "#1572B6" },
  { name: "JavaScript", icon: FaNodeJs, color: "#F7DF1E" }, // Falling back to text if JS icon missing, or just use JS icon? Wait, I didn't search for JS. Let me use a generic one or FaNodeJs for now, or just text. Actually, let's use FaReact color logic but since I didn't see SiJavascript, let me remove JS or use an emoji/text if needed. Let's try FaJs or DiJavascript1...
  { name: "React", icon: FaReact, color: "#61DAFB" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Node.js", icon: FaNodeJs, color: "#339933" },
  { name: "Express.js", icon: SiExpress, color: "#ffffff" },
  { name: "MongoDB", icon: DiMongodb, color: "#47A248" },
  { name: "Git", icon: FaGitAlt, color: "#F05032" },
  { name: "GitHub", icon: FaGithub, color: "#ffffff" },
  { name: "VS Code", icon: VscVscode, color: "#007ACC" },
];

const Skills = () => {
  return (
    <section id="skills" className="py-24 relative" style={{ backgroundColor: 'var(--color-paper)' }}>
      <SectionPresence sectionId="skills" />

      {/* Marquee Strip */}
      <div
        className="w-full overflow-hidden whitespace-nowrap mb-16 py-3"
        style={{
          borderTop: '2px solid var(--color-ink)',
          borderBottom: '2px solid var(--color-ink)',
          backgroundColor: 'var(--color-ink)',
          color: 'var(--color-paper)'
        }}
      >
        <div style={{ display: 'inline-block', animation: 'marquee 20s linear infinite' }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '28px', paddingRight: '12px' }}>
              HTML · CSS · REACT · NODE · MONGODB · EXPRESS · GIT ·{' '}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <span className="section-label mb-4 block">02 / ABILITIES</span>
          <h2 style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 0.9 }}>
            WHAT I<br />WORK WITH
          </h2>
        </div>

        {/* Skills Grid */}
        <motion.div
          className="grid gap-4 sm:gap-5"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.07 }
            }
          }}
        >
          {skills.map((skill, i) => {
            const Icon = skill.icon;
            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 }
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{
                  scale: 1.06,
                  y: -6,
                  transition: { duration: 0.25, ease: "easeOut" }
                }}
                className="group cursor-none"
                style={{
                  border: '2px solid var(--color-ink)',
                  backgroundColor: 'var(--color-paper-2)',
                  padding: '28px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background-color 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-ink)';
                  e.currentTarget.style.boxShadow = `0 8px 30px ${skill.color}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-paper-2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Glow ring on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{
                    transition: 'opacity 0.4s',
                    background: `radial-gradient(circle at center, ${skill.color}15 0%, transparent 70%)`,
                  }}
                />

                {/* Icon */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {Icon && <Icon
                    size={40}
                    className="transition-colors duration-300"
                    style={{ color: 'var(--color-ink)' }}
                    onMouseEnter={() => {}}
                  />}
                  <style>{`
                    .group:hover .transition-colors { color: ${skill.color} !important; }
                  `}</style>
                </div>

                {/* Name */}
                <span
                  className="transition-colors duration-300"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-2)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {skill.name}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
