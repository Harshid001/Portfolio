import React from 'react';

const FontExample = () => {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 bg-paper border-[3px] border-ink my-12 shadow-[8px_8px_0px_var(--color-ink)]">
      <div>
        <h2 className="font-heading text-4xl mb-2 tracking-wide font-bold uppercase">
          Poppins Heading Usage
        </h2>
        <p className="font-body text-lg leading-relaxed text-ink-2 font-normal">
          This paragraph uses <strong>Inter</strong>, the body font. It's designed to be highly readable across all screen sizes. This setup provides a clean, scalable, and professional typography system that fits perfectly with a full stack developer portfolio.
        </p>
      </div>

      <div className="bg-ink text-paper p-6">
        <h3 className="font-heading text-xl mb-4 font-semibold tracking-wide">
          Code Integration Block
        </h3>
        <p className="font-body text-sm mb-4 opacity-90">
          This section uses <strong>Fira Code</strong> to showcase monospace elements correctly.
        </p>
        <pre className="bg-ink-2 text-paper p-4 overflow-x-auto">
          <code className="font-code text-sm">
{`function setupFonts() {
  const heading = "Poppins";
  const body = "Inter";
  const code = "Fira Code";
  
  return { heading, body, code };
}`}
          </code>
        </pre>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t-2 border-ink pt-6">
        <div>
          <span className="font-heading font-bold block mb-1">Heading (Poppins)</span>
          <span className="text-sm font-body text-ink-2">Used for all h1-h6 tags, stylized titles, and buttons.</span>
        </div>
        <div>
          <span className="font-body font-bold block mb-1">Body (Inter)</span>
          <span className="text-sm font-body text-ink-2">Used for paragraphs, descriptions, and general text.</span>
        </div>
        <div>
          <span className="font-code font-bold block mb-1">Code (Fira Code)</span>
          <span className="text-sm font-body text-ink-2">Used for code blocks, terminal outputs, and semantic labels.</span>
        </div>
      </div>
    </div>
  );
};

export default FontExample;
