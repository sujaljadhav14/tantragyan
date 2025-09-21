import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:4000', {
      transports: ['polling', 'websocket'],
      autoConnect: true
    });

    socket.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socket.current.on('message', (msg) => {
      setMessages(prev => [...prev, {
        type: 'message',
        text: msg.text,
        userId: msg.userId,
        timestamp: new Date(msg.timestamp)
      }]);
    });

    socket.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && socket.current?.connected) {
      socket.current.emit('message', inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Community Chat</h1>
        <p className="text-sm text-gray-400">
          {isConnected ? 'Connected' : 'Disconnected'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} 
               className={`flex ${msg.userId === socket.current?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg p-3 max-w-[70%] ${
              msg.type === 'system' ? 'bg-gray-700 text-gray-300 text-center w-full' :
              msg.userId === socket.current?.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
            }`}>
              <p>{msg.text}</p>
              {msg.timestamp && (
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!isConnected}
            className={`px-4 py-2 rounded-lg ${
              isConnected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600'
            } text-white font-semibold transition-colors`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;