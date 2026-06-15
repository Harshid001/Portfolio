'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionPresence from './SectionPresence';

const MotionDiv = motion.div;

const socials = [
  { name: "GitHub", link: "https://github.com/Harshid001" },
  { name: "LinkedIn", link: "https://www.linkedin.com/in/harshid-soni-441500385/" },
  { name: "YouTube", link: "https://www.youtube.com/@Harshid001" },
  { name: "Twitter", link: "https://x.com/HarshidSoni2007" }
];

const initialFormData = { name: '', email: '', message: '' };
const initialStatus = { type: "idle", message: "" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = ({ name, email, message }) => {
  if (!name || !email || !message) return "Please fill in all fields.";
  if (name.length < 2) return "Please enter a valid name.";
  if (!emailPattern.test(email)) return "Please enter a valid email address.";
  if (message.length < 10) return "Please enter a message with at least 10 characters.";
  return "";
};

const Contact = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[Frontend] Form submission initiated.');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim()
    };

    const validationError = validateForm(payload);
    if (validationError) {
      console.warn('[Frontend] Form validation failed:', validationError);
      setStatus({ type: "error", message: validationError });
      return;
    }

    console.log('[Frontend] Form validation passed. Payload:', payload);
    setIsSubmitting(true);
    setStatus({ type: "sending", message: "" });

    try {
      console.log('[Frontend] Sending fetch request to /api/contact...');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('[Frontend] Received response with status:', response.status);
      const result = await response.json().catch(() => ({}));
      console.log('[Frontend] Response body parsed:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message.");
      }

      console.log('[Frontend] Message successfully sent!');
      setFormData(initialFormData);
      setStatus({ type: "sent", message: "Message sent successfully!" });
    } catch (error) {
      console.error('[Frontend] Error caught during form submission:', error);
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send message."
      });
    } finally {
      setIsSubmitting(false);
      console.log('[Frontend] Form submission process completed.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (status.type !== "idle") setStatus(initialStatus);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--color-paper)',
    border: '2px solid var(--color-ink)',
    color: 'var(--color-ink)',
    fontFamily: 'var(--font-body)',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-left-width 0.15s, padding-left 0.15s'
  };

  return (
    <section id="contact" className="py-24 relative border-t-2" style={{ backgroundColor: 'var(--color-paper-2)', borderColor: 'var(--color-ink)' }}>
      <SectionPresence sectionId="contact" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <MotionDiv initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
            <span className="section-label mb-4 block">07 / GET IN TOUCH</span>
            <h2 className="mb-8" style={{ fontSize: 'clamp(36px, 10vw, 100px)', lineHeight: 0.9 }}>
              LET'S<br />CONNECT
            </h2>
            <p className="text-[17px] mb-12 max-w-md" style={{ color: 'var(--color-ink-2)', lineHeight: 1.8 }}>
              Open for opportunities, freelance projects, or just a chat. Don't hesitate to reach out.
            </p>

            <div className="flex flex-col border-t-2" style={{ borderColor: 'var(--color-ink)' }}>
              {socials.map((social, i) => (
                <a
                  key={i}
                  href={social.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex justify-between items-center py-4 cursor-none transition-colors px-2"
                  style={{ borderBottom: '1px solid var(--color-ink-3)', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 'bold' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-ink)'; e.currentTarget.style.color = 'var(--color-paper)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-ink)'; }}
                >
                  <span>{social.name}</span>
                  <span>-&gt;</span>
                </a>
              ))}
            </div>
          </MotionDiv>

          <MotionDiv initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: 0.2 }}>
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 relative" style={{ backgroundColor: 'var(--color-white)', border: '2px solid var(--color-ink)' }}>
              {status.type === "sent" && (
                <div className="absolute top-0 left-0 w-full p-4 text-center z-10" style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)' }}>
                  {status.message}
                </div>
              )}
              {status.type === "error" && (
                <div className="absolute top-0 left-0 w-full p-4 text-center z-10" style={{ backgroundColor: '#ffcccc', color: '#cc0000', borderBottom: '2px solid #cc0000' }}>
                  <strong>Error: </strong> {status.message}
                </div>
              )}

              <div className={`space-y-6 ${status.type !== 'idle' && status.type !== 'sending' ? 'mt-8' : ''}`}>
                {[
                  { label: "NAME", name: "name", type: "text" },
                  { label: "EMAIL", name: "email", type: "email" }
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--color-ink-2)' }}>{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      required
                      disabled={isSubmitting}
                      value={formData[field.name]}
                      onChange={handleChange}
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderLeftWidth = '6px'; e.target.style.paddingLeft = '12px'; }}
                      onBlur={(e) => { e.target.style.borderLeftWidth = '2px'; e.target.style.paddingLeft = '16px'; }}
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-2">
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--color-ink-2)' }}>MESSAGE</label>
                  <textarea
                    name="message"
                    required
                    rows="6"
                    disabled={isSubmitting}
                    value={formData.message}
                    onChange={handleChange}
                    style={{ ...inputStyle, resize: 'none' }}
                    onFocus={(e) => { e.target.style.borderLeftWidth = '6px'; e.target.style.paddingLeft = '12px'; }}
                    onBlur={(e) => { e.target.style.borderLeftWidth = '2px'; e.target.style.paddingLeft = '16px'; }}
                  />
                </div>

                <div className="pt-4 mt-8 flex" style={{ borderTop: '2px solid var(--color-ink)' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className={`w-full flex items-center justify-center gap-3 transition-colors ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-none btn-primary'}`}
                    style={{
                      padding: '16px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 'bold',
                      border: '2px solid var(--color-ink)',
                      borderColor: status.type === "sent" ? 'var(--color-red)' : 'var(--color-ink)',
                      color: status.type === "sent" ? 'var(--color-red)' : 'var(--color-paper)',
                      backgroundColor: status.type === "sent" ? 'var(--color-paper)' : 'var(--color-ink)'
                    }}
                  >
                    {isSubmitting && (
                      <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {status.type === "sending" ? "SENDING..." : status.type === "sent" ? "SENT!" : "SEND MESSAGE"}
                  </button>
                </div>
              </div>
            </form>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
};

export default Contact;
