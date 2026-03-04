import pool from '../database/init.js';

type MessageRow = {
    id: number;
    conversation_id: number;
    sender_id: number;
    content: string;
    created_at: Date;
    is_read: boolean;
};

export const messageRepository = {
    insertMessage: async (
        conversationId: number,
        senderId: number,
        content:string
    ): Promise<MessageRow | undefined> => {
        const query = `
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES($1, $2, $3)
            RETURNING id, conversation_id, sender_id, content, created_at, is_read
        `;
        const res = await pool.query(query, [conversationId, senderId, content]);
        return res.rows[0];
    },
};
