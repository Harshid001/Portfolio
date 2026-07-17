import React from 'react';

/**
 * GrainText Component
 * 
 * Generates a premium, cinematic grain overlay strictly inside text.
 * - Uses a static SVG noise data URI mapped as a background image.
 * - Animates background-position via CSS for highly performant, GPU-accelerated drift.
 * - Uses background-clip: text and mix-blend-difference to overlay the grain seamlessly
 *   without affecting readability or causing visual artifacts.
 */
const GrainText = ({ children, className = '', style = {}, as: Component = 'span' }) => {
  return (
    <Component className={`relative inline-block ${className}`} style={{ ...style, position: 'relative' }}>
      
      {/* 
        1. Base Readable Text
        This is the actual text the user reads. It remains perfectly sharp and fully legible.
      */}
      <span className="relative z-10 block">{children}</span>

      {/* 
        2. Grain Overlay
        This layer sits exactly on top of the text.
        It uses background-clip: text so the noise pattern ONLY renders where the text glyphs are.
        mix-blend-difference applies a very subtle 3-5% texture to the underlying text.
        aria-hidden="true" ensures screen readers don't read the text twice.
      */}
      <span 
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none select-none mix-blend-difference opacity-[0.05] animate-grain-drift block"
        style={{
          /* Make the text color transparent so only the background shows */
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          
          /* 
            Premium SVG Noise Texture
            Using a fractalNoise turbulence filter to generate high-density, small particle noise.
            It's base64/URL encoded here to avoid extra HTTP requests.
          */
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          
          /* Ensure the noise tiles seamlessly */
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      >
        {children}
      </span>
    </Component>
  );
};

export default GrainText;
