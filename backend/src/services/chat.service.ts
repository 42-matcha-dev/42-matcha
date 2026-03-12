import { conversationRepository } from "../repositories/conversation.repository.js";
import { messageRepository } from "../repositories/message.repository.js";
import { canChat } from "./canChat.service.js";

type ConversationListRow = {
    conversation_id: number;
    user1_id: number;
    user2_id: number;
    created_at: Date;
    other_user_id: number;
    other_username: string;
    other_first_name: string | null;
    other_last_name: string | null;
    other_icon_url: string | null;
    last_message_content: string | null;
    last_message_at: Date | null;
    unread_count: number;
  };

type ConversationSummary = ReturnType<typeof mapConversationSummary>;

const mapConversationSummary = (row: ConversationListRow) => ({
    id: row.conversation_id,
    otherUser: {
        id: row.other_user_id,
        username: row.other_username,
        first_name: row.other_first_name,
        last_name: row.other_last_name,
        icon_url: row.other_icon_url,
    },
    lastMessage: row.last_message_content
      ? {
            content: row.last_message_content,
            created_at: row.last_message_at,
        }
      : null,
    created_at: row.created_at,
    unread_count: row.unread_count ?? 0,
});

export const chatService = {
    getConversations: async (userId: number) => {
        const rows = await conversationRepository.getConversationsByUserId(userId);
        const summaries: ConversationSummary[] = rows.map((row: ConversationListRow) => mapConversationSummary(row));
        const results = await Promise.all(
            summaries.map(async (s) => {
                const { allowed } = await canChat(userId, s.otherUser.id);
                return allowed ? s : null;
            })
        );
        return results.filter((s): s is NonNullable<typeof s> => s !== null);
    },

    getConversationSummary: async (conversationId: number, userId: number) => {
        const row = await conversationRepository.getConversationSummaryByIdForUser(userId, conversationId);
        if (!row) {
            throw new Error('Conversation not found or unauthorized');
        }
        return mapConversationSummary(row as ConversationListRow);
    },

    getMessages: async (
        conversationId: number,
        userId: number,
        limit?: number,
        offset?: number,
    ) => {
        const conversation = await conversationRepository.getConversationById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        const isParticipant =
            conversation.user1_id === userId || conversation.user2_id === userId;
        if (!isParticipant) {
            throw new Error('Unauthorized: not a participant in this conversation');
        }

        const messages = await messageRepository.getMessageByConversation(
            conversationId,
            limit,
            offset
        );

        await messageRepository.markAsRead(conversationId, userId);

        return messages;
    },

    markConversationRead: async (conversationId: number, userId: number) => {
        const conversation = await conversationRepository.getConversationById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        const isParticipant =
            conversation.user1_id === userId || conversation.user2_id === userId;
        if (!isParticipant) {
            throw new Error('Unauthorized: not a participant in this conversation');
        }
        await messageRepository.markAsRead(conversationId, userId);
        return chatService.getConversationSummary(conversationId, userId);
    },

    getOrCreateConversation: async (currentUserId: number, otherUserId: number) => {
        if (currentUserId === otherUserId) {
            throw new Error('Cannot create conversation with yourself');
        }

        const chatCheck = await canChat(currentUserId, otherUserId);
        if (!chatCheck.allowed) {
            throw new Error('Cannot chat with this user');
        }

        const user1 = Math.min(currentUserId, otherUserId);
        const user2 = Math.max(currentUserId, otherUserId);

        let conversation = await conversationRepository.getConversationByUserIds(user1, user2);
        if (conversation) {
            return {conversation, created: false};
        }

        conversation = await conversationRepository.createConversation(user1, user2);
        if (conversation) {
            return {conversation, created: true};
        }

        conversation = await conversationRepository.getConversationByUserIds(user1, user2);
        if (conversation) {
            return {conversation, created: false};
        }

        throw new Error('Failed to create or retrieve conversation');

    },

    sendMessage: async (
        conversationId: number,
        senderId: number,
        content: string
    ) => {
        const conversation = await conversationRepository.getConversationById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        const isParticipant =
            conversation.user1_id === senderId || conversation.user2_id === senderId;
        if (!isParticipant) {
            throw new Error('Unauthorized: not a participant in this conversation');
        }

        const otherUserId = conversation.user1_id === senderId
            ? conversation.user2_id
            : conversation.user1_id;
        const chatCheck = await canChat(senderId, otherUserId);
        if (!chatCheck.allowed) {
            throw new Error('Cannot chat with this user');
        }

        const message = await messageRepository.insertMessage(conversationId, senderId, content);
        if (!message) {
            throw new Error('Failed to send message');
        }
        return message;
    },

    getTotalUnreadCount: async (userId: number): Promise<number> => {
        return conversationRepository.getTotalUnreadCount(userId);
    },
};