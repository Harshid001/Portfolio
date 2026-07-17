import { motion } from 'framer-motion';
import { FaReact, FaNodeJs, FaGitAlt, FaFigma, FaHtml5, FaCss3Alt, FaPython } from 'react-icons/fa';
import { DiMongodb, DiJavascript1 } from 'react-icons/di';
import { SiTypescript, SiTailwindcss, SiPostgresql, SiExpress, SiBlender, SiC, SiCplusplus } from 'react-icons/si';

const skillItems = [
  { name: 'React', Icon: FaReact },
  { name: 'JavaScript', Icon: DiJavascript1 },
  { name: 'Tailwind CSS', Icon: SiTailwindcss },
  { name: 'Node.js', Icon: FaNodeJs },
  { name: 'MongoDB', Icon: DiMongodb },
  { name: 'Python', Icon: FaPython },
  { name: 'HTML5', Icon: FaHtml5 },
  { name: 'CSS3', Icon: FaCss3Alt },
  { name: 'Express', Icon: SiExpress },
  { name: 'TypeScript', Icon: SiTypescript },
  { name: 'Git', Icon: FaGitAlt },
  { name: 'Figma', Icon: FaFigma }
];

const SkillsMarquee = () => {
  return (
    <div
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        overflow: 'hidden',
        borderTop: '2px solid var(--color-ink)',
        borderBottom: '2px solid var(--color-ink)',
        backgroundColor: 'var(--color-ink)',
        padding: '24px 0',
        position: 'relative',
      }}
    >
      {/* Fade masks left and right */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '80px',
        background: 'linear-gradient(to right, var(--color-ink), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '80px',
        background: 'linear-gradient(to left, var(--color-ink), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* Track — duplicate the list 3× so it seamlessly loops */}
      <div style={{
        display: 'inline-flex',
        animation: 'skillsMarquee 28s linear infinite',
        whiteSpace: 'nowrap',
        gap: 0,
      }}>
        {[...Array(3)].map((_, repeatIdx) => (
          <span key={repeatIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
            {skillItems.map((item, idx) => (
              <span
                key={`${repeatIdx}-${idx}`}
                className="hover:scale-110 transition-transform duration-300"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0 32px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: idx % 3 === 0 ? 'var(--color-paper)' : 'var(--color-ink-3)',
                }}
              >
                <item.Icon size={32} />
                {item.name}
              </span>
            ))}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes skillsMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
};

export default SkillsMarquee;
