import type { ChatService } from "../../domain/core/ports/ChatService";
import type { ChatUseCase } from "./Port";
import type { ChatPreviewsResponse, Message } from "../../domain/core/entities/ChatPreview";
import type { User } from "../../domain/core/entities/User";

export const createChatUseCase = (chatService: ChatService): ChatUseCase => {
    return {
        async getUserChatPreview(userId: string): Promise<ChatPreviewsResponse> {
            return await chatService.getUserChatPreview(userId);
        },

        async getChatAllMessages(chatId: string): Promise<Message[]> {
            return chatService.getChatAllMessages(chatId);
        },

        async getAllUsers(): Promise<User[]> {
            const users = await chatService.getAllUsers();
            return users.map(user => ({
                user_id: user.user_id,
                username: user.username,
                email: user.email
            }as User));
        },

        async createChat(chatName: string, memberIds: string[]): Promise<void> {
            if (!chatName?.trim() || memberIds.length === 0) {
                throw new Error('Chat name and members are required');
            }
            return chatService.createChat(chatName, memberIds);
        },

        async sendSync(message: Message, chatId: string): Promise<void> {
            if (!message.content?.trim() || !chatId) {
                throw new Error('Message content and chat ID are required');
            }
            return chatService.sendSync(message, chatId);
        }
    };
};