export interface ChatPreviewsResponse {
    chat_previews: ChatPreview[];
}

export interface ChatPreview {
    chat_id: string;
    name: string;
    last_message: Message | null;
    unread_count: number;
    avatar_url?: string;
    participants: Participant[];
}

export interface Message {
    user_id: string;
    chat_id?: string;
    content: string;
    timestamp: string;
    isMe?: boolean;
}

export interface Participant {
    user_id: string;
    username: string;
}