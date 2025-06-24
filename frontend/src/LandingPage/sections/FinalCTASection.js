import React from 'react';
import { motion } from 'framer-motion';
import './FinalCTASection.css';

const FinalCTASection = () => {
  return (
    <section className="final-cta-section">
      <motion.div
        className="final-cta-container"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <h2 className="final-cta-title">Ready to Build Your Future?</h2>
        <p className="final-cta-subtitle">
          Get started free. Build real skills, validated by AI.
        </p>
        <motion.button
          className="final-cta-btn"
          whileHover={{ scale: 1.06, boxShadow: '0 8px 32px rgba(16,185,129,0.18)' }}
          whileTap={{ scale: 0.97 }}
        >
          Sign Up Free
        </motion.button>
        <div className="final-cta-tinyprint">
          No credit card required. Cancel anytime.
        </div>
      </motion.div>
    </section>
  );
};

export default FinalCTASection; 