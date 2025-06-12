import React from "react";
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-container">
      <h1 className="privacy-title">🔐Privacy Policy</h1>
      
      <div className="privacy-introduction">
        <p>Last updated: June 2023</p>
        <p>This Privacy Policy describes how EduVerse ("we", "us", or "our") collects, uses, and protects your personal information.</p>
      </div>

      <section className="privacy-section">
        <h2>1. Data Ownership & Control</h2>
        <p>
          At EduVerse, we are committed to transparency and respect for your privacy rights. We adhere to the principle that your data belongs to you, collecting only information necessary to provide our services effectively, including profile development, opportunity matching, and personalization of your educational journey.
        </p>
      </section>

      <section className="privacy-section">
        <h2>2. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>Personal identifiers (name, email address, contact information)</li>
          <li>Professional and educational information (skills, projects, academic background)</li>
          <li>Platform usage data and analytics (to enhance user experience)</li>
          <li>Optional third-party connections (university affiliations, professional networks)</li>
        </ul>
      </section>

      <section className="privacy-section">
        <h2>3. How We Process Your Information</h2>
        <p>Your information enables us to:</p>
        <ul>
          <li>Facilitate relevant project and peer matching based on your profile</li>
          <li>Provide personalized AI-powered guidance through our Edura system</li>
          <li>Connect qualified candidates with appropriate recruitment opportunities</li>
          <li>Continuously improve and optimize the EduVerse platform experience</li>
          <li>Communicate important updates and educational opportunities</li>
        </ul>
      </section>

      <section className="privacy-section">
        <h2>4. Our Data Commitments</h2>
        <p>We are firmly committed to the following principles:</p>
        <ul className="commitment-list">
          <li><span className="commitment-negative">We do not sell your personal data to third parties</span></li>
          <li><span className="commitment-negative">We do not engage in cross-site tracking or surveillance</span></li>
          <li><span className="commitment-negative">We do not share your information without explicit consent</span></li>
          <li><span className="commitment-positive">We implement industry-standard security measures</span></li>
        </ul>
      </section>

      <section className="privacy-section">
        <h2>5. Your Privacy Rights</h2>
        <p>
          You maintain complete control over your personal information. Our platform provides tools to access, edit, or delete your data at any time. If you wish to have your account completely removed from our systems, you may submit a request through our support channels. We are dedicated to honoring your data rights promptly and transparently.
        </p>
      </section>

      <section className="privacy-section">
        <h2>6. Policy Updates</h2>
        <p>
          As our services evolve, we may update this Privacy Policy to reflect changes in our practices or regulatory requirements. Any significant changes will be communicated clearly through our platform, with prominent notifications to ensure you remain informed about how we protect your information.
        </p>
      </section>

      <section className="privacy-section">
        <h2>7. Data Security</h2>
        <p>
          We employ comprehensive technical and organizational measures to protect your information from unauthorized access, loss, or alteration. While no system is completely impenetrable, we continuously review and enhance our security protocols to safeguard your data.
        </p>
      </section>

      <div className="privacy-footer">
        <p>
          For any privacy-related inquiries or to exercise your data rights, please contact our Data Protection team at <a href="mailto:privacy@edu-verse.in">privacy@edu-verse.in</a>
        </p>
      </div>
    </div>
  );
};

export default Privacy;
