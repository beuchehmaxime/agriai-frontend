import { io, Socket } from 'socket.io-client';
import { apiClient } from './apiClient';

class SocketService {
    private socket: Socket | null = null;

    connect(token: string) {
        if (this.socket?.connected) {
            return;
        }

        const socketUrl = apiClient.defaults.baseURL?.replace('/api', '') || 'http://192.168.1.129:3000';

        this.socket = io(socketUrl, {
            auth: { token },
            transports: ['websocket']
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
            if (err.message.includes('User not found')) {
                const { useUserStore } = require('../store/userStore');
                useUserStore.getState().logout();
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }

    // Helper to send messages
    sendMessage(consultationId: string, text?: string, imageUrl?: string) {
        if (!this.socket?.connected) {
            console.warn('Cannot send message: socket not connected');
            return;
        }

        this.socket.emit('send_message', {
            consultationId,
            text,
            imageUrl
        });
    }

    // Helper to mark Read
    markAsRead(consultationId: string) {
        if (!this.socket?.connected) return;
        this.socket.emit('mark_read', { consultationId });
    }
}

export const socketService = new SocketService();
