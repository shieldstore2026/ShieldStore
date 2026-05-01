import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  { title: 'BOOYAH Diamond Top-Up', subtitle: 'Instant Free Fire diamonds with trusted local rates in RS.', cta: 'Buy Diamonds', to: '/products?category=free-fire-diamonds', bg: 'from-accent/20 via-surface-900 to-surface-950', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800' },
  { title: 'Elite & Weekly Passes', subtitle: 'Weekly Lite, Weekly, and Monthly memberships delivered fast.', cta: 'View passes', to: '/products?category=free-fire-subscriptions', bg: 'from-accent-dark/15 via-surface-900 to-surface-950', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800' },
  { title: 'Join Shield Squad', subtitle: 'Gear up with top deals, secure checkout, and quick order tracking.', cta: 'Shop all', to: '/products', bg: 'from-surface-800 via-surface-900 to-surface-950', img: 'https://images.unsplash.com/photo-1611791484670-ce19b801dd1c?w=800' },
];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const goTo = (i) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  const slide = slides[index];
  return (
    <section className="relative rounded-2xl overflow-hidden border border-surface-700 ring-1 ring-accent/20 shadow-accent min-h-[200px] sm:min-h-[260px] md:min-h-[300px] bg-surface-900">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={index}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
        />
      </AnimatePresence>
      {slide.img && (
        <motion.div key={`img-${index}`} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 0.25, scale: 1 }} transition={{ duration: 0.5 }} className="absolute inset-0">
          <img src={slide.img} alt="" className="w-full h-full object-cover" aria-hidden />
        </motion.div>
      )}
      <div className="relative flex items-center justify-between px-6 sm:px-10 md:px-14 py-8 md:py-12">
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={index} initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>
              <motion.h2 variants={textVariants} className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-100 tracking-tight">
                {slide.title}
              </motion.h2>
              <motion.p variants={textVariants} className="text-neutral-400 mt-1 text-sm sm:text-base">
                {slide.subtitle}
              </motion.p>
              <motion.div variants={textVariants}>
                <Link
                  to={slide.to}
                  className="inline-block mt-4 px-5 py-2.5 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light shadow-accent transition-all text-sm"
                >
                  {slide.cta}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-colors ${i === index ? 'w-6 bg-accent' : 'w-2 bg-surface-600 hover:bg-surface-500'}`}
            aria-label={`Slide ${i + 1}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={i === index ? { scaleX: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } } : {}}
          />
        ))}
      </div>
    </section>
  );
}
