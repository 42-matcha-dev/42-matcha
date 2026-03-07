import type { Server, Socket } from 'socket.io';
import { chatService } from '../services/chat.service.js';
import { verifyToken } from '../utils/jwt.util.js';

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

    io.on("connection", (socket: Socket) => {
        const userId = socket.data.userId;
        console.log("🔌 User connected:", socket.id, "userId:", userId);

        socket.on("joinConversation", async (payload: { conversationId: number }, cb) => {
            try {
                const { conversationId } = payload;
                if (!conversationId || typeof conversationId !== 'number') {
                cb?.({ error: 'Invalid conversationId' });
                return;
                }
                const conversation = await chatService.getConversations(userId);
                const conv = conversation.find((c: { id: number }) => c.id === conversationId);
                if (!conv) {
                cb?.({ error: 'Conversation not found or unauthorized' });
                return;
                }
                socket.join(`conversation:${conversationId}`);
                cb?.({ ok: true });
            } catch (err) {
                cb?.({ error: err instanceof Error ? err.message : 'Failed to join' });
            }
        });
    
        socket.on("sendMessage", async (payload: { conversationId: number; content: string }, cb) => {
            try {
                const { conversationId, content } = payload;
                if (!conversationId || typeof content !== 'string' || !content.trim()) {
                    cb?.({ error: 'conversationId and content are required' });
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
        
        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });
      
}
