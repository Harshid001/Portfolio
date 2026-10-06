# Harshid Soni — Developer Portfolio

Personal portfolio website showcasing web applications, interactive UI engineering, and full-stack projects built by Harshid Soni, a Computer Science student at Swaminarayan University.

Live deployment: [https://harshidsoniportfolio.vercel.app/](https://harshidsoniportfolio.vercel.app/)

## Tech Stack

- **Frontend Core**: React 19, React Router 7, Vite 8
- **Styling**: Tailwind CSS v4, Vanilla CSS tokens (Neo-Brutalist design system)
- **Animation & 3D**: Framer Motion, GSAP (ScrollTrigger), Three.js, Lenis Smooth Scroll
- **Icons**: React Icons (FontAwesome, DevIcons, Simple Icons, Feather)
- **Backend / API**: Vercel Serverless Function, Node.js, Nodemailer

## Key Features

- **Direct Accessibility & Deep Linking**: Unconditional mounting for fast first paint, instant fragment navigation (`#projects`, `#about`, `#skills`), and search crawler indexing.
- **Accessible Interactions**: WCAG 2.2 AA compliant contrast, global visible focus rings (`:focus-visible`), keyboard skip-to-content link, accessible mobile modal drawer with focus trapping, and screen-reader announcements.
- **Motion Accessibility**: Built-in support for `prefers-reduced-motion`, automatically bypassing heavy WebGL render loops and physics animations for users who prefer reduced movement.
- **Responsive Architecture**: Fluid type clamps, content-visibility optimization, and tailored mobile layouts.
- **Secure Contact Pipeline**: Serverless inquiry handler with HTML entity escaping, payload size bounds (25KB), and error sanitization.

## Project Structure

```text
├── api/                    # Serverless backend functions (Vercel contact endpoint)
├── public/                 # Static assets, sitemap.xml, robots.txt, manifest
├── src/
│   ├── assets/             # Optimized WebP and PNG imagery
│   ├── components/         # Reusable and section components
│   │   ├── motion/         # Framer Motion text reveal & magnetic primitives
│   │   ├── projects/       # Project showcase, preview, and category selection
│   │   └── transition/     # Grid transitions and viewport utilities
│   ├── hooks/              # Custom React hooks (useTheme, useIsMobile, useInView)
│   ├── lib/                # Shared utilities and email sanitation
│   ├── App.jsx             # Root application and route configuration
│   ├── MainPortfolio.jsx   # Section composition
│   └── index.css           # Design tokens, base layer, and utilities
└── vite.config.js          # Vite toolchain configuration and dev API middleware
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
git clone https://github.com/Harshid001/Portfolio.git
cd Portfolio
npm install
```

### Development

```bash
npm run dev
```

Runs the application locally at `http://localhost:5173`. Includes local contact endpoint middleware.

### Linting & Quality Checks

```bash
# Run ESLint across active source files
npm run lint

# Automatically fix linting issues
npm run lint:fix

# Run test verification (lint + production build)
npm test
```

### Production Build

```bash
npm run build
npm run preview
```

Emits the production distribution bundle to `dist/`.

## Environment Variables

For the contact form to dispatch real emails via Gmail SMTP, configure the following in `.env.local` (or your hosting provider's dashboard):

```env
EMAIL_USER=harshidsoni01@gmail.com
EMAIL_PASS=your_gmail_16_digit_app_password
```

## Contact

- **Email**: [harshidsoni01@gmail.com](mailto:harshidsoni01@gmail.com)
- **LinkedIn**: [linkedin.com/in/harshid-soni-441500385/](https://www.linkedin.com/in/harshid-soni-441500385/)
- **GitHub**: [github.com/Harshid001](https://github.com/Harshid001)
