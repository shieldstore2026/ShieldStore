import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerCols = [
  { title: 'Company', links: [{ to: '/about', label: 'About Shield' }, { to: '/products', label: 'Careers' }, { to: '/products', label: 'Press' }] },
  { title: 'Sell', links: [{ to: '/products', label: 'Sell on Shield' }, { to: '/products', label: 'Advertise' }] },
  { title: 'Support', links: [{ to: '/orders', label: 'Returns & Orders' }, { to: '/contact', label: 'Contact us' }, { to: '/', label: 'Help' }] },
];

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

export default function Footer() {
  return (
    <motion.footer
      className="mt-auto bg-gradient-to-b from-surface-900 to-surface-950 border-t border-surface-700/90"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
    >
      <motion.button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full py-3.5 bg-surface-800 text-neutral-400 hover:text-accent font-medium text-sm transition-colors"
        whileTap={{ scale: 0.99 }}
      >
        Back to top
      </motion.button>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {footerCols.map((col) => (
            <motion.div key={col.title} variants={item}>
              <h3 className="font-display font-semibold text-accent text-sm uppercase tracking-wider mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map(({ to, label }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-neutral-400 hover:text-accent transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          <motion.div variants={item}>
            <h3 className="font-display font-semibold text-accent text-sm uppercase tracking-wider mb-4">Shield</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">Free Fire diamonds & subscriptions. Best rates, fast delivery.</p>
          </motion.div>
        </motion.div>
        <div className="mt-10 pt-8 border-t border-surface-700 flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-500">
          <Link to="/" className="hover:text-accent transition-colors">Conditions of Use</Link>
          <Link to="/" className="hover:text-accent transition-colors">Privacy</Link>
          <Link to="/admin" className="opacity-70 hover:opacity-100 hover:text-accent transition-colors">Admin</Link>
          <span>© {new Date().getFullYear()} Shield</span>
        </div>
      </div>
    </motion.footer>
  );
}
