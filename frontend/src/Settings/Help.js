import React, { useState } from 'react';
import axios from 'axios';
import './Help.css';

const Help = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5002/api/help/contact', formData);
      if (response.status === 200) {
        setFeedback('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFeedback('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setFeedback('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="help-container">
      <h2>Help & Support</h2>

      <section className="faq-section">
        <h3>Frequently Asked Questions</h3>
        <ul>
          <li><strong>How can I reset my password?</strong> - Go to the settings page and follow the instructions under "Account Security."</li>
          <li><strong>How can I change my notification settings?</strong> - You can modify your notification preferences in the notifications section of the settings page.</li>
          <li><strong>How do I contact support?</strong> - Use the form below to send us a message.</li>
          {/* Add more FAQs as needed */}
        </ul>
      </section>

      <section className="contact-section">
        <h3>Contact Support</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        {feedback && <p className="feedback">{feedback}</p>}
      </section>
    </div>
  );
};

export default Help;
