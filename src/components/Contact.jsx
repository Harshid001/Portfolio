import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';

import ScrambleText from './motion/ScrambleText';
import RevealText from './motion/RevealText';
import {
  blurSlideIn,
  reducedVariants,
  EASE_WIPE,
} from '../lib/motionVariants';

const MotionDiv = motion.div;

const socials = [
  { name: 'GitHub', link: 'https://github.com/Harshid001' },
  {
    name: 'LinkedIn',
    link: 'https://www.linkedin.com/in/harshid-soni-441500385/',
  },
  { name: 'YouTube', link: 'https://www.youtube.com/@Harshid001' },
  { name: 'Twitter', link: 'https://x.com/HarshidSoni2007' },
];

const initialFormData = { name: '', email: '', message: '' };
const initialStatus = { type: 'idle', message: '' };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = ({ name, email, message }) => {
  if (!name || !email || !message) return 'Please fill in all fields.';
  if (name.length < 2) return 'Please enter a valid name.';
  if (!emailPattern.test(email)) return 'Please enter a valid email address.';
  if (message.length < 10)
    return 'Please enter a message with at least 10 characters.';
  return '';
};

// Hoisted out of the component: it depends on nothing stateful, so rebuilding
// it on every keystroke was pure waste.
const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: 'var(--color-paper)',
  border: '2px solid var(--color-ink)',
  color: 'var(--color-ink)',
  fontFamily: 'var(--font-body)',
  fontSize: '16px',
  outline: 'none',
  // display:block keeps the control blockified now that it sits inside a
  // relative wrapper rather than directly in the flex column - without it an
  // inline baseline gap would add a few px of height.
  display: 'block',
};

const labelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '0.1em',
  color: 'var(--color-ink-2)',
};

/**
 * One labelled control (input or textarea).
 *
 * The focus affordance is a 4px bar that scales in over the existing 2px
 * border, reproducing the old "border grows to 6px" look exactly - but as a
 * transform instead of an animated border-width + padding pair, so focusing a
 * field no longer triggers layout.
 */
const Field = ({
  label,
  name,
  type = 'text',
  textarea = false,
  value,
  onChange,
  disabled,
  reduced,
  invalid,
  describedBy,
  inputRef,
}) => {
  const [focused, setFocused] = useState(false);
  const id = `contact-${name}`;
  const Tag = textarea ? 'textarea' : 'input';

  return (
    <motion.div
      className="flex flex-col gap-2"
      variants={reduced ? reducedVariants : blurSlideIn}
    >
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Tag
          id={id}
          ref={inputRef}
          name={name}
          type={textarea ? undefined : type}
          rows={textarea ? 6 : undefined}
          required
          disabled={disabled}
          value={value}
          onChange={onChange}
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={describedBy}
          style={textarea ? { ...inputStyle, resize: 'none' } : inputStyle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <motion.span
          aria-hidden
          initial={false}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.15, ease: EASE_WIPE }}
          style={{
            position: 'absolute',
            left: 2,
            top: 2,
            bottom: 2,
            width: 4,
            backgroundColor: 'var(--color-ink)',
            transformOrigin: 'left',
            pointerEvents: 'none',
          }}
        />
      </div>
    </motion.div>
  );
};

/**
 * Social row. Mirrors the hackathon participation rows: a left bar wipes in on
 * hover, the label nudges across, and the arrow travels. Colours are the same
 * inversion the original used.
 */
const SocialLink = ({ social, reduced }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={social.link}
      target="_blank"
      rel="noreferrer"
      className="flex justify-between items-center py-4 transition-colors px-2"
      variants={reduced ? reducedVariants : blurSlideIn}
      style={{
        borderBottom: '1px solid var(--color-ink-3)',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        fontWeight: 'bold',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        setHovered(true);
        e.currentTarget.style.backgroundColor = 'var(--color-ink)';
        e.currentTarget.style.color = 'var(--color-paper)';
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--color-ink)';
      }}
    >
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleX: hovered && !reduced ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: 'currentColor',
          transformOrigin: 'left',
          pointerEvents: 'none',
        }}
      />
      <motion.span
        animate={{ x: hovered && !reduced ? 8 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        {social.name}
      </motion.span>
      <motion.span
        animate={{ x: hovered && !reduced ? 6 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        -&gt;
      </motion.span>
    </motion.a>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  const reduced = useReducedMotion();

  // Header boot sequence fires once, just before the column is centred.
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-20%' });

  // Focus target for screen readers once a submit resolves.
  const statusRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    if (status.type === 'sent' || status.type === 'error') {
      statusRef.current?.focus();
    }
  }, [status.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
    };

    const validationError = validateForm(payload);
    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'sending', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send message.');
      }

      setFormData(initialFormData);
      setStatus({ type: 'sent', message: 'Message sent successfully!' });
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to send message.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (status.type !== 'idle') setStatus(initialStatus);
  };

  const hasError = status.type === 'error';
  const bannerShown = status.type === 'sent' || hasError;

  return (
    <section
      id="contact"
      className="py-24 relative border-t-2"
      style={{
        backgroundColor: 'var(--color-paper-2)',
        borderColor: 'var(--color-ink)',
        overflow: 'hidden',
      }}
    >
      {/* ── AMBIENT LAYER (matches the hackathons section) ── */}
      {!reduced && (
        <>
          <motion.div
            aria-hidden
            animate={{ backgroundPosition: ['0px 0px', '128px 96px'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              opacity: 0.03,
              backgroundImage:
                'radial-gradient(var(--color-ink) 1px, transparent 1px)',
              backgroundSize: '3px 3px',
            }}
          />
          <motion.div
            aria-hidden
            animate={{ y: ['0%', '100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 1,
              zIndex: 0,
              pointerEvents: 'none',
              opacity: 0.06,
              backgroundColor: 'var(--color-ink)',
            }}
          />
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <MotionDiv
            ref={headerRef}
            initial="hidden"
            animate={headerInView ? 'visible' : 'hidden'}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <span className="section-label mb-4 block">
              <ScrambleText
                text="07 / GET IN TOUCH"
                active={headerInView}
                reduced={reduced}
                duration={700}
              />
              {!reduced && (
                <motion.span
                  aria-hidden
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    times: [0, 0.5, 0.5, 1],
                  }}
                  style={{ marginLeft: '2px' }}
                >
                  ▌
                </motion.span>
              )}
            </span>
            {/* Masked word-by-word wipe, staggered 120ms - same treatment as
                BATTLE / TESTED so the two sections rhyme. */}
            <h2
              className="mb-8"
              style={{ fontSize: 'clamp(36px, 10vw, 100px)', lineHeight: 0.9 }}
            >
              <RevealText reduced={reduced}>LET&apos;S</RevealText>
              <RevealText reduced={reduced} delay={0.12}>
                CONNECT
              </RevealText>
            </h2>
            <motion.p
              className="text-[17px] mb-12 max-w-md"
              style={{ color: 'var(--color-ink-2)', lineHeight: 1.8 }}
              variants={reduced ? reducedVariants : blurSlideIn}
            >
              Open for opportunities, freelance projects, or just a chat. Don&apos;t
              hesitate to reach out.
            </motion.p>

            <div
              className="flex flex-col border-t-2"
              style={{ borderColor: 'var(--color-ink)' }}
            >
              {socials.map((social, i) => (
                <SocialLink key={i} social={social} reduced={reduced} />
              ))}
            </div>
          </MotionDiv>

          <MotionDiv
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-10 relative"
              style={{
                backgroundColor: 'var(--color-white)',
                border: '2px solid var(--color-ink)',
              }}
            >
              {/* Status banners share one AnimatePresence so a success can
                  cross-fade straight into an error without a layout jump. */}
              <AnimatePresence>
                {status.type === 'sent' && (
                  <motion.div
                    key="sent"
                    ref={statusRef}
                    tabIndex={-1}
                    role="status"
                    aria-live="polite"
                    className="absolute top-0 left-0 w-full p-4 text-center z-10"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: EASE_WIPE }}
                    style={{
                      backgroundColor: 'var(--color-ink)',
                      color: 'var(--color-paper)',
                      outline: 'none',
                    }}
                  >
                    {status.message}
                  </motion.div>
                )}
                {status.type === 'error' && (
                  <motion.div
                    key="error"
                    ref={statusRef}
                    tabIndex={-1}
                    role="alert"
                    id="contact-error"
                    className="absolute top-0 left-0 w-full p-4 text-center z-10"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: EASE_WIPE }}
                    style={{
                      backgroundColor: '#ffcccc',
                      color: '#cc0000',
                      borderBottom: '2px solid #cc0000',
                      outline: 'none',
                    }}
                  >
                    <strong>Error: </strong> {status.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className={`space-y-6 ${status.type !== 'idle' && status.type !== 'sending' ? 'mt-8' : ''}`}
              >
                <Field
                  label="NAME"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  reduced={reduced}
                  invalid={hasError}
                  describedBy={hasError ? 'contact-error' : undefined}
                  inputRef={nameRef}
                />
                <Field
                  label="EMAIL"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  reduced={reduced}
                  invalid={hasError}
                  describedBy={hasError ? 'contact-error' : undefined}
                />
                <Field
                  label="MESSAGE"
                  name="message"
                  textarea
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  reduced={reduced}
                  invalid={hasError}
                  describedBy={hasError ? 'contact-error' : undefined}
                />

                <motion.div
                  className="pt-4 mt-8 flex"
                  style={{ borderTop: '2px solid var(--color-ink)' }}
                  variants={reduced ? reducedVariants : blurSlideIn}
                >
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className={`w-full flex items-center justify-center gap-3 transition-colors ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'btn-primary'}`}
                    whileHover={reduced || isSubmitting ? undefined : { y: -2 }}
                    whileTap={reduced || isSubmitting ? undefined : { scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                      padding: '16px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 'bold',
                      border: '2px solid var(--color-ink)',
                      borderColor:
                        status.type === 'sent'
                          ? 'var(--color-red)'
                          : 'var(--color-ink)',
                      color:
                        status.type === 'sent'
                          ? 'var(--color-red)'
                          : 'var(--color-paper)',
                      backgroundColor:
                        status.type === 'sent'
                          ? 'var(--color-paper)'
                          : 'var(--color-ink)',
                    }}
                  >
                    {isSubmitting && (
                      <svg
                        className="animate-spin h-5 w-5 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    {status.type === 'sending'
                      ? 'SENDING...'
                      : status.type === 'sent'
                        ? 'SENT!'
                        : 'SEND MESSAGE'}
                  </motion.button>
                </motion.div>
              </div>
            </form>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
};

export default Contact;
