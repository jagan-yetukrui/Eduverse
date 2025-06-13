import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Notes.css";
// eslint-disable-next-line no-unused-vars
import ProjectSuggestions from "./ProjectSuggestions";
// eslint-disable-next-line no-unused-vars
import CareerGuidance from "./CareerGuidance";

const Notes = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 0,
      text: "💡 Hey Dreamer,\nWelcome to Edura – your personal AI guide in the EduVerse.\nAsk anything. Build everything. Let's unlock your journey together. ✨",
      sender: "ai",
      isWelcome: true,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const avatarRef = useRef(null);
  const messageEndRef = useRef(null);
  const sendButtonRef = useRef(null);

  const suggestions = [
    "Suggest a trending project",
    "How do I build a portfolio?",
    "Analyze my progress",
  ];

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Background stars effect
  useEffect(() => {
    const createStars = () => {
      const starsContainer = document.createElement("div");
      starsContainer.className = "stars-background";

      for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        starsContainer.appendChild(star);
      }

      document.querySelector(".notes-page").appendChild(starsContainer);
    };

    createStars();

    return () => {
      const starsContainer = document.querySelector(".stars-background");
      if (starsContainer) {
        starsContainer.remove();
      }
    };
  }, []);

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
    setShowSuggestions(false);

    if (avatarRef.current) {
      avatarRef.current.classList.add("casting-spell");
    }

    if (sendButtonRef.current) {
      sendButtonRef.current.classList.add("sending");
      setTimeout(() => {
        sendButtonRef.current.classList.remove("sending");
      }, 1000);
    }

    try {
      const response = await fetch("http://localhost:8000/api/ai/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          message: inputText,
          user_id: localStorage.getItem("user_id"),
          channel: {
            id: "web_chat",
            name: "Edura Interface",
          },
          locale: "en-US",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Request failed! Status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error("No response received from the server");
      }

      const aiMessage = {
        id: messages.length + 2,
        text: data.response,
        sender: "ai",
      };

      if (data.suggestions?.length > 0) {
        const suggestionMessage = {
          id: messages.length + 3,
          text: data.suggestions.join("\n"),
          sender: "ai",
          type: "suggestion-scroll",
        };
        setMessages((prev) => [...prev, aiMessage, suggestionMessage]);
      } else {
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: error.message || "Connection lost. Please try again later.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      if (avatarRef.current) {
        avatarRef.current.classList.remove("casting-spell");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="notes-page">
      <div className="notes-container">
        {/* Top Section (Fixed) */}
        <div className="quest-board">
          <button
            className="quest-btn"
            onClick={() => navigate("/project-suggestions")}
            title="Explore coding projects and challenges"
          >
            <span className="quest-icon">🧭</span>
            <span>Explore Projects</span>
          </button>

          <button
            className="quest-btn"
            onClick={() => navigate("/career-guidance")}
            title="Track your learning progress and growth"
          >
            <span className="quest-icon">📊</span>
            <span>My Progress</span>
          </button>

          <button
            className="quest-btn"
            title="Coming soon: Create projects with AI assistance"
            disabled
          >
            <span className="quest-icon">🪄</span>
            <span>AI Create Lab (soon)</span>
          </button>
        </div>

        {/* Welcome Message (Fixed) */}
        <div className="notes-header fade-in">
          <div className="avatar-orb" ref={avatarRef}>
            <div className="orb-aura"></div>
            <div className="orb-core"></div>
          </div>
          <h2>🚀 Ask questions. Get suggestions. Level up with Edura!</h2>
        </div>

        {/* Chat Feed (Scrollable) */}
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-item fade-in ${
                message.sender === "user" ? "user-message" : "ai-message"
              } ${message.isWelcome ? "welcome-message" : ""}`}
            >
              <div
                className={`message-bubble ${message.sender} ${
                  message.type || ""
                }`}
              >
                {message.text.split("\n").map((line, i) => (
                  <div key={i} className="message-line">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-item typing fade-in">
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Bottom Section */}
        <div className="note-input">
          {/* Suggestions */}
          {showSuggestions && (
            <div className="suggestions-bar">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-pill"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="input-area">
            <textarea
              className="note-textarea"
              placeholder="Ask Edura anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button
              ref={sendButtonRef}
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