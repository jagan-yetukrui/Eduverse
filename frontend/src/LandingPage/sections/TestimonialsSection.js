import React from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import './TestimonialsSection.css';

const testimonials = [
  {
    name: 'Ava Chen',
    role: 'Student @ MIT',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    quote: 'EduVerse helped me finally launch my first project!'
  },
  {
    name: 'Liam Patel',
    role: 'AI Enthusiast',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    quote: 'The project matching is so smart—it feels like magic.'
  },
  {
    name: 'Priya Singh',
    role: 'Recruiter @ TechHire',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    quote: 'I can finally see real skills, not just resumes.'
  },
  {
    name: 'Carlos Rivera',
    role: 'University Partner',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    quote: 'Our students are building portfolios that get them hired.'
  },
  {
    name: 'Emily Zhang',
    role: 'Software Engineer',
    avatar: 'https://randomuser.me/api/portraits/women/43.jpg',
    quote: 'I learned more in 2 months here than a year elsewhere.'
  },
];

const logos = [
  '/logos/mit.svg',
  '/logos/stanford.svg',
  '/logos/iit.svg',
  '/logos/oxford.svg',
  '/logos/berkeley.svg',
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + i * 0.15,
      duration: 0.7,
      ease: [0.4, 0, 0.2, 1]
    }
  })
};

const TestimonialsSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="testimonials-section" ref={ref}>
      <div className="testimonials-header">
        <h2 className="testimonials-title">Loved by Builders Worldwide</h2>
        <p className="testimonials-subtitle">Real stories from learners, recruiters, and educators</p>
      </div>
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <motion.div
            className="testimonial-card"
            key={t.name}
            custom={i}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={cardVariants}
            whileHover={{
              y: -8,
              boxShadow: '0 8px 32px rgba(99,102,241,0.12)',
              scale: 1.03
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="testimonial-avatar">
              <img src={t.avatar} alt={t.name} />
            </div>
            <div className="testimonial-info">
              <div className="testimonial-name">{t.name}</div>
              <div className="testimonial-role">{t.role}</div>
            </div>
            <div className="testimonial-quote">“{t.quote}”</div>
          </motion.div>
        ))}
      </div>
      <div className="trusted-by-row">
        <span className="trusted-by-label">Trusted by students at:</span>
        <div className="trusted-logos">
          {logos.map((logo, i) => (
            <img src={logo} alt="Trusted University Logo" key={i} className="trusted-logo" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 