import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Notes.css";
import ProjectSuggestions from "./ProjectSuggestions";
import CareerGuidance from "./CareerGuidance";

const Notes = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to EduVerse! I'm Edura, your AI mentor. I can help you with:\n1. Project suggestions\n2. Career guidance\n3. Course recommendations\n4. Code review\n5. FAQs\nHow can I assist you today?",
      sender: "ai",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const chatContainerRef = useRef(null);
  const avatarRef = useRef(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Animate Edura's avatar while processing
    if (avatarRef.current) {
      avatarRef.current.classList.add("processing");
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/ai/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Add auth token
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          message: inputText,
          user_id: localStorage.getItem('user_id'), // Get actual user ID from storage
          channel: {
            id: 'web_chat',
            name: 'Web Chat Interface'
          },
          locale: 'en-US',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('No response received from server');
      }

      const aiMessage = {
        id: messages.length + 2,
        text: data.response,
        sender: "ai",
      };

      // If there are code suggestions, add them as a separate message
      if (data.suggestions && data.suggestions.length > 0) {
        const suggestionMessage = {
          id: messages.length + 3,
          text: "Code Analysis Results:\n" + data.suggestions.join("\n"),
          sender: "ai",
          type: "code-analysis"
        };
        setMessages((prev) => [...prev, aiMessage, suggestionMessage]);
      } else {
        setMessages((prev) => [...prev, aiMessage]);
      }

    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble connecting right now. Please check your connection and authentication, then try again.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      if (avatarRef.current) {
        avatarRef.current.classList.remove("processing");
      }
    }
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    // Voice recognition logic would go here
    setTimeout(() => setIsListening(false), 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProjectSuggestions = () => {
    navigate('/project-suggestions');
  };

  const handleCareerGuidance = () => {
    navigate('/career-guidance');
  };

  return (
    <div className="edura-page">
      <div className="edura-container" ref={chatContainerRef}>
        <div>
          <div className="edura-header">
            <div className="avatar-container" ref={avatarRef}>
              <div className="hologram-effect"></div>
              <div className="avatar-core"></div>
            </div>
            <div>
              <h2 className="edura-title">Edura</h2>
              <p className="edura-tagline">Your Personalized AI Mentor</p>
            </div>
          </div>

          <div className="quick-actions">
            <div className="action-buttons">
              <button className="action-btn" onClick={handleProjectSuggestions}>Project Suggestions</button>
              <button className="action-btn" onClick={handleCareerGuidance}>Career Guidance</button>
              <button className="action-btn">Course Recommendations</button>
            </div>
          </div>
        </div>

        <div className="chat-interface">
          <div className="chat-messages glassmorphism">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className={`message-bubble ${message.type || ''}`}>
                  {message.text.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message ai">
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="input-section glassmorphism">
            <textarea
              className="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything or paste code for review..."
              rows="2"
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
