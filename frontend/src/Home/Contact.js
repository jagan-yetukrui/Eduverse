import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "", subject: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // You can replace this with actual email sending logic (e.g. EmailJS, backend API)
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form after showing success message
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({ name: "", email: "", message: "", subject: "" });
      }, 3000);
    }, 1500);
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title">Get in Touch</h1>
      <p className="contact-description">
        We value your feedback and inquiries. Our team is ready to assist you with any questions you may have.
      </p>

      {submitSuccess ? (
        <div className="success-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <p>Thank you for reaching out! We'll get back to you shortly.</p>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="What is this regarding?"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Please describe your inquiry in detail"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="loading-spinner">Sending...</span>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      )}

      <div className="contact-alt">
        <div className="contact-method">
          <div className="contact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div>
            <h3>Email Us</h3>
            <p><a href="mailto:support@edu-verse.in">support@edu-verse.in</a></p>
          </div>
        </div>
        
        <div className="contact-method">
          <div className="contact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div>
            <h3>Visit Us</h3>
            <p>George Mason University, Fairfax, VA 22030</p>
          </div>
        </div>
        
        <div className="contact-method">
          <div className="contact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div>
            <h3>Social Media</h3>
            <p>Connect with us on <a href="https://instagram.com/eduverse" target="_blank" rel="noopener noreferrer">Instagram</a> or <a href="https://linkedin.com/company/eduverse" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
