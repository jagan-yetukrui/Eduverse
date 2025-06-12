import React, { useState, useRef, useEffect } from "react";
import "./Notes.css";

const Notes = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello Dreamer 👋' }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      sender: "user",
      text: inputText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const error = false;
      if (error) {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: '⚠ Unable to connect to Edura. Please try again later.' 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: "I am unable to connect to Edura. Please try again later." 
        }]);
      }
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Chat Feed */}
        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-item ${
                message.sender === "user" ? "user-message" : "ai-message"
              }`}
            >
              <div className="message-bubble">
                {message.text.split("\n").map((line, i) => (
                  <div key={i} className="message-line">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-item ai-message">
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Input Section */}
        <div className="input-section">
          <div className="input-area">
            <textarea
              className="chat-input"
              placeholder="Ask about your current project step..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
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