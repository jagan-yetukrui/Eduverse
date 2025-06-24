import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import './ProductDemoSection.css';

const ProductDemoSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [currentPhase, setCurrentPhase] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showProjects, setShowProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [powerWordIndex, setPowerWordIndex] = useState(0);

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Laptop floating animation
  const laptopY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const laptopScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.95]);
  const laptopOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  // Smooth spring animations
  const smoothLaptopY = useSpring(laptopY, { stiffness: 100, damping: 30 });
  const smoothLaptopScale = useSpring(laptopScale, { stiffness: 100, damping: 30 });
  const smoothLaptopOpacity = useSpring(laptopOpacity, { stiffness: 100, damping: 30 });

  // Animated power words
  const powerWords = [
    "Personalized",
    "Real Projects", 
    "Instant Results",
    "AI-Powered",
    "Step-by-Step",
    "Expert Guidance"
  ];

  // Mock project data
  const mockProjects = [
    {
      id: 1,
      title: "Build a Real-time Chat App",
      difficulty: "Intermediate",
      skills: ["React", "Node.js", "Socket.io"],
      match: "98%",
      color: "#6366f1",
      description: "Create a modern chat application with real-time messaging, user authentication, and file sharing capabilities.",
      steps: [
        "Set up React frontend with Socket.io client",
        "Create Node.js backend with Express and Socket.io",
        "Implement user authentication and chat rooms",
        "Add real-time messaging and file upload features",
        "Deploy to production with proper security measures"
      ]
    },
    {
      id: 2,
      title: "AI-Powered Task Manager",
      difficulty: "Advanced",
      skills: ["Python", "TensorFlow", "FastAPI"],
      match: "95%",
      color: "#10b981",
      description: "Develop an intelligent task management system that uses AI to prioritize and categorize tasks automatically.",
      steps: [
        "Design database schema for tasks and user preferences",
        "Implement FastAPI backend with authentication",
        "Integrate TensorFlow for task classification",
        "Build AI-powered priority scoring system",
        "Create intuitive dashboard with analytics"
      ]
    },
    {
      id: 3,
      title: "E-commerce Dashboard",
      difficulty: "Beginner",
      skills: ["JavaScript", "CSS", "HTML"],
      match: "92%",
      color: "#f59e0b",
      description: "Build a responsive e-commerce dashboard with product management, order tracking, and sales analytics.",
      steps: [
        "Create responsive HTML structure",
        "Style with modern CSS and animations",
        "Add JavaScript for interactive features",
        "Implement product catalog and cart functionality",
        "Add order management and basic analytics"
      ]
    }
  ];

  // Typing animation text
  const typingText = "I want to build a chat app for my team with real-time messaging and file sharing...";

  // Power words cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setPowerWordIndex(prev => (prev + 1) % powerWords.length);
    }, 2200); // 2.2s per word
    return () => clearInterval(interval);
  }, [powerWords.length]);

  // Auto-play demo when in view
  useEffect(() => {
    if (isInView) {
      startDemoLoop();
    }
  }, [isInView]);

  const startDemoLoop = () => {
    // Phase 0: Typing
    setCurrentPhase(0);
    setTypedText('');
    setShowProjects(false);
    setSelectedProject(null);

    // Simulate typing with realistic human speed
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < typingText.length) {
        setTypedText(typingText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Move to processing phase with slower, more cinematic timing
        setTimeout(() => {
          setCurrentPhase(1);
          setTimeout(() => {
            setCurrentPhase(2);
            setTimeout(() => {
              setCurrentPhase(3);
              setShowProjects(true);
              setTimeout(() => {
                setSelectedProject(mockProjects[0]);
                setCurrentPhase(4);
                // Loop back to start with longer duration for better pacing
                setTimeout(() => {
                  if (isInView) {
                    startDemoLoop();
                  }
                }, 6000); // Was 4000 - longer duration for project details
              }, 3000); // Was 2000 - more time to view results
            }, 2200); // Was 1500 - longer matching phase
          }, 3000); // Was 2000 - longer processing phase
        }, 1600); // Was 1000 - pause after typing
      }
    }, 100); // Was 50 - more realistic human typing speed
  };

  return (
    <section ref={sectionRef} className="product-demo-section">
      {/* Background Elements */}
      <div className="demo-background">
        <motion.div 
          className="floating-particles"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -15]) }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              animate={{
                y: [0, -20, 0],
                opacity: [0.05, 0.3, 0.05],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 5 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4
              }}
            />
          ))}
        </motion.div>
      </div>

      <motion.div 
        className="demo-container"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Left Side - Laptop */}
        <motion.div 
          className="laptop-container"
          style={{
            y: smoothLaptopY,
            scale: smoothLaptopScale,
            opacity: smoothLaptopOpacity,
          }}
        >
          {/* Laptop Frame */}
          <div className="laptop-frame">
            {/* Laptop Base */}
            <div className="laptop-base">
              <div className="laptop-shadow"></div>
            </div>
            
            {/* Laptop Screen */}
            <div className="laptop-screen">
              <div className="screen-reflection"></div>
              
              {/* Screen Content */}
              <div className="screen-content">
                {/* Demo UI */}
                <div className="demo-ui">
                  {/* Header */}
                  <div className="demo-ui-header">
                    <div className="demo-ui-logo">
                      <span className="logo-text">EduVerse</span>
                    </div>
                    <div className="demo-ui-actions">
                      <div className="demo-ui-button"></div>
                      <div className="demo-ui-button"></div>
                      <div className="demo-ui-button"></div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="demo-ui-main">
                    {/* Chat Interface */}
                    <AnimatePresence mode="wait">
                      {currentPhase === 0 && (
                        <motion.div 
                          key="typing"
                          className="chat-interface"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="chat-message user-message">
                            <div className="message-content">
                              <span className="typed-text">{typedText}</span>
                              <motion.span 
                                className="typing-cursor"
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                              >
                                |
                              </motion.span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {currentPhase === 1 && (
                        <motion.div 
                          key="processing"
                          className="ai-processing"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="ai-brain">
                            <motion.div 
                              className="brain-pulse"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.8, 0.3]
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          </div>
                          <div className="processing-dots">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="processing-dot"
                                animate={{
                                  y: [0, -8, 0],
                                  opacity: [0.2, 1, 0.2]
                                }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </div>
                          <p>AI is analyzing your request...</p>
                        </motion.div>
                      )}

                      {currentPhase === 2 && (
                        <motion.div 
                          key="matching"
                          className="matching-phase"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="matching-animation">
                            <motion.div 
                              className="matching-icon"
                              animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            >
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <path d="M20 4L24.5 15.5L36 20L24.5 24.5L20 36L15.5 24.5L4 20L15.5 15.5L20 4Z" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </motion.div>
                            <p>Finding perfect matches...</p>
                          </div>
                        </motion.div>
                      )}

                      {currentPhase === 3 && (
                        <motion.div 
                          key="results"
                          className="project-results"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="results-header">
                            <h3>Your Perfect Matches</h3>
                            <p>Based on your request and skills</p>
                          </div>
                          <div className="project-cards">
                            {mockProjects.map((project, index) => (
                              <motion.div
                                key={project.id}
                                className={`project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
                                initial={{ opacity: 0, x: 30, y: 10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ 
                                  duration: 0.6, 
                                  delay: index * 0.35, // Was 0.2 - more cinematic timing
                                  ease: [0.4, 0, 0.2, 1]
                                }}
                                whileHover={{ 
                                  scale: 1.02,
                                  transition: { duration: 0.2 }
                                }}
                              >
                                <div className="project-header">
                                  <h4 className="project-title">{project.title}</h4>
                                  <span className="project-match">{project.match}</span>
                                </div>
                                <div className="project-details">
                                  <span className="project-difficulty">{project.difficulty}</span>
                                  <div className="project-skills">
                                    {project.skills.map((skill, skillIndex) => (
                                      <span key={skillIndex} className="project-skill">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <motion.div 
                                  className="project-glow"
                                  style={{ backgroundColor: project.color }}
                                  animate={{
                                    opacity: [0.2, 0.5, 0.2]
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
                        </motion.div>
                      )}

                      {currentPhase === 4 && selectedProject && (
                        <motion.div 
                          key="details"
                          className="project-details-view"
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="details-header">
                            <h3>{selectedProject.title}</h3>
                            <span className="difficulty-badge">{selectedProject.difficulty}</span>
                          </div>
                          <p className="project-description">{selectedProject.description}</p>
                          <div className="project-steps">
                            <h4>Step-by-Step Guide</h4>
                            <div className="steps-list">
                              {selectedProject.steps.map((step, index) => (
                                <motion.div
                                  key={index}
                                  className="step-item"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                  <span className="step-number">{index + 1}</span>
                                  <span className="step-text">{step}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Content */}
        <motion.div 
          className="demo-content"
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Main Headline */}
          <motion.h2 
            className="demo-headline"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            AI Project Matching
          </motion.h2>

          {/* Animated Power Words - One at a time */}
          <motion.div 
            className="power-words-container"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={powerWords[powerWordIndex]}
                className="power-word"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {powerWords[powerWordIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Description */}
          <motion.p 
            className="demo-description"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            Watch as our AI instantly analyzes your skills and interests to match you with perfect projects. 
            Get personalized recommendations with step-by-step guidance tailored to your learning journey.
          </motion.p>

          {/* Call to Action */}
          <motion.div 
            className="demo-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <motion.button
              className="try-demo-btn"
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
      </motion.div>
    </section>
  );
};

export default ProductDemoSection; 