import React from 'react';

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageChooser({ label, value, onChange, helperText }) {
  const inputId = `image-chooser-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await fileToDataUrl(file);
    onChange(dataUrl);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... or choose local image below"
        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
      />
      <div className="mt-2 flex items-center gap-3">
        <input id={inputId} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <label htmlFor={inputId} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm cursor-pointer hover:bg-black transition-colors">
          Choose image
        </label>
        {value ? (
          <button type="button" onClick={() => onChange('')} className="text-sm text-rose-600 hover:underline">
            Remove
          </button>
        ) : null}
      </div>
      {helperText ? <p className="text-xs text-slate-500 mt-1">{helperText}</p> : null}
      {value ? (
        <img
          src={value}
          alt="Preview"
          className="mt-2 h-24 object-contain rounded border border-slate-200 bg-white"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
    </div>
  );
}
