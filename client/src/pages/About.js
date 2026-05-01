import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';

const images = [
  { src: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', alt: 'Gaming setup' },
  { src: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600', alt: 'Free Fire style gaming' },
  { src: 'https://images.unsplash.com/photo-1611791484670-ce19b801dd1c?w=600', alt: 'Battle royale gaming' },
];

export default function About() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    api.get('/about').then((res) => setAbout(res.data)).catch(() => setAbout(null));
  }, []);

  const guildMembers = about?.guildMembers || [];

  return (
    <motion.div
      className="space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <section className="text-center max-w-3xl mx-auto">
        <img
          src={`${process.env.PUBLIC_URL || ''}/logo.png`}
          alt="Shield Store logo"
          className="h-20 sm:h-24 w-auto object-contain mx-auto mb-4"
        />
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-100 mb-4">{about?.title || 'About Shield Store'}</h1>
        <p className="text-neutral-300 leading-relaxed">
          {about?.subtitle || 'Shield Store is your trusted partner for Free Fire in-game top-ups and fast, reliable service.'}
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <motion.div
            key={i}
            className="rounded-2xl overflow-hidden border border-surface-700 bg-surface-800 aspect-[4/3]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </section>

      <section className="rounded-2xl border border-surface-700 bg-surface-800/50 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-neutral-100 mb-4">What we offer</h2>
        <ul className="space-y-3 text-neutral-300">
          <li className="flex items-start gap-3">
            <span className="text-accent text-xl">💎</span>
            <span><strong className="text-neutral-100">Diamonds</strong> — Top up your Free Fire account with diamond packs at competitive prices. From small packs to bulk, we’ve got you covered.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent text-xl">🎫</span>
            <span><strong className="text-neutral-100">Subscriptions</strong> — Weekly Lite, Weekly, and Monthly passes for uninterrupted gameplay and rewards.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent text-xl">🛡</span>
            <span><strong className="text-neutral-100">Shield promise</strong> — Secure payments, fast delivery, and support you can rely on.</span>
          </li>
        </ul>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-surface-700 bg-surface-800/60 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-100 mb-3">Our story</h2>
          <p className="text-neutral-300 leading-relaxed">{about?.story || 'Shield Store was built to make top-up and gaming commerce simple, transparent, and fast.'}</p>
        </div>
        <div className="rounded-2xl border border-surface-700 bg-surface-800/60 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-100 mb-3">Our mission</h2>
          <p className="text-neutral-300 leading-relaxed">{about?.mission || 'We help every player get what they need quickly with fair pricing and dependable support.'}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-surface-700 bg-surface-800/50 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="font-display text-xl font-semibold text-neutral-100">{about?.guildName || 'Shield Guild'}</h2>
          <span className="text-sm text-neutral-400">{guildMembers.length} members</span>
        </div>
        {guildMembers.length === 0 ? (
          <p className="text-neutral-400">Guild members will appear here once added by the admin team.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guildMembers.map((member) => (
              <div key={member._id} className="rounded-xl border border-surface-700 bg-surface-900/70 p-4">
                <div className="flex items-center gap-3">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border border-surface-600" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-surface-700 flex items-center justify-center text-sm font-semibold text-neutral-300">
                      {member.name?.slice(0, 1)?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <div>
                    <p className="text-neutral-100 font-medium">{member.name}</p>
                    <p className="text-accent text-sm">{member.role}</p>
                  </div>
                </div>
                {member.bio ? <p className="mt-3 text-sm text-neutral-400">{member.bio}</p> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="text-center">
        <Link to="/products" className="inline-block px-6 py-3 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors">
          Shop now
        </Link>
      </section>
    </motion.div>
  );
}
