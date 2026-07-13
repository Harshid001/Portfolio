import { useCollab } from '../context/CollabContext';
import { AnimatePresence, motion } from 'framer-motion';

const GhostCursors = () => {
  const { ghostUsers } = useCollab();

  return (
    <>
      <AnimatePresence>
        {ghostUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none"
            style={{
              left: `${user.x}vw`,
              top: `${user.y}vh`,
              zIndex: 9000,
              transition: 'left 0.1s linear, top 0.1s linear',
              mixBlendMode: 'difference'
            }}
          >
            {/* Main Diamond Cursor */}
            <div 
              style={{ 
                width: 10, 
                height: 10, 
                backgroundColor: user.color,
                transform: 'rotate(45deg)',
                marginLeft: -5,
                marginTop: -5
              }} 
            />
            
            {/* Name Tag */}
            <div 
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: user.color,
                marginTop: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}
            >
              {user.name}
            </div>

            {/* Typing Indicator */}
            {user.isTyping && (
              <div
                style={{
                  position: 'absolute',
                  top: -24,
                  left: 10,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  backgroundColor: 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  padding: '2px 6px',
                  whiteSpace: 'nowrap'
                }}
              >
                typing...
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
};

export default GhostCursors;
