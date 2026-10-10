import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChartBar, HiX, HiExternalLink } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import './CodingActivity.css';

const platforms = [
  { id: 'github', name: 'GitHub', username: 'Harshid001', url: 'https://github.com/Harshid001', unit: 'contributions', Icon: FaGithub },
  { id: 'leetcode', name: 'LeetCode', username: 'AXiXOEQxTd', url: 'https://leetcode.com/u/AXiXOEQxTd/', unit: 'submissions', Icon: SiLeetcode },
];

function Calendar({ days, unit, name }) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 364);
  const counts = new Map(days.map(({ date, count }) => [date, count]));
  const cells = Array.from({ length: 365 }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(day.getUTCDate() + index);
    const date = day.toISOString().slice(0, 10);
    return { date, count: counts.get(date) || 0, day };
  });
  const total = cells.reduce((sum, cell) => sum + cell.count, 0);
  const active = cells.filter((cell) => cell.count > 0).length;
  let streak = 0;
  let longest = 0;
  cells.forEach(({ count }) => {
    streak = count > 0 ? streak + 1 : 0;
    longest = Math.max(longest, streak);
  });
  const padding = start.getUTCDay();
  const columns = Math.ceil((padding + cells.length) / 7);
  const months = cells.filter(({ day }, index) => index === 0 || day.getUTCDate() === 1);

  return (
    <>
      <div className="activity-stats">
        <span><strong>{total.toLocaleString()}</strong> {unit} in the past year</span>
        <span>{active} active days · {longest} day max streak</span>
      </div>
      <div className="activity-calendar-scroll" tabIndex={0} role="region" aria-label={`${name} contribution calendar. Scroll horizontally to view all dates.`} data-lenis-prevent>
        <div className="activity-calendar" style={{ '--weeks': columns }}>
          <div className="activity-months">
            {months.map(({ date, day }, index) => (
              <span key={date} style={{ gridColumn: Math.floor((padding + cells.findIndex((cell) => cell.date === date)) / 7) + 1 }}>
                {index === 0 || Math.floor((padding + cells.findIndex((cell) => cell.date === date)) / 7) < columns - 1
                  ? day.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' }) : ''}
              </span>
            ))}
          </div>
          <div className="activity-cells" role="img" aria-label={`${name}: ${total} ${unit}, ${active} active days and a longest streak of ${longest} days in the past year.`}>
            {Array.from({ length: padding }, (_, index) => <span key={`pad-${index}`} className="activity-cell activity-empty" />)}
            {cells.map(({ date, count }) => (
              <span key={date} className="activity-cell" data-level={count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4} title={`${date}: ${count} ${unit}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="activity-legend" aria-hidden="true">
        Less {[0, 1, 2, 3, 4].map((level) => <span key={level} className="activity-cell" data-level={level} />)} More
      </div>
    </>
  );
}

export default function CodingActivity() {
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const opener = buttonRef.current;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    fetch('/api/activity', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load activity');
        return response.json();
      })
      .then((result) => {
        if (!result.github || !result.leetcode) throw new Error('Invalid activity response');
        setData(result);
      })
      .catch((err) => { if (err.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [isOpen, attempt]);

  const retry = () => {
    setError(false);
    setData(null);
    setAttempt((value) => value + 1);
  };

  return (
    <>
      <motion.button
        ref={buttonRef}
        className="activity-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        title="GitHub & LeetCode activity"
        aria-label="View GitHub and LeetCode contribution graphs"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="coding-activity-dialog"
      >
        <motion.div
          animate={isOpen ? { scale: [1, 1.25, 1], rotate: [0, -10, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <HiOutlineChartBar size={20} strokeWidth={1.5} aria-hidden="true" />
        </motion.div>
      </motion.button>
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="coding-activity-overlay"
                className="activity-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                onClick={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}
              >
                <motion.div
                  key="coding-activity-panel"
                  ref={dialogRef}
                  id="coding-activity-dialog"
                  role="dialog"
                  aria-modal="true"
                  className="activity-dialog"
                  aria-labelledby="coding-activity-title"
                  tabIndex={-1}
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 14 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="activity-panel" data-lenis-prevent>
                    <header className="activity-header">
                      <div>
                        <p className="activity-eyebrow">CONSISTENCY IN CODE</p>
                        <h2 id="coding-activity-title">Coding activity<span>.</span></h2>
                        <p>Building on GitHub. Problem solving on LeetCode.</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.08, rotate: 90 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ duration: 0.2 }}
                        className="activity-close"
                        autoFocus
                        onClick={() => setIsOpen(false)}
                        aria-label="Close coding activity"
                      >
                        <HiX size={24} />
                      </motion.button>
                    </header>
                    <div className="activity-cards">
                      {platforms.map(({ id, name, username, url, unit, Icon }, index) => (
                        <motion.section
                          className="activity-card"
                          key={id}
                          aria-label={`${name} activity`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 * (index + 1), duration: 0.25 }}
                        >
                          <div className="activity-card-heading">
                            <div><Icon size={25} aria-hidden="true" /><h3>{name}</h3></div>
                            <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${username} on ${name}`}>@{username} <HiExternalLink aria-hidden="true" /></a>
                          </div>
                          {data?.[id]?.days ? <Calendar days={data[id].days} unit={unit} name={name} /> : (
                            <p className="activity-status" role="status">{error || data?.[id]?.error ? 'Activity is temporarily unavailable. You can still visit the profile above.' : 'Loading contribution graph…'}</p>
                          )}
                        </motion.section>
                      ))}
                    </div>
                    <footer className="activity-footer">
                      <span>Past 365 days · UTC · Public profile activity</span>
                      {(error || data?.github?.error || data?.leetcode?.error) && (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={retry}
                        >
                          Try again
                        </motion.button>
                      )}
                    </footer>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
