import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Help.css';

const Help = () => {
  // State for form data including name field as it may be useful for user experience
  // even though backend expects subject instead of name
  const [formData, setFormData] = useState({
    name: '', // Keeping name for UX purposes
    subject: '', // Required by backend
    email: '',
    message: '',
  });
  // State for feedback messages to user
  const [feedback, setFeedback] = useState('');
  // Loading state for submit button
  const [isLoading, setIsLoading] = useState(false);
  // State to store FAQs from backend
  const [faqs, setFaqs] = useState([]);

  // Fetch FAQs from backend on component mount
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/profiles/faqs/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFaqs(response.data.faqs);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };
    fetchFaqs();
  }, []);

  // Handle changes in form inputs
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
      // Prepare data for backend - use name as subject if no subject provided
      const submitData = {
        subject: formData.subject || formData.name, // Use name as fallback for subject
        email: formData.email,
        message: formData.message
      };

      // Send request to backend
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/profiles/submit-support-request/', submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle successful submission
      setFeedback(`Support request submitted successfully! Ticket ID: ${response.data.ticket_id}`);
      
      // Reset form
      setFormData({
        name: '',
        subject: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle different error cases
      if (error.response?.status === 400) {
        setFeedback('Please fill in all required fields.');
      } else {
        setFeedback('Failed to submit support request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="help-container">
      {/* Main heading */}
      <h2>Help {'&'} Support</h2>

      {/* FAQ section */}
      <section className="faq-section">
        <h3>Frequently Asked Questions</h3>
        <ul>
          {/* Map through FAQs from backend */}
          {faqs.map((faq, index) => (
            <li key={index}>
              <strong>{faq.question}</strong> - {faq.answer}
            </li>
          ))}
          <li>
            <strong>How do I contact support?</strong> - Use the form below to send us a message.
          </li>
        </ul>
      </section>

      {/* Contact form section */}
      <section className="contact-section">
        <h3>Contact Support</h3>
        <form onSubmit={handleSubmit}>
          {/* Name field */}
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

          {/* Subject field - hidden but used for backend compatibility */}
          <input
            type="hidden"
            name="subject"
            value={formData.subject}
          />

          {/* Email field */}
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

          {/* Message field */}
          <div className="input-group">
            <label>Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Submit button */}
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        {/* Feedback message */}
        {feedback && <p className="feedback">{feedback}</p>}
      </section>
    </div>
  );
};

export default Help;
