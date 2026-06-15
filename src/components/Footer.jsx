import { FaGithub, FaLinkedin, FaYoutube, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="dark-section" style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)', borderTop: '3px solid var(--color-ink)' }}>
      
      {/* Marquee Strip Top */}
      <div 
        className="w-full overflow-hidden whitespace-nowrap py-3"
        style={{ 
          borderBottom: '2px solid var(--color-ink)',
          backgroundColor: 'var(--color-paper)',
          color: 'var(--color-ink-3)'
        }}
      >
        <div style={{ display: 'inline-block', animation: 'marquee 25s linear infinite' }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 4vw, 20px)', paddingRight: '12px' }}>
              AVAILABLE FOR WORK · FULL STACK DEVELOPER · REACT · NODE.JS · 
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-center border-b-2 pb-10" style={{ borderColor: 'var(--color-ink-2)' }}>
          
          {/* Left: Logo */}
          <div className="flex justify-center md:justify-start">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-paper)' }}>
              &lt;HS /&gt;
            </span>
          </div>
          
          {/* Center: Credit */}
          <div className="flex justify-center text-center">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-ink-3)', letterSpacing: '0.1em' }}>
              DESIGNED & BUILT BY HARSHID SONI
            </span>
          </div>

          {/* Right: Socials */}
          <div className="flex justify-center md:justify-end gap-3">
            {[
              { icon: <FaGithub />, link: "https://github.com/Harshid001" },
              { icon: <FaLinkedin />, link: "https://www.linkedin.com/in/harshid-soni-441500385/" },
              { icon: <FaYoutube />, link: "https://www.youtube.com/@Harshid001" },
              { icon: <FaTwitter />, link: "https://x.com/HarshidSoni2007" }
            ].map((social, i) => (
              <a 
                key={i} 
                href={social.link} 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 flex items-center justify-center text-lg cursor-none transition-colors" 
                style={{ backgroundColor: 'transparent', color: 'var(--color-paper)', border: '2px solid var(--color-paper)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-paper)'; e.currentTarget.style.color = 'var(--color-ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-paper)'; }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 pt-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', letterSpacing: '0.1em' }}>
          <span>© 2025 HARSHID SONI</span>
          <span className="mt-2 md:mt-0">ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
