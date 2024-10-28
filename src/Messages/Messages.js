import React, { useState, useEffect } from 'react';
import './Message.css';

const Messages = () => {
  const [chats, setChats] = useState([]); // Array to hold chat data
  const [message, setMessage] = useState(''); // Current message
  const [selectedChat, setSelectedChat] = useState(null); // Currently selected chat

  // Simulated chat data (replace with real data/API call)
  useEffect(() => {
    const fetchedChats = [
      { id: 1, name: 'John Doe', messages: ['Hello!', 'How are you?'] },
      { id: 2, name: 'Jane Smith', messages: ['Hey!', 'Let’s meet up!'] },
    ];
    setChats(fetchedChats);
  }, []);

  const handleMessageSend = (e) => {
    e.preventDefault();
    if (message && selectedChat) {
      // Update the chat with the new message
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, messages: [...chat.messages, message] }
            : chat
        )
      );
      setMessage(''); // Clear input field
    }
  };

  return (
    <div className="messages-container">
      {/* Sidebar showing list of chats */}
      <div className="chats-list">
        <h2>Messages</h2>
        <ul>
          {chats.map((chat) => (
            <li key={chat.id} onClick={() => setSelectedChat(chat)}>
              {chat.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <h3>{selectedChat.name}</h3>
            </div>
            <div className="chat-messages">
              {selectedChat.messages.map((msg, index) => (
                <div key={index} className="chat-message">
                  {msg}
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
          <div className="no-chat-selected">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
};

export default Messages;
