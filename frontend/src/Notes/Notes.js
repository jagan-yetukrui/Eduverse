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
  // Fixed: Added unique key props to all list items - v2
  // State management
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="notes-page" data-component="notes-main">
      <div className="sidebar">
        <button onClick={createNewConversation} disabled={isLoading}>
          + New Chat
        </button>
        {(conversations || []).map((conv) => (
          <div
            key={conv.conversation_id || `conv-${Date.now()}-${Math.random()}`}
            className={`conversation ${
              conv.conversation_id === currentConversationId ? "active" : ""
            }`}
            onClick={() => setCurrentConversationId(conv.conversation_id)}
            data-conversation-id={conv.conversation_id}
          >
            {conv.title || "Untitled Conversation"}
          </div>
        ))}
        {conversations.length === 0 && !isLoading && (
          <div className="no-conversations">
            <p>No conversations yet</p>
            <p>Click "New Chat" to start!</p>
          </div>
        )}
      </div>

      <div className="chat-section" data-section="messages">
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info" style={{padding: '10px', background: '#f0f0f0', fontSize: '12px'}}>
            <strong>Debug:</strong> Current Conversation ID: {currentConversationId || 'None'} | 
            Conversations: {conversations.length} | 
            Messages: {messages.length} | 
            Typing: {isTyping ? 'Yes' : 'No'}
          </div>
        )}
        
        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>Start a new conversation with Edura</p>
              <p>Ask anything about programming, projects, or learning!</p>
            </div>
          ) : (
            <React.Fragment>
              {(processedMessages || []).map((message) => (
                <div
                  key={message.id || `msg-${Date.now()}-${Math.random()}`}
                  className={`message ${message.role || "user"}`}
                  data-message-id={message.id}
                >
                  {(message.lines || []).map((line) => (
                    <div
                      key={line.id || `line-${Date.now()}-${Math.random()}`}
                      className="message-line"
                      data-line-id={line.id}
                    >
                      {line.content || ""}
                    </div>
                  ))}
                </div>
              ))}
            </React.Fragment>
          )}
          {isTyping && (
            <div className="typing">
              <span>Edura is typing</span>
              <span className="dots">...</span>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        <div className="input-section">
          {!currentConversationId && conversations.length > 0 && (
            <div className="input-disabled-message" style={{color: '#666', fontSize: '12px', marginBottom: '5px'}}>
              Please select a conversation to start chatting
            </div>
          )}
          <textarea
            placeholder="Ask Edura anything..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isTyping || !currentConversationId}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping || !currentConversationId}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notes;
