import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useInView } from 'framer-motion';
import './JourneySection.css';

const JourneySection = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  // State for scroll-jack control
  const [isScrollJacked, setIsScrollJacked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transform scroll progress to path animation
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  
  // Individual step progress with staggered timing
  const step1Progress = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const step2Progress = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const step3Progress = useTransform(scrollYProgress, [0.25, 0.5], [0, 1]);
  const step4Progress = useTransform(scrollYProgress, [0.4, 0.7], [0, 1]);
  const step5Progress = useTransform(scrollYProgress, [0.6, 0.85], [0, 1]);

  // Vehicle position along the path
  const vehicleProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Precompute transforms for each step
  const stepScales = [
    useTransform(step1Progress, [0, 1], [0.5, 1]),
    useTransform(step2Progress, [0, 1], [0.5, 1]),
    useTransform(step3Progress, [0, 1], [0.5, 1]),
    useTransform(step4Progress, [0, 1], [0.5, 1]),
    useTransform(step5Progress, [0, 1], [0.5, 1]),
  ];
  
  const stepOpacities = [
    useTransform(step1Progress, [0, 1], [0, 1]),
    useTransform(step2Progress, [0, 1], [0, 1]),
    useTransform(step3Progress, [0, 1], [0, 1]),
    useTransform(step4Progress, [0, 1], [0, 1]),
    useTransform(step5Progress, [0, 1], [0, 1]),
  ];

  const stepGlows = [
    useTransform(step1Progress, [0, 1], [0, 1]),
    useTransform(step2Progress, [0, 1], [0, 1]),
    useTransform(step3Progress, [0, 1], [0, 1]),
    useTransform(step4Progress, [0, 1], [0, 1]),
    useTransform(step5Progress, [0, 1], [0, 1]),
  ];

  // Step background and color transforms
  const stepBackgrounds = [
    useTransform(step1Progress, [0, 1], ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)']),
    useTransform(step2Progress, [0, 1], ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)']),
    useTransform(step3Progress, [0, 1], ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)']),
    useTransform(step4Progress, [0, 1], ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)']),
    useTransform(step5Progress, [0, 1], ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)']),
  ];

  const stepColors = [
    useTransform(step1Progress, [0, 1], ['#666', '#000']),
    useTransform(step2Progress, [0, 1], ['#666', '#000']),
    useTransform(step3Progress, [0, 1], ['#666', '#000']),
    useTransform(step4Progress, [0, 1], ['#666', '#000']),
    useTransform(step5Progress, [0, 1], ['#666', '#000']),
  ];

  const stepIndicatorScales = [
    useTransform(step1Progress, [0, 1], [0, 1]),
    useTransform(step2Progress, [0, 1], [0, 1]),
    useTransform(step3Progress, [0, 1], [0, 1]),
    useTransform(step4Progress, [0, 1], [0, 1]),
    useTransform(step5Progress, [0, 1], [0, 1]),
  ];

  const stepIndicatorOpacities = [
    useTransform(step1Progress, [0, 1], [0, 1]),
    useTransform(step2Progress, [0, 1], [0, 1]),
    useTransform(step3Progress, [0, 1], [0, 1]),
    useTransform(step4Progress, [0, 1], [0, 1]),
    useTransform(step5Progress, [0, 1], [0, 1]),
  ];

  // Smooth spring animations (must be declared before transforms that use them)
  const smoothPathLength = useSpring(pathLength, { stiffness: 100, damping: 30 });
  const smoothVehicleProgress = useSpring(vehicleProgress, { stiffness: 100, damping: 30 });

  // Vehicle offset distance transforms
  const vehicleOffsetDistance = useTransform(smoothVehicleProgress, [0, 1], ['0%', '100%']);

  // Floating elements transform
  const floatingElementsY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Step positions for the map layout (desktop)
  const stepPositions = [
    { x: 50, y: 200 },   // Step 1: Start
    { x: 300, y: 100 },  // Step 2: Up and right
    { x: 600, y: 300 },  // Step 3: Down and right
    { x: 900, y: 150 },  // Step 4: Up and right
    { x: 1100, y: 250 }, // Step 5: End
  ];

  // Mobile step positions (vertical zig-zag)
  const mobileStepPositions = [
    { x: 50, y: 100 },
    { x: 50, y: 300 },
    { x: 50, y: 500 },
    { x: 50, y: 700 },
    { x: 50, y: 900 },
  ];

  const journeySteps = [
    {
      id: 1,
      number: "01",
      title: "Create Your Profile",
      description: "Tell us about yourself and your goals.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 40C8 32.27 14.27 26 22 26H26C33.73 26 40 32.27 40 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 24V32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 28H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      progress: step1Progress
    },
    {
      id: 2,
      number: "02",
      title: "Get Matched to Projects",
      description: "Our AI recommends perfect-fit challenges.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L30.18 17.82L44 24L30.18 30.18L24 44L17.82 30.18L4 24L17.82 17.82L24 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M24 16V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      progress: step2Progress
    },
    {
      id: 3,
      number: "03",
      title: "Collaborate & Build",
      description: "Work with peers or solo, and build real things.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="20" r="6" stroke="currentColor" strokeWidth="2"/>
          <circle cx="32" cy="20" r="6" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 32C12 28.69 14.69 26 18 26H30C33.31 26 36 28.69 36 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 14V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 32L28 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      progress: step3Progress
    },
    {
      id: 4,
      number: "04",
      title: "AI Feedback & Validation",
      description: "Get instant, personalized feedback as you progress.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 24L20 32L36 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 16H32V32H16V16Z" stroke="currentColor" strokeWidth="2"/>
          <circle cx="24" cy="24" r="4" fill="currentColor"/>
        </svg>
      ),
      progress: step4Progress
    },
    {
      id: 5,
      number: "05",
      title: "Showcase & Connect",
      description: "Share your results, earn recognition, and find your next adventure.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 24C8 15.16 15.16 8 24 8C32.84 8 40 15.16 40 24C40 32.84 32.84 40 24 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M24 16V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="24" cy="24" r="4" fill="currentColor"/>
          <path d="M16 32L32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      progress: step5Progress
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const stepVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
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

  // SVG path for desktop (curved journey)
  const desktopPath = "M50 200 Q175 150 300 100 T550 300 T800 150 T1100 250";
  
  // SVG path for mobile (vertical zig-zag)
  const mobilePath = "M50 100 L50 300 L50 500 L50 700 L50 900";

  return (
    <section ref={sectionRef} className="journey-section">
      {/* Background Elements */}
      <div className="journey-background">
        <motion.div 
          className="floating-elements"
          style={{ y: floatingElementsY }}
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="floating-element"
              animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 5 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            />
          ))}
        </motion.div>
      </div>

      <motion.div 
        ref={containerRef}
        className="journey-container"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Section Header */}
        <motion.div 
          className="journey-header" 
          variants={textVariants}
        >
          <motion.h2 
            className="journey-title"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Your Journey to Success
          </motion.h2>
          <motion.p 
            className="journey-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Follow the path from beginner to expert with our guided learning experience
          </motion.p>
        </motion.div>

        {/* Journey Map */}
        <div className="journey-map">
          {/* SVG Path Container */}
          <div className="journey-path-container">
            <svg 
              className="journey-path desktop-path" 
              viewBox="0 0 1200 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background path (static) */}
              <path 
                d={desktopPath}
                stroke="rgba(0,0,0,0.1)" 
                strokeWidth="3" 
                strokeLinecap="round"
                fill="none"
              />
              
              {/* Animated path (fills as you scroll) */}
              <motion.path 
                d={desktopPath}
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round"
                fill="none"
                style={{ pathLength: smoothPathLength }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />
              
              {/* Path glow effect */}
              <motion.path 
                d={desktopPath}
                stroke="currentColor" 
                strokeWidth="8" 
                strokeLinecap="round"
                fill="none"
                opacity="0.3"
                style={{ pathLength: smoothPathLength }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />

              {/* Animated vehicle (dot) moving along the path */}
              <motion.circle
                cx="50"
                cy="200"
                r="6"
                fill="#000000"
                style={{
                  offsetDistance: vehicleOffsetDistance,
                  offsetPath: `path("${desktopPath}")`
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>

            {/* Mobile path */}
            <svg 
              className="journey-path mobile-path" 
              viewBox="0 0 100 1000" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d={mobilePath}
                stroke="rgba(0,0,0,0.1)" 
                strokeWidth="3" 
                strokeLinecap="round"
                fill="none"
              />
              
              <motion.path 
                d={mobilePath}
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round"
                fill="none"
                style={{ pathLength: smoothPathLength }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />
              
              <motion.path 
                d={mobilePath}
                stroke="currentColor" 
                strokeWidth="8" 
                strokeLinecap="round"
                fill="none"
                opacity="0.3"
                style={{ pathLength: smoothPathLength }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />

              <motion.circle
                cx="50"
                cy="100"
                r="6"
                fill="#000000"
                style={{
                  offsetDistance: vehicleOffsetDistance,
                  offsetPath: `path("${mobilePath}")`
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </div>

          {/* Journey Steps */}
          <div className="journey-steps">
            {journeySteps.map((step, index) => (
              <motion.div
                key={step.id}
                className="journey-step"
                variants={stepVariants}
                style={{
                  left: `${stepPositions[index].x}px`,
                  top: `${stepPositions[index].y}px`,
                  opacity: stepOpacities[index],
                  scale: stepScales[index],
                }}
              >
                {/* Step Number */}
                <motion.div 
                  className="step-number"
                  style={{
                    backgroundColor: stepBackgrounds[index],
                    color: stepColors[index]
                  }}
                >
                  {step.number}
                </motion.div>

                {/* Step Icon */}
                <motion.div 
                  className="step-icon"
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.6, ease: "easeInOut" }
                  }}
                >
                  <motion.div
                    className="icon-glow"
                    style={{
                      opacity: stepGlows[index]
                    }}
                  />
                  {step.icon}
                </motion.div>

                {/* Step Content */}
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>

                {/* Active indicator */}
                <motion.div 
                  className="step-indicator"
                  style={{
                    scale: stepIndicatorScales[index],
                    opacity: stepIndicatorOpacities[index]
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          className="journey-cta"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            className="start-journey-btn"
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Start Your Journey</span>
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

export default JourneySection; 