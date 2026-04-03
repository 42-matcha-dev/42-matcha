import type { Server, Socket } from 'socket.io';
import { chatService } from '../services/chat.service.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { verifyToken } from '../utils/jwt.util.js';
import { canChat } from '../services/canChat.service.js';
import { userRepository } from '../repositories/user.repository.js';

export function setupChatSocket(io: Server): void {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token || typeof token !== 'string') {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = verifyToken(token);
            socket.data.userId = decoded.userId;
            next()
        } catch {
            next(new Error('Invalid or expired token'));
        }
    });

    io.on("connection", async (socket: Socket) => {
        const userId = socket.data.userId;
        console.log("🔌 User connected:", socket.id, "userId:", userId);
        socket.join(`user:${userId}`);

        await userRepository.setOnlineStatus(userId, true);
        io.emit('userStatusChanged', { userId, isOnline: true })

        const emitUnreadCount = async (targetUserId: number) => {
            try {
                const total = await conversationRepository.getTotalUnreadCount(targetUserId);
                io.to(`user:${targetUserId}`).emit('unreadMessageCount', { count: total });
            } catch (err) {
                console.error('Failed to emit unreadMessageCount:', err);
            }
        };

        const emitConversationUpdated = async (conversationId: number) => {
            const conversation = await conversationRepository.getConversationById(conversationId);
            if (!conversation) return;
            const participantIds = [conversation.user1_id, conversation.user2_id];
            for (const participantId of participantIds) {
                try {
                    const summary = await chatService.getConversationSummary(conversationId, participantId);
                    io.to(`user:${participantId}`).emit('conversationUpdated', summary);
                    await emitUnreadCount(participantId);
                } catch (err) {
                    console.error('Failed to emit conversationUpdated:', err);
                }
            }
        };

        try {
            const conversations = await chatService.getConversations(userId)
            for (const conv of conversations) {
                socket.join(`conversation:${conv.id}`)
            }
            await emitUnreadCount(userId);
        } catch (err) {
            console.error('Failed to auto-join conversations:', err);
        }

        socket.on("joinConversation", async (payload: { conversationId: number }, cb) => {
            try {
                let conversationId = payload?.conversationId;
                if (conversationId == null) {
                    cb?.({ error: 'Invalid conversationId' });
                    return;
                }
                conversationId = typeof conversationId === 'string' ? parseInt(conversationId, 10) : Number(conversationId);
                if (isNaN(conversationId)) {
                    cb?.({ error: 'Invalid conversationId' });
                    return;
                }

                const summary = await chatService.markConversationRead(conversationId, userId);
                socket.join(`conversation:${conversationId}`);
                io.to(`user:${userId}`).emit('conversationUpdated', summary);
                await emitUnreadCount(userId);
                cb?.({ ok: true, conversation: summary });
            } catch (err) {
                cb?.({ error: err instanceof Error ? err.message : 'Failed to join' });
            }
        });

        socket.on("markConversationRead", async (payload: { conversationId: number | string }, cb) => {
            try {
                const rawConversationId = payload?.conversationId;
                const conversationId =
                    typeof rawConversationId === 'string'
                        ? parseInt(rawConversationId, 10)
                        : Number(rawConversationId);
                if (Number.isNaN(conversationId)) {
                    cb?.({ error: 'Invalid conversationId' });
                    return;
                }
                const summary = await chatService.markConversationRead(conversationId, userId);
                io.to(`user:${userId}`).emit('conversationUpdated', summary);
                await emitUnreadCount(userId);
                cb?.({ ok: true });
            } catch (err) {
                cb?.({ error: err instanceof Error ? err.message : 'Failed to mark as read' });
            }
        });
    
        socket.on("sendMessage", async (payload: { conversationId: number | string; content: string }, cb) => {
            try {
                const rawConversationId = payload?.conversationId;
                const conversationId =
                    typeof rawConversationId === 'string'
                        ? parseInt(rawConversationId, 10)
                        : Number(rawConversationId);
                const content = payload?.content;
                if (Number.isNaN(conversationId) || typeof content !== 'string' || !content.trim()) {
                    cb?.({ error: 'conversationId and content are required' });
                    return;
                }

                const conversation = await conversationRepository.getConversationById(conversationId);
                if (!conversation) {
                    cb?.({ error: 'Cannot chat with this user' });
                    return;
                }
                const otherUserId = conversation.user1_id === userId
                    ? conversation.user2_id
                    : conversation.user1_id;
                const chatCheck = await canChat(userId, otherUserId);
                if (!chatCheck.allowed) {
                    cb?.({ error: 'Cannot chat with this user' });
                    return;
                }

                const message = await chatService.sendMessage(conversationId, userId, content.trim());
                
                const createdAt =
                    typeof message.created_at === 'string'
                        ? message.created_at
                        : (message.created_at as Date).toISOString();

                cb?.({ ok: true, message });
                io.to(`conversation:${conversationId}`).emit("newMessage", {
                id: message.id,
                conversation_id: message.conversation_id,
                sender_id: message.sender_id,
                content: message.content,
                created_at: createdAt,
                is_read: message.is_read
                });

                await emitConversationUpdated(conversationId);
            } catch (err) {
                cb?.({ error: err instanceof Error ? err.message : 'Failed to send message' });
            }
        });

        socket.on('leaveConversation', (payload: { conversationId: number }) => {
            const { conversationId } = payload;
                if (conversationId) {
                    socket.leave(`conversation:${conversationId}`);
                }
            });
        
        socket.on("disconnect", async () => {
            console.log("❌ User disconnected:", socket.id);
            await userRepository.setOnlineStatus(userId, false);
            io.emit('userStatusChanged', { userId, isOnline: false });
        });
    });
      
}
