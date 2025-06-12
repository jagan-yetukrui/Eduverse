import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Founder.css';

const Founder = () => {
  const [activeSection, setActiveSection] = useState('bio');
  const [showSignature, setShowSignature] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'JaganYetukuri';
    
    // Hide signature after animation completes
    const timer = setTimeout(() => {
      setShowSignature(false);
    }, 5000); // Increased timing to allow for longer animation

    return () => clearTimeout(timer);
  }, []);

  const experiences = [
    {
      role: "Founder – EduVerse",
      timeline: "Jan 2025 – Present",
      impact: "Launched an AI-based project mentorship platform used by 150+ students. Built MVP in 3 months with a cross-functional student team."
    },
    {
      role: "Lead Programmer – Raytheon Drone Competition",
      timeline: "Sep 2024 – Mar 2025",
      impact: "Developed autonomous flight logic, QR tracking, and geo-fencing using Python/OpenCV."
    },
    {
      role: "Web Development Intern – SITI Networks Ltd",
      timeline: "May 2024 – Aug 2024",
      impact: "Helped launch 10+ microservices for streaming systems using Java + Spring Boot. Reduced bugs by 40% through CI/CD pipeline improvements."
    },
    {
      role: "President – High School Student Union",
      timeline: "Mar 2018 – May 2020",
      impact: "Represented 800+ students and initiated leadership training programs."
    }
  ];

  const interests = [
    "🚀 Disruptive ideas that push boundaries — like flying cars and personalized AI",
    "🧠 Learning about emerging tech and simplifying it for others",
    "📚 Storytelling through tech, books, and visuals",
    "🕹️ Building things from scratch and watching people use them",
    "🤝 Collaborating with passionate people to bring visions to life"
  ];

  const projects = [
    "EduVerse – AI-powered learning & project suggestion platform.",
    "Flying Car Simulation – Researched magnetic uplift, Nitinol wheels, and plasma propulsion.",
    "Autonomous Drone System – Raytheon challenge with real-time navigation and multi-agent logic.",
    "University + Business Websites – SEO-optimized, responsive websites with direct client feedback.",
    "Book: A Fight for Light – Fictional novel about resilience, published on Amazon."
  ];

  const skills = [
    {
      name: "Python",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg"
    },
    {
      name: "Java",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg"
    },
    {
      name: "JavaScript",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg"
    },
    {
      name: "React",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg"
    },
    {
      name: "Node.js",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg"
    },
    {
      name: "MongoDB",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg"
    },
    {
      name: "Git",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg"
    },
    {
      name: "Docker",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg"
    },
    {
      name: "AWS",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original.svg"
    },
    {
      name: "TypeScript",
      icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg"
    }
  ];

  const renderBio = () => (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center fade-in"
    >
      <h1 className="founder-heading">Jagan Yetukuri</h1>
      <p className="founder-text">
        "You can't fix yesterday. But you can create tomorrow."
        <br /><br />
        I'm Jagan Yetukuri, and I've never believed in dreaming small.
        Even sky isn't the limit — because I've been building towards it.
        <br /><br />
        For the last three years, I've been working on a concept that many still think belongs to science fiction: flying cars.
        Not because it's easy — but because every generation needs someone stubborn enough to try what's never been done.
        <br /><br />
        But while I've always looked to the sky, my feet stayed grounded.
        Because I saw another problem closer to home:
        students with talent, but no proof.
        Degrees without direction.
        Ambition without a map.
        <br /><br />
        So I built EduVerse — an AI-first platform where students don't just learn… they prove.
        Where your work speaks louder than your words.
        And where Edura, your AI mentor, doesn't just give shortcuts — it unlocks your potential, one project at a time.
        <br /><br />
        EduVerse was born from the same fire that drives everything I do — a belief that if you can imagine it, you can build it.
        But that dream means nothing without gratitude.
        Gratitude for the chance to study here.
        To build here.
        To try — even when it feels impossible.
        <br /><br />
        This isn't just about startups.
        It's about proving that passion, persistence, and purpose can rewrite the script for anyone bold enough to pick up the pen.
        <br /><br />
        So whether I'm building code or engines, AI platforms or aircraft — my mission stays the same:
        <br /><br />
        To create what tomorrow needs — before it knows it does.
        <br /><br />
        And I'm just getting started.
      </p>
    </motion.section>
  );

  const renderSelectedSection = () => {
    switch (activeSection) {
      case 'experience':
        return (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="fade-in"
          >
            <h2 className="section-heading">My Experiences</h2>
            <div className="grid gap-6">
              {experiences.map((exp, index) => (
                <div key={index} className="experience-card">
                  <h3 className="card-title">{exp.role}</h3>
                  <p className="card-subtitle">{exp.timeline}</p>
                  <p className="card-text">{exp.impact}</p>
                </div>
              ))}
            </div>
          </motion.section>
        );
      case 'interests':
        return (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="fade-in"
          >
            <h2 className="section-heading">What I Love Working On</h2>
            <div className="grid gap-4">
              {interests.map((interest, index) => (
                <p key={index} className="experience-card">
                  {interest}
                </p>
              ))}
            </div>
          </motion.section>
        );
      case 'projects':
        return (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="fade-in"
          >
            <h2 className="section-heading">Projects I've Built</h2>
            <div className="grid gap-4">
              {projects.map((project, index) => (
                <p key={index} className="experience-card">
                  {project}
                </p>
              ))}
            </div>
          </motion.section>
        );
      case 'skills':
        return (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="fade-in"
          >
            <h2 className="section-heading">Tech Stack</h2>
            <div className="skills-scroll-container">
              <div className="skills-scroll-track">
                {[...skills, ...skills].map((skill, index) => (
                  <div key={index} className="skill-card">
                    <span className="skill-icon">
                      <img src={skill.icon} alt={skill.name} />
                    </span>
                    <span className="skill-name">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="founder-container">
      {showSignature ? (
        <motion.div 
          className="signature-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg className="signature-svg" viewBox="0 0 800 200">
            <motion.path
              d="M50,100 C100,50 150,150 200,100 C250,50 300,150 350,100 C400,50 450,150 500,100 C550,50 600,150 650,100 C700,50 750,150 800,100"
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
            <motion.text
              x="400"
              y="150"
              textAnchor="middle"
              className="signature-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
            >
              Jagan Yetukuri
            </motion.text>
          </svg>
        </motion.div>
      ) : (
        <>
          <button 
            className="back-button"
            onClick={() => navigate('/about')}
          >
            Back to About
          </button>
          
          <div className="content-wrapper">
            {renderBio()}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="section-navigation"
            >
              <button
                className={`nav-pill ${activeSection === 'experience' ? 'active' : ''}`}
                onClick={() => setActiveSection('experience')}
              >
                Experiences
              </button>
              <button
                className={`nav-pill ${activeSection === 'interests' ? 'active' : ''}`}
                onClick={() => setActiveSection('interests')}
              >
                Interests
              </button>
              <button
                className={`nav-pill ${activeSection === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveSection('projects')}
              >
                Projects
              </button>
            </motion.div>

            {renderSelectedSection()}

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="skills-section"
            >
              <h2 className="section-heading">Tech Stack</h2>
              <div className="skills-scroll-container">
                <div className="skills-scroll-track">
                  {[...skills, ...skills].map((skill, index) => (
                    <div key={index} className="skill-card">
                      <span className="skill-icon">
                        <img src={skill.icon} alt={skill.name} />
                      </span>
                      <span className="skill-name">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="contact-card fade-in"
            >
              <h2 className="section-heading">Let's Connect</h2>
              <p className="founder-text">
                I'd love to chat about innovation, collaboration, or just exchange ideas.
                <br />
                Click the button below to schedule a 20-minute meeting with me.
              </p>
              <a
                href="https://calendly.com/jaganyetukuri7/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                Book a 20-minute call
              </a>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="social-section fade-in"
            >
              <h2 className="section-heading">Connect With Me</h2>
              <div className="social-links">
                <a href="https://www.linkedin.com/in/jagan-yetukuri/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fab fa-linkedin"></i>
                  <span>LinkedIn</span>
                </a>
                <a href="https://github.com/jagan-yetukrui" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fab fa-github"></i>
                  <span>GitHub</span>
                </a>
                <a href="https://www.instagram.com/jagan_yetukuri7/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <i className="fab fa-instagram"></i>
                  <span>Instagram</span>
                </a>
              </div>
            </motion.section>

            <motion.footer
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="social-icons fade-in"
            >
              <a href="https://www.linkedin.com/in/jagan-yetukuri/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://github.com/jagan-yetukrui" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://www.instagram.com/jagan_yetukuri7/" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="fab fa-instagram"></i>
              </a>
            </motion.footer>
          </div>
        </>
      )}
    </div>
  );
};

export default Founder; 