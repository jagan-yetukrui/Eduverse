import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const KnowYourFounder = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="founder-section"
    >
      <h2 className="founder-heading">Founder</h2>
      <p className="founder-description">
      From flying cars to AI-driven learning, meet the mind behind EduVerse. 
      Discover how a student's bold vision turned into a platform reshaping education.
        </p>
      <div style={{ textAlign: 'center' }}>
        <Link to="/jagan-yetukuri" className="founder-cta">
          Know Your Founder
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            →
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
};

export default KnowYourFounder; 