import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useInView } from 'framer-motion';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  // State for popup modal
  const [activePopup, setActivePopup] = useState(null);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax effects
  const gridX = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const lineProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  
  // Individual card parallax transforms - each must be a separate useTransform call
  const card1Y = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const card2Y = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const card3Y = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const card4Y = useTransform(scrollYProgress, [0, 1], [0, 10]);
  
  // Array of transforms for easy access
  const cardsY = [card1Y, card2Y, card3Y, card4Y];
  
  // Smooth spring animations
  const smoothGridX = useSpring(gridX, { stiffness: 100, damping: 30 });
  const smoothGridY = useSpring(gridY, { stiffness: 100, damping: 30 });
  const smoothTitleY = useSpring(titleY, { stiffness: 100, damping: 30 });

  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setActivePopup(null);
      }
    };

    if (activePopup) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [activePopup]);

  const features = [
    {
      id: 1,
      step: "01",
      title: "AI Project Guidance",
      description: "Get matched to projects that fit your skills, interests, and goals—instantly.",
      learnMore: "Discover your perfect match",
      detailedContent: "Our advanced AI analyzes your skills, learning style, and career aspirations to match you with projects that will accelerate your growth. Unlike generic recommendations, our system understands your unique journey and adapts as you progress. Start with projects that challenge you just enough to grow, then advance to more complex work as you develop.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L30.18 17.82L44 24L30.18 30.18L24 44L17.82 30.18L4 24L17.82 17.82L24 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M24 16V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 2,
      step: "02", 
      title: "Skill Validation",
      description: "Build a portfolio of real, verifiable work—no fake certificates.",
      learnMore: "See validation process",
      detailedContent: "Every project you complete on EduVerse is verified by industry professionals and peer reviewers. Your portfolio showcases real work that demonstrates actual skills—not just theoretical knowledge. Employers can see your growth trajectory, code quality, and problem-solving abilities through your verified project history.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 24L20 32L36 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 16H32V32H16V16Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 3,
      step: "03",
      title: "Peer Collaboration", 
      description: "Find collaborators, form teams, and grow together on real-world projects.",
      learnMore: "Join the community",
      detailedContent: "Connect with developers, designers, and creators who share your interests and goals. Form teams, share knowledge, and build amazing projects together. Our platform fosters genuine collaboration through real-time communication, version control integration, and project management tools designed for learning teams.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="20" r="6" stroke="currentColor" strokeWidth="2"/>
          <circle cx="32" cy="20" r="6" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 32C12 28.69 14.69 26 18 26H30C33.31 26 36 28.69 36 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 14V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 4,
      step: "04",
      title: "Personalized Path",
      description: "Your journey, your way: every experience is uniquely tailored for you.",
      learnMore: "Start your journey",
      detailedContent: "EduVerse adapts to your learning style, pace, and goals. Whether you're a complete beginner or an experienced developer looking to specialize, our platform creates a custom roadmap that evolves with you. Track your progress, celebrate milestones, and always know what's next on your personalized learning journey.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 24C8 15.16 15.16 8 24 8C32.84 8 40 15.16 40 24C40 32.84 32.84 40 24 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 16V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="24" cy="24" r="4" fill="currentColor"/>
        </svg>
      )
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      x: -20,
      scale: 0.9,
      rotateX: 15
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.2
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const popupVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <section ref={sectionRef} className="features-section">
      {/* Animated Background Elements */}
      <div className="features-background">
        <motion.div 
          className="floating-particles"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
        
        {/* Animated SVG Line */}
        <motion.div 
          className="features-background-line"
          style={{ 
            opacity: useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.15, 0.1]),
            scaleX: lineProgress
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path 
              d="M0 100 Q300 50 600 100 T1200 100" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.div 
        ref={containerRef}
        className="features-container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{ x: smoothGridX, y: smoothGridY }}
      >
        {/* Section Header */}
        <motion.div 
          className="features-header" 
          variants={textVariants}
          style={{ y: smoothTitleY }}
        >
          <motion.h2 
            className="features-title"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Why EduVerse?
          </motion.h2>
          <motion.p 
            className="features-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            A platform designed for next-generation learning and real results
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              className="feature-card"
              variants={cardVariants}
              whileHover={{
                y: -12,
                scale: 1.03,
                rotateY: 2,
                transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                y: cardsY[index]
              }}
            >
              {/* Step Indicator */}
              <motion.div 
                className="feature-step"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                {feature.step}
              </motion.div>

              {/* Icon with advanced animations */}
              <motion.div 
                className="feature-icon"
                variants={iconVariants}
                whileHover={{
                  scale: 1.15,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.6, ease: "easeInOut" }
                }}
              >
                <motion.div
                  className="icon-glow"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                {feature.icon}
              </motion.div>

              {/* Content */}
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                
                {/* Learn More Button */}
                <motion.button
                  className="learn-more-btn"
                  onClick={() => setActivePopup(feature.id)}
                  whileHover={{ 
                    x: 8,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{feature.learnMore}</span>
                  <motion.svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path d="M8 1L15 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                </motion.button>
              </div>

              {/* Hover Glow Effect */}
              <motion.div 
                className="card-glow"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Popup Modal */}
      {activePopup && (
        <motion.div 
          className="feature-popup-overlay" 
          onClick={() => setActivePopup(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="feature-popup" 
            onClick={e => e.stopPropagation()}
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <button 
              className="popup-close-btn" 
              onClick={() => setActivePopup(null)}
              aria-label="Close popup"
            >
              ×
            </button>
            <div className="popup-content">
              <h3>{features.find(f => f.id === activePopup)?.title}</h3>
              <p>{features.find(f => f.id === activePopup)?.detailedContent}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default FeaturesSection; 