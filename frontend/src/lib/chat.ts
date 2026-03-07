import { getCookie } from "@/utils/cookie.util";

export type Conversation = {
    id: number;
    otherUser: {
        id: number;
        username: string;
        first_name: string | null;
        last_name: string | null;
        icon_url: string | null;
    };
    lastMessage: { content: string; created_at: string } | null;
    created_at: string;
};

export type Message = {
    id: number;
    conversation_id: number;
    sender_id: number;
    content: string;
    created_at: string;
    is_read: boolean;
};

function getAuthHeaders(): Record<string, string> {
    const token = getCookie('token');
    if (!token) throw new Error('Authentication required');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

export async function fetchConversations(): Promise<Conversation[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`, {
        headers: getAuthHeaders(),
    });

    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch conversations');
    }
    return res.json();
}

export async function fetchConversation(conversationId: number): Promise<Conversation | null> {
    const conversations = await fetchConversations();
    return conversations.find((c) => c.id === conversationId) ?? null;
}

export async function fetchMessages(conversationId: number): Promise<Message[]> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${conversationId}/messages`,
        { headers: getAuthHeaders() }
    );

    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 404) throw new Error('Conversation not found');
        if (res.status === 403) throw new Error('Unauthorized: not a participant in this conversation');
        throw new Error(err.error || 'Failed to fetch messages');
    }
    return res.json();
}

export async function sendMessage(conversationId: number, content: string): Promise<Message> {
    const trimmed = content.trim();
    if (!trimmed) throw new Error('Message content is required');

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${conversationId}/messages`,
        {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ content: trimmed }),
        }
    );

    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 404) throw new Error('Conversation not found');
        if (res.status === 403) throw new Error('Unauthorized: not a participant in this conversation');
        throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
}
