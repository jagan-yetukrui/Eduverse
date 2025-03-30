import React, { useState, useEffect, useRef } from "react";
import "./Message.css";

import mockchat from "../mockdata/chat.json";
import placeholder from "../images/placeholder.png";

const Messages = () => {
  const [chats, setChats] = useState(mockchat);
  // const [chats, setChats] = useState([]);
  const [message, setMessage] = useState(""); // Current message
  const [selectedChat, setSelectedChat] = useState(null); // Currently selected chat
  const [searchTerm, setSearchTerm] = useState(""); // Search term for finding users
  const [searchResults, setSearchResults] = useState([]); // Search results for users

  // Fetch real chats from backend
  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch("/api/chats");
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  // Search real users from backend
  const searchUsers = async (term) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/users/search?term=${term}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
      searchUsers(term);
    } else {
      setSearchResults([]);
    }
  };

  const startNewChat = async (user) => {
    try {
      if (!chats.find((chat) => chat.id === user.id)) {
        // Replace with your actual API endpoint
        const response = await fetch("/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });
        const newChat = await response.json();
        setChats((prev) => [...prev, newChat]);
      }
      setSelectedChat(chats.find((chat) => chat.id === user.id) || user);
      setSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  const handleMessageSend = async (e) => {
    e.preventDefault();
    if (message && selectedChat) {
      try {
        // Replace with your actual API endpoint
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: selectedChat.id,
            text: message,
          }),
        });

        const newMessage = await response.json();

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChat.id
              ? { ...chat, messages: [...chat.messages, newMessage] }
              : chat
          )
        );
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className="messages-container">
      <div className="chats-list">
        <div className="search-container-messages">
          <h3>Messages</h3>
          <div className="divider-horizontal"></div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="search-result-item"
                  onClick={() => startNewChat(user)}
                >
                  <img
                    // src={user.avatar}
                    src={placeholder}
                    alt={user.name}
                    className="user-avatar"
                  />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chats-scroll">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${
                selectedChat?.id === chat.id ? "active" : ""
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <img src={placeholder} alt={chat.name} className="user-avatar" />
              <div className="chat-info">
                <div className="chat-header">
                  <span className="chat-name">{chat.name}</span>
                  <span className="last-active">
                    Last Active {chat.lastActive}
                  </span>
                </div>
                {chat.messages.length > 0 && (
                  <p className="last-message">
                    {chat.messages[chat.messages.length - 1].text}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-window">
        {selectedChat ? (
          <>
            <div className="selected-chat-header">
              <img
                // src={selectedChat.avatar}
                src={placeholder}
                alt={selectedChat.name}
                className="user-avatar"
              />
              <div className="header-info">
                <h3>{selectedChat.name}</h3>
                <span className="status">
                  Last Active {selectedChat.lastActive}
                </span>
              </div>
            </div>

            <div className="chat-messages">
              {selectedChat.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    msg.sender === "You" ? "sent" : "received"
                  }`}
                >
                  <div className="message-content">
                    <p>{msg.content}</p>
                    <span className="timestamp">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              
            </div>

            <form onSubmit={handleMessageSend} className="message-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Welcome to Messages</h3>
            <p>
              Select a chat to start messaging or search for new people to
              connect with!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
