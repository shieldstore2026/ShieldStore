import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import AccessibilityToolbar from './AccessibilityToolbar';
import AIChatbot from './AIChatbot';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 dark:bg-mesh-page dark:bg-surface-950">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <AnnouncementBar />
      <Header />
      <motion.main
        id="main-content"
        className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 md:px-6 md:py-8"
        role="main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      <AIChatbot />
      <AccessibilityToolbar />
    </div>
  );
}
