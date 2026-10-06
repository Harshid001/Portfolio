import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section
      className="min-h-[70vh] flex items-center justify-center py-20 px-6 text-center"
      style={{
        backgroundColor: 'var(--color-paper)',
        color: 'var(--color-ink)',
      }}
    >
      <div
        className="max-w-lg w-full p-8 sm:p-12"
        style={{
          backgroundColor: 'var(--color-paper-2)',
          border: '2px solid var(--color-ink)',
          boxShadow: '8px 8px 0px var(--color-ink)',
        }}
      >
        <span
          className="text-xs font-mono tracking-widest uppercase block mb-3"
          style={{ color: 'var(--color-ink-3)' }}
        >
          404 / NOT FOUND
        </span>
        <h1
          className="text-4xl sm:text-5xl font-black mb-4"
          style={{ fontFamily: 'var(--font-heading)', lineHeight: 1 }}
        >
          PAGE NOT FOUND
        </h1>
        <p
          className="text-base mb-8 max-w-sm mx-auto"
          style={{ color: 'var(--color-ink-2)', lineHeight: 1.6 }}
        >
          The page or case study you requested does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center justify-center"
        >
          ← Return to Portfolio
        </Link>
      </div>
    </section>
  );
}
