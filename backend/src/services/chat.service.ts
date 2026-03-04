import { conversationRepository } from "../repositories/conversation.repository.js";
import { messageRepository } from "../repositories/message.repository.js";
import { blockRepository } from "../repositories/block.repository.js";

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
  };

export const chatService = {
    getConversations: async (userId: number) => {
        const rows = await conversationRepository.getConversationsByUserId(userId);
        return rows.map((row: ConversationListRow) => ({
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
            created_at: row.created_at
        }));
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

        // Note: This can move to a separate endpoint
        await messageRepository.markAsRead(conversationId, userId);

        return messages;
    },

    getOrCreateConversation: async (currentUserId: number, otherUserId: number) => {
        if (currentUserId == otherUserId) {
            throw new Error('Cannot create conversation with yourself');
        }

        const isBlocked = await blockRepository.isBlocked(currentUserId, otherUserId);
        if (isBlocked) {
            throw new Error('Cannot start conversation with blocked user');
        }

        const user1 = Math.min(currentUserId, otherUserId);
        const user2 = Math.max(currentUserId, otherUserId);

        let conversation = await conversationRepository.getConversationByUserIds(user1, user2);
        if (conversation) {
            return conversation;
        }

        conversation = await conversationRepository.createConversation(user1, user2);
        if (conversation) {
            return conversation;
        }

        conversation = await conversationRepository.getConversationByUserIds(user1, user2);
        if (conversation) {
            return conversation;
        }

        throw new Error('Failed to create or retrieve conversation');

    }
};