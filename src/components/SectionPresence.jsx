import { useCollab } from '../context/CollabContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const SectionPresence = ({ sectionId }) => {
  const { ghostUsers } = useCollab();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sectionUsers = ghostUsers.filter(u => u.currentSection === sectionId).length;
    setCount(sectionUsers);
  }, [ghostUsers, sectionId]);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-6 right-6 z-20"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--color-ink-3)',
            backgroundColor: 'var(--color-paper)',
            border: '1px solid var(--color-ink-3)',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '7px' }}>◆</span>
          {count} here now
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SectionPresence;
