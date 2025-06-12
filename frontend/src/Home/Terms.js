import React from "react";
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-container">
      <h1 className="terms-title">Terms of Service</h1>

      <section className="terms-section">
        <h2>1. Introduction</h2>
        <p>
          Welcome to EduVerse. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read these terms carefully before proceeding to use our services.
        </p>
      </section>

      <section className="terms-section">
        <h2>2. Eligibility</h2>
        <p>
          EduVerse is available to students, educators, professionals, and organizations in the education sector. Users under the age of 13 must obtain verifiable parental consent before accessing our services, in compliance with applicable laws.
        </p>
      </section>

      <section className="terms-section">
        <h2>3. Permitted Activities</h2>
        <ul>
          <li>Share educational projects, services, or research findings</li>
          <li>Establish professional connections with peers, mentors, and industry experts</li>
          <li>Utilize Edura, our artificial intelligence assistant, for educational guidance</li>
          <li>Explore career opportunities and collaborative ventures</li>
        </ul>
      </section>

      <section className="terms-section">
        <h2>4. Prohibited Activities</h2>
        <p>
          The following activities are strictly prohibited on EduVerse:
        </p>
        <ul className="prohibited-list">
          <li>Engaging in harmful, abusive, or misleading behavior</li>
          <li>Distributing content without proper authorization or rights</li>
          <li>Attempting to compromise, reverse-engineer, or exploit EduVerse systems</li>
          <li>Violating the intellectual property rights of others</li>
        </ul>
      </section>

      <section className="terms-section">
        <h2>5. Intellectual Property Rights</h2>
        <p>
          Users retain ownership of all content they create and share on EduVerse. By posting content on our platform, you grant EduVerse a non-exclusive, royalty-free license to display, distribute, and promote such content within the scope of our services.
        </p>
      </section>

      <section className="terms-section">
        <h2>6. Account Termination</h2>
        <p>
          EduVerse reserves the right to suspend or terminate accounts that violate these Terms of Service. We will provide notice when possible, and users may appeal such decisions through our designated channels.
        </p>
      </section>

      <section className="terms-section">
        <h2>7. Modifications to Terms</h2>
        <p>
          We may modify these terms periodically to reflect changes in our services or legal requirements. Significant changes will be communicated to users through the platform, and continued use after such notifications constitutes acceptance of the updated terms.
        </p>
      </section>

      <p className="terms-footer">
        For inquiries regarding these Terms of Service, please contact <a href="mailto:support@edu-verse.in">support@edu-verse.in</a>
      </p>
    </div>
  );
};

export default Terms;