import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'shield-a11y';
const DEFAULT = {
  textSize: 'default',
  reduceMotion: false,
  highContrast: false,
  underlineLinks: false,
  readableFont: false,
  increasedLineHeight: false,
  grayscale: false,
  largeTargets: false,
};

function getStored() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return { ...DEFAULT, ...JSON.parse(s) };
  } catch (_) {}
  return DEFAULT;
}

function applyPreferences(prefs) {
  const root = document.documentElement;
  root.classList.remove('a11y-text-sm', 'a11y-text-default', 'a11y-text-lg', 'a11y-text-xl');
  root.classList.add('a11y-text-' + (prefs.textSize || 'default'));
  if (prefs.reduceMotion) root.classList.add('a11y-reduce-motion'); else root.classList.remove('a11y-reduce-motion');
  if (prefs.highContrast) root.classList.add('a11y-high-contrast'); else root.classList.remove('a11y-high-contrast');
  if (prefs.underlineLinks) root.classList.add('a11y-links-underline'); else root.classList.remove('a11y-links-underline');
  if (prefs.readableFont) root.classList.add('a11y-readable-font'); else root.classList.remove('a11y-readable-font');
  if (prefs.increasedLineHeight) root.classList.add('a11y-line-height-lg'); else root.classList.remove('a11y-line-height-lg');
  if (prefs.grayscale) root.classList.add('a11y-grayscale'); else root.classList.remove('a11y-grayscale');
  if (prefs.largeTargets) root.classList.add('a11y-large-targets'); else root.classList.remove('a11y-large-targets');
}

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(getStored);

  useEffect(() => {
    applyPreferences(prefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (_) {}
  }, [prefs]);

  const set = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));
  const reset = () => {
    setPrefs(DEFAULT);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <div
          className="bg-surface-800 border border-surface-700 rounded-2xl shadow-card-hover p-4 w-64 text-left"
          role="dialog"
          aria-label="Accessibility options"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-display font-semibold text-neutral-100 text-sm">Accessibility</span>
            <button type="button" onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-200 p-1" aria-label="Close">×</button>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-neutral-400 mb-1.5">Text size</p>
              <div className="flex gap-1">
                {['sm', 'default', 'lg', 'xl'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => set('textSize', size)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${prefs.textSize === size ? 'bg-accent text-black border-accent' : 'border-surface-600 text-neutral-300 hover:border-surface-500'}`}
                    title={size === 'sm' ? 'Decrease text size' : size === 'default' ? 'Default text size' : size === 'lg' ? 'Increase text size' : 'Largest text'}
                  >
                    {size === 'sm' ? 'A−' : size === 'default' ? 'A' : size === 'lg' ? 'A+' : 'A++'}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={prefs.reduceMotion} onChange={(e) => set('reduceMotion', e.target.checked)} className="rounded border-surface-600" />
              <span className="text-neutral-300">Reduce motion</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={prefs.highContrast} onChange={(e) => set('highContrast', e.target.checked)} className="rounded border-surface-600" />
              <span className="text-neutral-300">High contrast</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={prefs.underlineLinks} onChange={(e) => set('underlineLinks', e.target.checked)} className="rounded border-surface-600" />
              <span className="text-neutral-300">Underline links</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={prefs.readableFont} onChange={(e) => set('readableFont', e.target.checked)} className="rounded border-surface-600" />
              <span className="text-neutral-300">Readable font</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={prefs.increasedLineHeight} onChange={(e) => set('increasedLineHeight', e.target.checked)} className="rounded border-surface-600" />
              <span className="text-neutral-300">Increased line spacing</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={prefs.largeTargets} onChange={(e) => set('largeTargets', e.target.checked)} className="rounded border-surface-600" />
              <span className="text-neutral-300">Larger tap targets</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={prefs.grayscale} onChange={(e) => set('grayscale', e.target.checked)} className="rounded border-surface-600" />
              <span className="text-neutral-300">Grayscale mode</span>
            </label>
            <button type="button" onClick={reset} className="w-full py-1.5 text-neutral-400 hover:text-accent text-xs transition-colors">
              Reset all
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-accent text-black flex items-center justify-center shadow-lg hover:bg-accent-light transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-950"
        aria-label="Accessibility options"
        title="Accessibility"
      >
        <span className="text-lg" aria-hidden>♿</span>
      </button>
    </div>
  );
}
