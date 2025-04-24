import React from "react";
import "./Message.css";

const Messages = () => {
  return (
    <div className="messages-container">
      <div className="coming-soon-container">
        <h1>Messaging Platform Under Development</h1>
        <p>Our development team is currently implementing a comprehensive messaging system to enhance your collaboration experience.</p>
        <p>We will notify all users when this feature becomes available.</p>
        <div className="coming-soon-details">
          <h3>Upcoming Functionality:</h3>
          <ul>
            <li>Secure real-time communication between platform users</li>
            <li>Advanced search capabilities for efficient networking</li>
            <li>Intuitive interface designed for professional communication</li>
            <li>Customizable notification system for message management</li>
          </ul>
        </div>
        <p className="coming-soon-footer">We appreciate your understanding as we work to deliver this essential feature.</p>
      </div>
    </div>
  );
};

export default Messages;
