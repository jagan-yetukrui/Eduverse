import React, { useState, useEffect, useRef } from "react";
import "./Notes.css";

const Notes = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to EduVerse! I'm Edura, your AI mentor. How can I assist you today?",
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
      setTimeout(() => {
        const aiMessage = {
          id: messages.length + 2,
          text: "I understand you're interested in learning. Let me analyze your query and provide personalized recommendations.",
          sender: "ai",
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
        if (avatarRef.current) {
          avatarRef.current.classList.remove("processing");
        }
      }, 1500);
    } catch (error) {
      console.error("Error getting AI response:", error);
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

  return (
    <div className="edura-page">
      <div className="edura-container" ref={chatContainerRef}>
        <div className="edura-header">
          <div className="avatar-container" ref={avatarRef}>
            <div className="hologram-effect"></div>
            <div className="avatar-core"></div>
          </div>
          <h1 className="edura-title">Edura</h1>
          <div className="edura-div"></div>
          <p className="edura-tagline">Your Personalized AI Mentor</p>
        </div>

        <div className="quick-actions">
          {/* <h3>Suggested Actions</h3> */}
          <div className="action-buttons">
            <button className="action-btn">Complete Profile</button>
            <button className="action-btn">Explore Courses</button>
            <button className="action-btn">Find Collaborators</button>
          </div>
        </div>

        <div className="chat-interface">
          <div className="chat-messages glassmorphism">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-bubble">{message.text}</div>
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
              placeholder="Ask me anything..."
              rows="2"
            />
            {/* <button
            className={`voice-input ${isListening ? "listening" : ""}`}
            onClick={handleVoiceInput}
          >
            <span className="microphone-icon"></span>
          </button> */}
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
