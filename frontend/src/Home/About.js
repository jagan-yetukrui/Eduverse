import React from "react";
import { motion } from "framer-motion";
import "./About.css";

const Section = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="bg-white shadow-lg rounded-2xl p-6 mb-6"
  >
    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
      <span className="text-blue-600 text-2xl">{icon}</span> {title}
    </h2>
    <p className="text-gray-700">{children}</p>
  </motion.div>
);

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-center text-blue-700 mb-10"
      >
        About EduVerse 🚀
      </motion.h1>

      <Section title="Our Vision" icon="🔭">
        EduVerse is a comprehensive educational platform designed to bridge the gap between academic learning and professional requirements. We provide students with the tools, resources, and connections they need to thrive in today's competitive landscape.
      </Section>

      <Section title="Who We Are" icon="👥">
        Founded by a group of students frustrated with traditional learning methods, EduVerse emerged from our own struggles and desire to create something better. We experienced firsthand the disconnect between classroom education and real-world skills, so we built this platform to address the challenges we faced and help others like us navigate their educational and professional journeys more effectively.
      </Section>

      <Section title="Our Mission" icon="🚀">
        At EduVerse, our mission is to empower students with practical skills, meaningful projects, and valuable connections that extend beyond traditional classroom learning. We believe in creating an ecosystem where academic knowledge meets real-world application, preparing students not just for jobs, but for impactful careers.
      </Section>

      <Section title="What We Offer" icon="🛠️">
        <ul className="list-disc pl-5 space-y-2">
          <li>AI-powered project recommendations tailored to your skills and interests</li>
          <li>Comprehensive profile building tools to showcase your achievements</li>
          <li>Networking opportunities with peers, mentors, and potential employers</li>
          <li>Career guidance and personalized learning paths</li>
          <li>Collaborative spaces for project development and skill enhancement</li>
        </ul>
      </Section>

      <Section title="Our Approach" icon="🧠">
        We combine cutting-edge technology with educational expertise to create a platform that adapts to each student's unique journey. Our AI-driven recommendations, peer-to-peer learning opportunities, and industry connections ensure that every student can find their path to success.
      </Section>

      <Section title="Join Our Community" icon="🌐">
        EduVerse is more than a platform—it's a community of learners, creators, and innovators. Whether you're looking to enhance your skills, build your portfolio, or connect with opportunities, EduVerse provides the environment and resources you need to achieve your goals.
      </Section>
    </div>
  );
};

export default About;
