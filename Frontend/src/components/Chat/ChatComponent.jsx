import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, UserPlus2 } from 'lucide-react';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('chatUsername');
    if (storedUsername) {
      setUsername(storedUsername);
      connectToChat(storedUsername);
    }
  }, []);

  const connectToChat = (user) => {
    socket.current = io('http://localhost:4000', {
      transports: ['polling', 'websocket']
    });

    socket.current.on('connect', () => {
      setIsConnected(true);
      socket.current.emit('userJoin', { username: user });
    });

    socket.current.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    socket.current.on('messageHistory', (history) => {
      setMessages(history);
      scrollToBottom();
    });

    socket.current.on('userList', (userList) => {
      setUsers(userList);
    });

    socket.current.on('userTyping', ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(username);
        } else {
          newSet.delete(username);
        }
        return newSet;
      });
    });

    socket.current.on('disconnect', () => {
      setIsConnected(false);
    });
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('chatUsername', username);
      connectToChat(username);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && socket.current?.connected) {
      socket.current.emit('message', inputMessage);
      setInputMessage('');
    }
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    if (socket.current?.connected) {
      socket.current.emit('typing', true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.current.emit('typing', false);
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!username || !isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-gray-900 p-6 rounded-lg">
        <form onSubmit={handleUsernameSubmit} className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Join the Chat</h2>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="mb-4"
          />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Join Chat
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      {/* Users Sidebar */}
      <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserPlus2 size={20} />
          Online Users ({users.length})
        </h3>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.userId} className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 bg-blue-600">
                <span className="text-sm">{user.username[0].toUpperCase()}</span>
              </Avatar>
              <span className="text-sm text-white">{user.username}</span>
              {user.isTyping && (
                <span className="text-xs text-gray-400 italic">typing...</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex ${msg.userId === socket.current?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg p-3 max-w-[70%] ${
                  msg.type === 'system'
                    ? 'bg-gray-700 text-gray-300 text-center w-full'
                    : msg.userId === socket.current?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {msg.type !== 'system' && (
                  <p className="text-sm opacity-70 mb-1">{msg.username}</p>
                )}
                <p>{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="px-4 py-2 text-sm text-gray-400 italic">
            {Array.from(typingUsers).join(', ')} typing...
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={inputMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 text-white border-gray-700"
            />
            <Button
              type="submit"
              disabled={!isConnected}
              className={`px-4 py-2 ${isConnected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600'}`}
            >
              <Send size={20} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;