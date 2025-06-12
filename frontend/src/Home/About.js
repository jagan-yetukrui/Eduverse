import React from "react";
import { motion } from "framer-motion";
import "./About.css";
import KnowYourFounder from "../components/KnowYourFounder";

const Section = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="section-card"
  >
    <h2 className="section-title">
      <span className="section-icon">{icon}</span>
      {title}
    </h2>
    <div className="section-content">
      {children}
    </div>
  </motion.div>
);

const About = () => {
  return (
    <div className="about-container">
      <div className="content-max-width">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="about-title"
        >
          About EduVerse
        </motion.h1>

        <Section title="About EduVerse" icon="🚀">
          EduVerse is an AI-first platform built to prove you're job-ready — not with resumes, but with real-world projects. 
          At EduVerse, learning turns into doing, and doing becomes your edge.
          We empower students to showcase their true skills, guided by an AI mentor named Edura.
        </Section>

        <Section title="Why We Exist" icon="💡">
          Today's education system often leaves students with knowledge but no direction. 
          They graduate with degrees but struggle to apply their skills in the real world.
          At the same time, employers seek proof — not potential.
          EduVerse bridges this gap by transforming learning into tangible projects that validate real ability.
        </Section>

        <Section title="What We Do" icon="⚙️">
          <ul className="feature-list">
            <li><strong>Assess Skills:</strong> Edura, your AI mentor, understands your strengths and goals.</li>
            <li><strong>Guide Projects:</strong> We recommend step-by-step projects tailored to your level — from beginner to advanced.</li>
            <li><strong>Track Growth:</strong> Every task you complete builds a verified portfolio that recruiters and universities can see.</li>
            <li><strong>Connect Talent:</strong> We match students to teams, mentors, and companies based on skill and interest.</li>
          </ul>
        </Section>

        <Section title="Meet Our Team" icon="👨‍💻">
          <KnowYourFounder />
        </Section>
      </div>
    </div>
  );
};

export default About;
