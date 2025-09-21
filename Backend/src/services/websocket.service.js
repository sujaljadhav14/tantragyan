import { Server as SocketServer } from 'socket.io';

class WebSocketService {
    constructor() {
        this.connectedUsers = new Map();
        this.messageHistory = [];
        this.MAX_MESSAGE_HISTORY = 100;
    }

    initialize(server) {
        this.io = new SocketServer(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            pingTimeout: 60000,
            pingInterval: 25000
        });

        this.setupEventHandlers();
        return this.io;
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            // Send welcome message and message history
            socket.emit('message', {
                type: 'system',
                text: 'Welcome to the chat!',
                timestamp: new Date(),
                userId: 'system'
            });

            if (this.messageHistory.length > 0) {
                socket.emit('messageHistory', this.messageHistory);
            }

            // Handle user joining
            socket.on('userJoin', (userData) => {
                this.connectedUsers.set(socket.id, {
                    ...userData,
                    isTyping: false
                });
                this.broadcastUserList();
                this.broadcastSystemMessage(`${userData.username} joined the chat`);
            });

            // Handle messages
            socket.on('message', (message) => {
                const user = this.connectedUsers.get(socket.id);
                if (!user) return;

                const messageData = {
                    id: Date.now().toString(),
                    text: message,
                    userId: socket.id,
                    username: user.username,
                    timestamp: new Date(),
                    type: 'message'
                };

                this.addToMessageHistory(messageData);
                this.io.emit('message', messageData);
            });

            // Handle typing indicators
            socket.on('typing', (isTyping) => {
                const user = this.connectedUsers.get(socket.id);
                if (!user) return;

                user.isTyping = isTyping;
                socket.broadcast.emit('userTyping', {
                    userId: socket.id,
                    username: user.username,
                    isTyping
                });
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                const user = this.connectedUsers.get(socket.id);
                if (user) {
                    this.broadcastSystemMessage(`${user.username} left the chat`);
                    this.connectedUsers.delete(socket.id);
                    this.broadcastUserList();
                }
            });
        });
    }

    addToMessageHistory(message) {
        this.messageHistory.push(message);
        if (this.messageHistory.length > this.MAX_MESSAGE_HISTORY) {
            this.messageHistory.shift();
        }
    }

    broadcastUserList() {
        const userList = Array.from(this.connectedUsers.entries()).map(([id, user]) => ({
            userId: id,
            username: user.username,
            isTyping: user.isTyping
        }));
        this.io.emit('userList', userList);
    }

    broadcastSystemMessage(text) {
        const messageData = {
            type: 'system',
            text,
            timestamp: new Date(),
            userId: 'system'
        };
        this.addToMessageHistory(messageData);
        this.io.emit('message', messageData);
    }
}

export default new WebSocketService();