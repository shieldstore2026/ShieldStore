import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MESSAGES = [
  '🔥 Free Fire diamonds — best rates in RS. Shop now!',
  '🎫 Weekly & Monthly subscriptions available. Instant delivery.',
  '✨ New arrivals in Fashion. Hoodies & T-Shirts.',
  '🛡 The Shield Store — your trusted top-up partner.',
];

const LINKS = ['/products?category=free-fire-diamonds', '/products?category=free-fire-subscriptions', '/products?category=fashion', '/'];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-gradient-to-r from-accent via-amber-400 to-accent text-black py-2 overflow-hidden border-b border-black/10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]">
      <div className="relative flex">
        <Link
          to={LINKS[index]}
          className="flex items-center justify-center w-full text-sm font-medium hover:underline focus:outline-none focus:underline animate-fade-in min-h-[36px]"
          key={index}
        >
          {MESSAGES[index]}
        </Link>
      </div>
    </div>
  );
}
