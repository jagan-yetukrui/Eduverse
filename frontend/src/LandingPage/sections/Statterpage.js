import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Statterpage.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Statterpage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Transform scroll progress to various animation values
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const bioOpacity = useTransform(scrollYProgress, [0.18, 0.32, 0.96, 1], [0, 1, 1, 0]);
  const buttonOpacity = useTransform(scrollYProgress, [0.25, 0.4, 0.96, 1], [0, 1, 1, 0]);
  const buttonScale = useTransform(scrollYProgress, [0.25, 0.4], [0.8, 1]);

  // Letter animation variants
  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  // Word animation variants
  const wordVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.2,
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  useEffect(() => {
    setIsVisible(true);

    // GSAP animation for SVG line
    const svgPath = svgRef.current;
    if (svgPath) {
      // Set initial state
      gsap.set(svgPath, {
        strokeDasharray: "0 1000",
        strokeDashoffset: 1000
      });

      // Create scroll-triggered animation
      gsap.to(svgPath, {
        strokeDashoffset: 0,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
          onUpdate: (self) => {
            // Morph the path based on scroll progress
            const progress = self.progress;
            const path = svgPath;
            
            // Create more organic, sophisticated movement
            const wave1 = Math.sin(progress * Math.PI * 3) * 30;
            const wave2 = Math.sin(progress * Math.PI * 2 + Math.PI / 3) * 20;
            const wave3 = Math.cos(progress * Math.PI * 4) * 15;
            const wave4 = Math.sin(progress * Math.PI * 1.5) * 25;
            
            // Create a more complex, flowing path
            const newPath = `M 0,${200 + wave1} 
              Q ${300 + wave2},${180 + wave3} ${600 + wave4},${200 + wave1} 
              T ${1200 + wave2},${200 + wave3}`;
            path.setAttribute('d', newPath);
          }
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleAboutUsClick = () => {
    // Navigate to About page
    navigate('/about');
  };

  // Split text for letter animation
  const splitText = (text) => text.split('').map((char, i) => (
    <motion.span
      key={i}
      custom={i}
      variants={letterVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {char}
    </motion.span>
  ));

  return (
    <div ref={containerRef} className="statterpage-container">
      {/* Animated SVG Line */}
      <svg 
        className="animated-line" 
        width="100%" 
        height="400" 
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        <path
          ref={svgRef}
          d="M 0,200 Q 300,180 600,200 T 1200,200"
          stroke="#000000"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.1"
        />
      </svg>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Left Side - Headline */}
        <div className="headline-section">
          <motion.div 
            className="headline-container"
            style={{ opacity: headlineOpacity }}
          >
            <motion.h1 
              className="headline"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="welcome-text"
                custom={0}
                variants={wordVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
              >
                Welcome to
              </motion.div>
              <motion.div 
                className="eduverse-text"
                custom={1}
                variants={wordVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
              >
                {splitText("EduVerse")}
              </motion.div>
            </motion.h1>
          </motion.div>
        </div>
      </div>

      {/* Bottom Right Bio */}
      <motion.div
        className="bio-bottomright"
        style={{ opacity: bioOpacity }}
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <p className="bio-text">
          EduVerse is your launchpad from learning to doing AI-powered mentorship, real projects, and verified skills. Build, grow, and get noticed. Your journey to mastery starts here.
        </p>
        <motion.button 
          className="about-btn"
          onClick={handleAboutUsClick}
          style={{ opacity: buttonOpacity, scale: buttonScale }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 2 }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          ABOUT US
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Statterpage; 