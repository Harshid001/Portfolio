import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for managing all head tags using react-helmet-async
 * 
 * @param {string} title - The page title (under 60 characters for best SEO)
 * @param {string} description - The page description (150-160 characters)
 * @param {string} path - The current page path (e.g., '/about') to generate the canonical URL
 */
const SEO = ({ 
  title = "Harsh Soni | Full Stack Developer", 
  description = "Full Stack Developer specializing in React, Node.js, Express, MongoDB, and modern web technologies. Explore my projects, skills, resume, and achievements.", 
  path = "" 
}) => {
  const baseUrl = "https://harshidsoniportfolio.vercel.app";
  const currentUrl = `${baseUrl}${path}`;
  
  const author = "Harsh Soni";
  const keywords = "Harsh Soni, Full Stack Developer, React, Tailwind CSS, Node.js, Express.js, MongoDB, C++, Python, SQL, Portfolio, Web Developer, Programmer";

  // 12. Structured data (JSON-LD Person and WebSite schema)
  const structuredData = [
    {
      "@context": "https://schema.org/",
      "@type": "Person",
      "name": "Harsh Soni",
      "url": baseUrl,
      "jobTitle": "Full Stack Developer",
      "knowsAbout": [
        "React", 
        "JavaScript", 
        "Tailwind CSS", 
        "Node.js", 
        "Express.js", 
        "MongoDB", 
        "C++", 
        "Python", 
        "SQL"
      ],
      "sameAs": [
        "https://github.com/Harshid001"
      ]
    },
    {
      "@context": "https://schema.org/",
      "@type": "WebSite",
      "name": "Harsh Soni Portfolio",
      "url": baseUrl,
      "description": "Portfolio of Harsh Soni, a Full Stack Developer.",
      "author": {
        "@type": "Person",
        "name": "Harsh Soni"
      }
    }
  ];

  return (
    <Helmet>
      {/* 11. Language */}
      <html lang="en" />

      {/* 1. SEO title & 14. Dynamic title support */}
      <title>{title}</title>

      {/* 2. Meta description */}
      <meta name="description" content={description} />

      {/* 3. Keywords */}
      <meta name="keywords" content={keywords} />

      {/* 4. Author */}
      <meta name="author" content={author} />

      {/* 5. Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* 6. Robots tag */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* 9. Theme color (Adjust to match your Tailwind theme) */}
      <meta name="theme-color" content="#0f172a" />

      {/* 10. Favicon (Assumes you have a favicon.ico or logo in your public folder) */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />

      {/* 7. Open Graph tags (Facebook, LinkedIn, Discord) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="Harsh Soni - Portfolio" />
      {/* Add an og-image.png to your public folder for this to work */}
      <meta property="og:image" content={`${baseUrl}/og-image.png`} /> 
      <meta property="og:image:alt" content="Harsh Soni Portfolio Preview" />

      {/* 8. Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}/og-image.png`} />

      {/* 12. Structured data injection */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
