import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-display text-6xl font-bold text-accent mb-2">404</h1>
      <p className="text-neutral-400 text-lg mb-6">Page not found.</p>
      <Link to="/" className="px-6 py-3 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors">
        Back to home
      </Link>
    </div>
  );
}
