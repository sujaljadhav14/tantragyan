import React, { useState, useEffect } from "react";

const WebSocketPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const connectWebSocket = () => {
        if (socket) {
            socket.close();
        }
    
        const ws = new WebSocket("ws://localhost:4000/api/chat");
        let reconnectTimeout;
    
        ws.onopen = () => {
            console.log("Connected to WebSocket server");
            setIsConnected(true);
            setMessages((prev) => [...prev, { text: "Connected to WebSocket", type: "system" }]);
            
            // Clear any pending reconnect timeouts
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMessages((prev) => [...prev, { 
                    text: data.message || data, 
                    type: data.type || "received" 
                }]);
            } catch (error) {
                setMessages((prev) => [...prev, { 
                    text: event.data, 
                    type: "received" 
                }]);
            }
        };
    
        ws.onclose = (event) => {
            console.log("WebSocket closed with code:", event.code);
            setIsConnected(false);
            setMessages((prev) => [...prev, { text: "Disconnected - Attempting to reconnect...", type: "system" }]);
            
            // Clear existing socket
            setSocket(null);
            
            // Attempt to reconnect with exponential backoff
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            reconnectTimeout = setTimeout(() => {
                if (!isConnected) {
                    console.log(`Attempting to reconnect... (attempt ${reconnectAttempts + 1})`);
                    connectWebSocket();
                }
            }, timeout);
        };
    
        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };
    
        setSocket(ws);
    };

    useEffect(() => {
        connectWebSocket();

        // Cleanup function
        return () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close(1000, "Component unmounting");
            }
        };
    }, []); // Remove socket from dependencies

    const sendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN && inputMessage.trim() !== "") {
            socket.send(inputMessage);
            setMessages((prev) => [...prev, { text: `You: ${inputMessage}`, type: "sent" }]);
            setInputMessage("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-white">Community Chat</h2>
            <div className="border border-gray-700 p-4 h-[400px] overflow-y-auto rounded-lg bg-gray-800">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`mb-2 p-2 rounded ${
                            msg.type === 'sent' ? 'bg-blue-600 ml-auto' :
                            msg.type === 'received' ? 'bg-gray-700' :
                            'bg-gray-600 text-center italic'
                        } ${msg.type === 'sent' ? 'max-w-[80%] ml-auto' : 'max-w-[80%]'}`}
                    >
                        <p className="text-white">{msg.text}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                />
                <button 
                    onClick={sendMessage}
                    disabled={!isConnected}
                    className={`px-4 py-2 rounded-lg ${
                        isConnected ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600'
                    } text-white font-semibold transition-colors`}
                >
                    Send
                </button>
            </div>
            {!isConnected && (
                <p className="text-red-500 mt-2 text-center">Disconnected - Attempting to reconnect...</p>
            )}
        </div>
    );
};

export default WebSocketPage;
