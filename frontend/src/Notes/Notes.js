import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../Accounts/UserContext";
import { useNavigate } from "react-router-dom";
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

// --------------------------------------------
// Module-level caches to prevent duplicate API
// requests across React 18 Strict-Mode double
// mounting in development. Because these
// variables live outside the component they
// persist between the test mount/unmount cycle
// but reset on full page reload, which matches
// expected behaviour.
// --------------------------------------------
let _healthCheckedOnce = false;
let _loadedConversationsUserId = null; // remembers which user_id we fetched for
const _messagesFetchedOnce = {}; // key: conversationId -> true

const Notes = () => {
  // Get authenticated user
  const { user, isLoading: userLoading } = useUser();
  const navigate = useNavigate();

  // State management
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [renameError, setRenameError] = useState(null);

  const messageEndRef = useRef(null);

  // Get user ID from authenticated user
  const user_id = user?.id || user?.user_id;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/login");
    }
  }, [user, userLoading, navigate]);

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

  // Local refs fallback for non-Strict builds; actual caching
  // is stored in module-level variables above.
  const hasCheckedHealthRef = useRef(false);
  const hasLoadedConversationsRef = useRef(false);
  const fetchedMessagesRef = useRef({});

  // Run backend health-check once per mount (even in Strict-Mode)
  useEffect(() => {
    if (_healthCheckedOnce || hasCheckedHealthRef.current) return; // already ran
    _healthCheckedOnce = true;
    hasCheckedHealthRef.current = true;

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

  // Load conversations **once** after user is available
  useEffect(() => {
    if (!user_id || userLoading) return;

    if (
      _loadedConversationsUserId === user_id ||
      hasLoadedConversationsRef.current
    )
      return;
    _loadedConversationsUserId = user_id;
    hasLoadedConversationsRef.current = true;
    loadConversations();
  }, [user_id, userLoading]);

  /*
   * Load messages for the selected conversation.
   * In dev Strict-Mode the component mounts twice, which would
   * otherwise call loadMessages twice.  We cache which conversation
   * IDs we have already fetched in this render cycle to avoid
   * redundant GETs while still allowing refetch if a user actively
   * re-selects the conversation (we clear the cache on send / reload
   * events that update messages state).
   */
  useEffect(() => {
    if (!currentConversationId) return;

    // If we already fetched messages for this conversation during
    // the current lifecycle, skip.
    if (
      _messagesFetchedOnce[currentConversationId] ||
      fetchedMessagesRef.current[currentConversationId]
    )
      return;

    _messagesFetchedOnce[currentConversationId] = true;
    fetchedMessagesRef.current[currentConversationId] = true;
    loadMessages(currentConversationId);
  }, [currentConversationId]);

  // Whenever we send a new message or delete a conversation we
  // may want to refetch later, so clear the message-fetch cache
  // to allow a fresh network request next time it's selected.
  const clearMessageCacheForConversation = (convId) => {
    if (convId) {
      delete fetchedMessagesRef.current[convId];
      delete _messagesFetchedOnce[convId];
    }
  };

  // Clear cache after send so a later manual refresh will refetch
  useEffect(() => {
    if (!isTyping && currentConversationId) {
      clearMessageCacheForConversation(currentConversationId);
    }
  }, [isTyping, currentConversationId]);

  // Force conversation selection when conversations are loaded
  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      const validConversation = conversations.find((c) => c.conversation_id);
      if (validConversation) {
        console.log(
          "✅ Setting default conversation:",
          validConversation.conversation_id
        );
        setCurrentConversationId(validConversation.conversation_id);
      }
    }
  }, [conversations, currentConversationId]);

  const loadConversations = async () => {
    if (!user_id) {
      console.log("❌ No user ID available, skipping conversation load");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/ai/list_conversations/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to load conversations");

      const data = await response.json();
      console.log("📋 Conversations response:", data);
      setConversations(data.conversations);

      // Enhanced conversation selection logic
      if (
        (!currentConversationId ||
          !data.conversations.find(
            (c) => c.conversation_id === currentConversationId
          )) &&
        data.conversations.length > 0
      ) {
        const defaultConv = data.conversations.find((c) => c.conversation_id);
        if (defaultConv) {
          console.log(
            "✅ Setting default conversation:",
            defaultConv.conversation_id
          );
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
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8000/api/ai/get_messages/?conversation_id=${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
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
    if (!user_id) {
      setError("Please log in to create conversations.");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "http://localhost:8000/api/ai/start_conversation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "New Conversation",
          }),
        }
      );

      if (response.status === 403) {
        const errorData = await response.json();
        alert(
          errorData.message ||
            "Maximum 10 conversations allowed. Please delete some conversations to create a new one."
        );
        return;
      }

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
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "http://localhost:8000/api/ai/send_message/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
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

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation(); // Prevent conversation selection

    if (
      !window.confirm(
        "Are you sure you want to delete this conversation? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "http://localhost:8000/api/ai/delete_conversation/",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: conversationId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete conversation");
      }

      // Remove from conversations list
      setConversations((prev) =>
        prev.filter((conv) => conv.conversation_id !== conversationId)
      );

      // If the deleted conversation was the current one, switch to first remaining
      if (currentConversationId === conversationId) {
        const remainingConversations = conversations.filter(
          (conv) => conv.conversation_id !== conversationId
        );
        if (remainingConversations.length > 0) {
          setCurrentConversationId(remainingConversations[0].conversation_id);
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("❌ Delete conversation error:", err);
      setError("Failed to delete conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameConversation = async (conversationId, newTitle) => {
    if (!newTitle.trim()) {
      setRenameError("Title cannot be empty");
      return;
    }

    // Find the current conversation to check if title actually changed
    const currentConversation = conversations.find(
      (conv) => conv.conversation_id === conversationId
    );
    if (currentConversation && currentConversation.title === newTitle.trim()) {
      // Title hasn't changed, just exit edit mode
      setEditingConversationId(null);
      setEditingTitle("");
      setRenameError(null);
      return;
    }

    try {
      setRenameError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        "http://localhost:8000/api/ai/rename_conversation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            new_title: newTitle.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to rename conversation");
      }

      // Update conversation title in state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversation_id === conversationId
            ? { ...conv, title: newTitle.trim() }
            : conv
        )
      );

      // Exit edit mode
      setEditingConversationId(null);
      setEditingTitle("");
    } catch (err) {
      console.error("❌ Rename conversation error:", err);
      setRenameError(err.message || "Failed to rename conversation");
    }
  };

  const startEditing = (conversationId, currentTitle) => {
    setEditingConversationId(conversationId);
    setEditingTitle(currentTitle || "");
    setRenameError(null);
  };

  const cancelEditing = () => {
    setEditingConversationId(null);
    setEditingTitle("");
    setRenameError(null);
  };

  const handleTitleKeyDown = (e, conversationId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameConversation(conversationId, editingTitle);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
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
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
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
        className={`sidebar-toggle ${isSidebarVisible ? "visible" : "hidden"}`}
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        aria-label="Toggle sidebar"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {isSidebarVisible ? (
            <path d="M15 18l-6-6 6-6" />
          ) : (
            <path d="M9 18l6-6-6-6" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar ${isSidebarVisible ? "visible" : "collapsed"}`}
      >
        <div className="sidebar-header">
          <button
            className={`new-chat-button ${
              conversations.length >= 10 ? "disabled" : ""
            }`}
            onClick={createNewConversation}
            disabled={isLoading || conversations.length >= 10}
            title={
              conversations.length >= 10
                ? "Maximum 10 conversations reached. Delete some to create new ones."
                : "Start a new conversation"
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Chat
          </button>
          <div
            className={`conversation-count ${
              conversations.length >= 10 ? "limit-reached" : ""
            }`}
          >
            {conversations.length}/10 conversations
            {conversations.length >= 10 && (
              <span className="limit-warning"> (Limit reached)</span>
            )}
          </div>
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
                key={
                  conv.conversation_id || `conv-${Date.now()}-${Math.random()}`
                }
                className={`conversation-item ${
                  conv.conversation_id === currentConversationId ? "active" : ""
                }`}
                onClick={() => setCurrentConversationId(conv.conversation_id)}
                data-conversation-id={conv.conversation_id}
              >
                {editingConversationId === conv.conversation_id ? (
                  <div className="conversation-edit">
                    <input
                      type="text"
                      className="title-edit-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) =>
                        handleTitleKeyDown(e, conv.conversation_id)
                      }
                      onBlur={() =>
                        handleRenameConversation(
                          conv.conversation_id,
                          editingTitle
                        )
                      }
                      autoFocus
                      maxLength={50}
                    />
                    {renameError && (
                      <div className="rename-error">{renameError}</div>
                    )}
                  </div>
                ) : (
                  <div
                    className="conversation-title"
                    onDoubleClick={() =>
                      startEditing(conv.conversation_id, conv.title)
                    }
                    title="Double-click to rename"
                  >
                    {conv.title || "Untitled Conversation"}
                  </div>
                )}

                <div className="conversation-actions">
                  <button
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(conv.conversation_id, conv.title);
                    }}
                    title="Rename conversation"
                    disabled={isLoading}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="delete-button"
                    onClick={(e) =>
                      handleDeleteConversation(conv.conversation_id, e)
                    }
                    title="Delete conversation"
                    disabled={isLoading}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`chat-main ${!isSidebarVisible ? "expanded" : ""}`}>
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
              className={`send-button ${
                inputText.trim() && !isTyping && currentConversationId
                  ? "active"
                  : ""
              }`}
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping || !currentConversationId}
              title="Send message"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notes;
