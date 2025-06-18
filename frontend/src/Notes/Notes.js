import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
import "./Notes.css";

// Message processing utilities
const processMessageContent = (content, messageId) => {
  if (!content || typeof content !== "string") return [];
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  return content.split("\n").map((line, index) => ({
    id: `${messageId || "unknown"}-line-${index}-${timestamp}-${randomSuffix}`,
    content: line || "",
  }));
};

const createMessage = (id, role, content) => ({
  id: id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role: role || "user",
  content: content || "",
  lines: processMessageContent(content || "", id || "unknown"),
  timestamp: Date.now(),
});

const Notes = () => {
  // State management
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const messageEndRef = useRef(null);
  const user_id = "test-user-id";

  // Memoized message processing
  const processedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        lines:
          message.lines || processMessageContent(message.content, message.id),
      })),
    [messages]
  );

  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/ai/health/");
        if (!response.ok) throw new Error("Backend is not available");
        setError(null);
      } catch (err) {
        setError("Backend is not available. Please try again later.");
      }
    };
    checkHealth();
  }, []);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  // Force conversation selection when conversations are loaded
  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      const validConversation = conversations.find(c => c.conversation_id);
      if (validConversation) {
        console.log("✅ Setting default conversation:", validConversation.conversation_id);
        setCurrentConversationId(validConversation.conversation_id);
      }
    }
  }, [conversations, currentConversationId]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/ai/list_conversations/?user_id=${user_id}`
      );
      if (!response.ok) throw new Error("Failed to load conversations");

      const data = await response.json();
      console.log("📋 Conversations response:", data);
      setConversations(data.conversations);

      // Enhanced conversation selection logic
      if (
        (!currentConversationId || !data.conversations.find(c => c.conversation_id === currentConversationId)) &&
        data.conversations.length > 0
      ) {
        const defaultConv = data.conversations.find(c => c.conversation_id);
        if (defaultConv) {
          console.log("✅ Setting default conversation:", defaultConv.conversation_id);
          setCurrentConversationId(defaultConv.conversation_id);
        }
      }
    } catch (err) {
      console.error("❌ Conversation load error:", err);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setIsLoading(true);
      console.log("📦 Loading messages for:", conversationId);
      const response = await fetch(
        `http://localhost:8000/api/ai/get_messages/?conversation_id=${conversationId}`
      );

      console.log("📡 Response status:", response.status);
      if (!response.ok) throw new Error("Failed to load messages");

      const data = await response.json();
      console.log("📨 Message response:", data);

      const messagesWithIds = (data.messages || []).map((msg) =>
        createMessage(msg.id || uuidv4(), msg.role, msg.content)
      );
      setMessages(messagesWithIds);
    } catch (err) {
      console.error("❌ Message load error:", err);
      setError("Failed to load messages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/ai/start_conversation/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user_id,
            title: "New Conversation",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to create conversation");

      const data = await response.json();
      setConversations((prev) => [...prev, data.conversation]);
      setCurrentConversationId(data.conversation.conversation_id);
      setMessages([]);
    } catch (err) {
      setError("Failed to create conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentConversationId || isTyping) return;

    const userMessage = createMessage(uuidv4(), "user", inputText);
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/ai/send_message/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user_id,
            conversation_id: currentConversationId,
            user_input: inputText,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      const aiMessage = createMessage(uuidv4(), "assistant", data.response);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading && !messages.length) {
    return (
      <div className="chat-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Connection Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Sidebar Toggle Button */}
      <button 
        className={`sidebar-toggle ${isSidebarVisible ? 'visible' : 'hidden'}`}
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isSidebarVisible ? (
            <path d="M15 18l-6-6 6-6" />
          ) : (
            <path d="M9 18l6-6-6-6" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarVisible ? 'visible' : 'collapsed'}`}>
        <div className="sidebar-header">
          <button 
            className="new-chat-button"
            onClick={createNewConversation} 
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Chat
          </button>
        </div>
        
        <div className="conversations-list">
          {conversations.length === 0 && !isLoading ? (
            <div className="no-conversations">
              <div className="empty-icon">💬</div>
              <p>No conversations yet</p>
              <p>Start your first chat!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.conversation_id || `conv-${Date.now()}-${Math.random()}`}
                className={`conversation-item ${
                  conv.conversation_id === currentConversationId ? "active" : ""
                }`}
                onClick={() => setCurrentConversationId(conv.conversation_id)}
                data-conversation-id={conv.conversation_id}
              >
                <div className="conversation-title">
                  {conv.title || "Untitled Conversation"}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`chat-main ${!isSidebarVisible ? 'expanded' : ''}`}>
        {/* Messages Container */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">🤖</div>
              <h1>Welcome to Edura</h1>
              <p>Your AI learning companion</p>
              <p>Ask anything about programming, projects, or learning!</p>
            </div>
          ) : (
            <div className="messages-list">
              {processedMessages.map((message) => (
                <div
                  key={message.id || `msg-${Date.now()}-${Math.random()}`}
                  className={`message-wrapper ${message.role}`}
                  data-message-id={message.id}
                >
                  <div className="message-bubble">
                    <div className="message-content">
                      {message.lines.map((line) => (
                        <div
                          key={line.id || `line-${Date.now()}-${Math.random()}`}
                          className="message-line"
                          data-line-id={line.id}
                        >
                          {line.content || ""}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="message-wrapper assistant">
                  <div className="message-bubble typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">Edura is thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messageEndRef} className="scroll-anchor" />
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="input-container">
          {!currentConversationId && conversations.length > 0 && (
            <div className="input-disabled-message">
              Please select a conversation to start chatting
            </div>
          )}
          
          <div className="input-wrapper">
            <textarea
              className="message-input"
              placeholder="Ask Edura anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isTyping || !currentConversationId}
              rows={1}
            />
            <button
              className={`send-button ${inputText.trim() && !isTyping && currentConversationId ? 'active' : ''}`}
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping || !currentConversationId}
              title="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notes;
