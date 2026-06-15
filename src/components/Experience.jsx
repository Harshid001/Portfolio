import { motion } from 'framer-motion';
import SectionPresence from './SectionPresence';

const experiences = [
  { year: "2023", title: "Learning Full Stack Development", description: "Started my journey with HTML, CSS, and JavaScript. Explored the fundamentals of web architecture and responsive design." },
  { year: "2024", title: "Building Real-World Projects", description: "Developed several projects including StudyBuddy and Diwali clones. Mastered React.js and started working with Node.js and MongoDB." },
  { year: "2024", title: "Debugging & Performance Optimization", description: "Focused on writing clean, efficient code and optimizing web performance. Learned advanced state management and API integration." },
  { year: "2025", title: "Open to Opportunities", description: "Currently looking for internships, freelance projects, and full-time roles to apply my skills and grow as a developer." }
];

const Experience = () => {
  return (
    <section id="experience" className="py-24 relative border-t-2" style={{ backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-ink)' }}>
      <SectionPresence sectionId="experience" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} className="mb-20">
          <span className="section-label mb-4 block">04 / MY JOURNEY</span>
          <h2 style={{ fontSize: 'clamp(32px, 10vw, 80px)', lineHeight: 0.9 }}>
            EXPERIENCE<br/>& GROWTH
          </h2>
        </motion.div>

        <div className="relative max-w-3xl pl-8 sm:pl-12 md:pl-16">
          {/* Vertical Line */}
          <motion.div 
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute left-[7px] top-0 bottom-0"
            style={{ width: '2px', backgroundColor: 'var(--color-ink)', transformOrigin: 'top' }} 
          />

          <div className="space-y-16">
            {experiences.map((exp, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -40 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }} 
                className="relative"
              >
                {/* Node */}
                <div 
                  className="absolute -left-8 sm:-left-12 md:-left-16 top-1 z-10 transition-colors cursor-none"
                  style={{ 
                    width: '16px', height: '16px', 
                    backgroundColor: 'var(--color-ink)', 
                    border: '2px solid var(--color-ink)',
                    marginLeft: '-1px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-red)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-ink)'}
                />

                <div 
                  className="brutal-card p-6 cursor-none transition-all duration-150"
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span 
                    className="inline-block mb-4 tag" 
                    style={{ backgroundColor: 'transparent', color: 'var(--color-ink)' }}
                  >
                    {exp.year}
                  </span>
                  <h3 className="mb-3" style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '18px', color: 'var(--color-ink)' }}>
                    {exp.title}
                  </h3>
                  <p style={{ color: 'var(--color-ink-2)', fontSize: '14px', lineHeight: 1.6 }}>
                    {exp.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
