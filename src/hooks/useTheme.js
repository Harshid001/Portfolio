import { useState, useEffect } from 'react';

/**
 * useTheme Hook
 * 
 * Provides reactive `isDark` boolean state tracking the presence of the `.dark`
 * class on `document.documentElement`. Efficiently uses a MutationObserver with
 * an attribute filter so theme toggling across the app responds instantly.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDark();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          checkDark();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return { isDark };
}

export default useTheme;
