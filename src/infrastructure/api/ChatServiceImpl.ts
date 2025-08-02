import type { ChatService } from "../../domain/core/ports/ChatService";
import type { ChatPreviewsResponse, Message } from "../../domain/core/entities/ChatPreview";
import type { User } from "../../domain/core/entities/User";
import type { ApiConfig } from "./Config.ts";

export const createChatServiceImpl = (config: ApiConfig): ChatService => {
    const { baseUrl, errorService, getAuthToken } = config;

    const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
        try {
            const token = getAuthToken?.();
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    ...options.headers,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await errorService.parseErrorResponse(response);
                throw new Error(errorData.message);
            }

            return response;
        } catch (error) {
            errorService.handleError(error, `ChatService: ${endpoint}`);
            throw error;
        }
    };

    return {
        async getAllUsers(): Promise<User[]> {
            const response = await fetchWithAuth('/user/get-all', { method: 'GET' });
            const data = await response.json();

            return data.users.map((user: User) => ({
                user_id: user.user_id,
                username: user.username,
                email: user.email,
            }));
        },

        async getUserChatPreview(user_id: string): Promise<ChatPreviewsResponse> {
            console.log(`Trying to get user chat previews by path: ${baseUrl}/chat/${user_id}`);
            const response = await fetchWithAuth(`/chat/${user_id}`);
            return await response.json();
        },

        async getChatAllMessages(chat_id: string): Promise<Message[]> {
            const response = await fetchWithAuth(`/chat/messages/${chat_id}`);
            return response.json();
        },

        async sendSync(message: Message, chat_id: string): Promise<void> {
            await fetchWithAuth('/message/send-sync', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: message.user_id,
                    chat_id: chat_id,
                    content: message.content,
                }),
            });
        },

        async createChat(chat_name: string, member_ids: string[]): Promise<string> {
            const response = await fetchWithAuth('/chat', {
                method: 'POST',
                body: JSON.stringify({
                    name: chat_name,
                    member_ids: member_ids,
                }),
            });

            const data = await response.json();
            if (!data.id) {
                throw new Error('Chat creation failed - no ID returned');
            }

            return data.id
        },
    };
};