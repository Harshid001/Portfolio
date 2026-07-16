import { motion } from 'framer-motion';
import { FaReact, FaNodeJs, FaGitAlt, FaFigma, FaHtml5, FaCss3Alt, FaPython } from 'react-icons/fa';
import { DiMongodb, DiJavascript1 } from 'react-icons/di';
import { SiTypescript, SiTailwindcss, SiPostgresql, SiExpress, SiBlender, SiC, SiCplusplus } from 'react-icons/si';

const skillNames = [
  'React', 'React-JS', 'Tailwind CSS', 'Node.js',
  'MongoDB', 'Python', 'Express',
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
            {skillNames.map((name, idx) => (
              <span
                key={`${repeatIdx}-${idx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0 16px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: idx % 3 === 0 ? 'var(--color-paper)' : 'var(--color-ink-3)',
                }}
              >
                {name}
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
