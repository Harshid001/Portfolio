import { useCollab } from '../context/CollabContext';

const LiveBar = () => {
  const { activeViewers } = useCollab();

  return (
    <div 
      className="fixed bottom-0 left-0 z-[8000]"
      style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-paper)',
        borderTop: '2px solid var(--color-ink)',
        borderRight: '2px solid var(--color-ink)',
        padding: '8px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <div 
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: 'var(--color-red)',
          borderRadius: '50%',
          animation: 'pulse-dot 1.5s infinite'
        }}
      />
      <span>LIVE</span>
      <span style={{ color: 'var(--color-ink-3)' }}>—</span>
      <span>{activeViewers} viewing this page</span>
    </div>
  );
};

export default LiveBar;
