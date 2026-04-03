import { useCollab } from '../context/CollabContext';
import { AnimatePresence, motion } from 'framer-motion';

const ReactionBurst = () => {
  const { reactions } = useCollab();

  return (
    <div className="fixed inset-0 pointer-events-none z-[9500]">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ y: 0, opacity: 1, scale: 1 }}
            animate={{ y: -80, opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${reaction.x}vw`,
              top: `${reaction.y}vh`,
              color: reaction.color,
              fontSize: '24px',
              fontWeight: 'bold',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div>{reaction.symbol}</div>
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.2 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                marginTop: '4px',
                textTransform: 'uppercase'
              }}
            >
              {reaction.name}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ReactionBurst;
