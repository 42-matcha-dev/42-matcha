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

export async function fetchConversations(): Promise<Conversation[]> {
    const token = getCookie('token');
    if (!token) throw new Error('Authentication required');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch conversations');
    }
    return res.json();
}

// Add later
// export async function fetchMessages(conversationId: number): Promise<Message[]>
// export async function sendMessage(conversationId: number, content: string): Promise<Message>