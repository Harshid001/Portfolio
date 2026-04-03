import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin, FaYoutube, FaTwitter } from 'react-icons/fa';
import SectionPresence from './SectionPresence';

const socials = [
  { name: "GitHub", link: "https://github.com/Harshid001" },
  { name: "LinkedIn", link: "https://www.linkedin.com/in/harshid-soni-441500385/" },
  { name: "YouTube", link: "https://www.youtube.com/@Harshid001" },
  { name: "Twitter", link: "https://x.com/HarshidSoni2007" }
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("sending");
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus("sent");
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus("idle"), 3000);
    }, 1200);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
            <span className="section-label mb-4 block">05 / GET IN TOUCH</span>
            <h2 className="mb-8" style={{ fontSize: 'clamp(48px, 10vw, 100px)', lineHeight: 0.9 }}>
              LET'S<br/>CONNECT
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
                  <span>↗</span>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: 0.2 }}>
            <form onSubmit={handleSubmit} className="p-10" style={{ backgroundColor: 'var(--color-white)', border: '2px solid var(--color-ink)' }}>
              <div className="space-y-6">
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
                    className="w-full btn-primary cursor-none transition-colors"
                    style={{ 
                      borderColor: status === "sent" ? 'var(--color-red)' : 'var(--color-ink)',
                      color: status === "sent" ? 'var(--color-red)' : 'var(--color-paper)',
                      backgroundColor: status === "sent" ? 'var(--color-paper)' : 'var(--color-ink)'
                    }}
                  >
                    {status === "idle" && "SEND MESSAGE"}
                    {status === "sending" && "SENDING..."}
                    {status === "sent" && "SENT \u2713"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
