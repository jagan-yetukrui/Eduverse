import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import './BuiltForSection.css';

const BuiltForSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [aiFlowStep, setAiFlowStep] = useState(0);

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // AI flow animation
  const aiFlowProgress = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1]);
  const smoothAiFlow = useSpring(aiFlowProgress, { stiffness: 100, damping: 30 });

  // Audience data
  const audiences = [
    {
      id: 1,
      title: "Students",
      subtitle: "Build real skills. Show your work.",
      description: "Create portfolio-worthy projects that demonstrate your abilities to employers.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L30.18 17.82L44 24L30.18 30.18L24 44L17.82 30.18L4 24L17.82 17.82L24 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M24 16V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#6366f1",
      testimonial: "EduVerse helped me build a real-time chat app that landed me my first developer job!"
    },
    {
      id: 2,
      title: "Professionals",
      subtitle: "Advance your career. Stay relevant.",
      description: "Master new technologies and build projects that showcase your expertise.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 24C8 15.16 15.16 8 24 8C32.84 8 40 15.16 40 24C40 32.84 32.84 40 24 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 16V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="24" cy="24" r="4" fill="currentColor"/>
        </svg>
      ),
      color: "#10b981",
      testimonial: "The AI recommendations are spot-on. I've learned more in 3 months than in a year of tutorials."
    },
    {
      id: 3,
      title: "Recruiters",
      subtitle: "Find verified talent. See real work.",
      description: "Discover candidates with proven skills through their actual project portfolios.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 40C8 32.27 14.27 26 22 26H26C33.73 26 40 32.27 40 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 32L32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 36L28 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      color: "#f59e0b",
      testimonial: "Finally, a platform where I can see candidates' actual coding abilities, not just resumes."
    },
    {
      id: 4,
      title: "Universities",
      subtitle: "Close the skills gap. Prepare students.",
      description: "Bridge the gap between academic learning and industry-ready skills.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L44 24L24 44L4 24L24 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M24 12V36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 24H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      color: "#8b5cf6",
      testimonial: "Our students are graduating with real project experience that employers actually want."
    }
  ];

  // AI Flow steps
  const aiFlowSteps = [
    { id: 1, title: "Input Skills", description: "Tell us what you know" },
    { id: 2, title: "AI Analysis", description: "Our AI understands your profile" },
    { id: 3, title: "Smart Matching", description: "Find perfect projects" },
    { id: 4, title: "Build & Learn", description: "Create with guidance" },
    { id: 5, title: "Get Feedback", description: "Validate your work" }
  ];

  // Auto-animate AI flow
  useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setAiFlowStep(prev => (prev + 1) % aiFlowSteps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isInView, aiFlowSteps.length]);

  return (
    <section ref={sectionRef} className="built-for-section">
      {/* Background Elements */}
      <div className="section-background">
        <motion.div 
          className="floating-elements"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -20]) }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="floating-element"
              animate={{
                y: [0, -30, 0],
                opacity: [0.05, 0.3, 0.05],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 6 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4
              }}
            />
          ))}
        </motion.div>
      </div>

      <motion.div 
        className="section-container"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Section Header */}
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="section-title">Built For Everyone</h2>
          <p className="section-subtitle">
            Whether you're learning, teaching, or hiring, EduVerse adapts to your needs
          </p>
        </motion.div>

        {/* Audience Grid */}
        <motion.div 
          className="audience-grid"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.id}
              className="audience-card"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.6 + index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              onHoverStart={() => setHoveredCard(audience.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <div className="card-content">
                <motion.div 
                  className="card-icon"
                  style={{ color: audience.color }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.6, ease: "easeInOut" }
                  }}
                >
                  {audience.icon}
                </motion.div>
                
                <div className="card-text">
                  <h3 className="card-title">{audience.title}</h3>
                  <p className="card-subtitle">{audience.subtitle}</p>
                  <p className="card-description">{audience.description}</p>
                </div>

                {/* Hover Tooltip */}
                <AnimatePresence>
                  {hoveredCard === audience.id && (
                    <motion.div 
                      className="card-tooltip"
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="tooltip-content">
                        <p className="tooltip-text">"{audience.testimonial}"</p>
                        <div className="tooltip-arrow"></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card Glow Effect */}
              <motion.div 
                className="card-glow"
                style={{ 
                  background: `radial-gradient(circle, ${audience.color}20 0%, transparent 70%)`,
                  borderColor: audience.color
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="section-cta"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <motion.button
            className="join-now-btn"
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Join EduVerse Today</span>
            <motion.svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.3 }}
            >
              <path d="M10 1L19 10L10 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 10H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default BuiltForSection; 