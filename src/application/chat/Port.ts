import type { ChatPreviewsResponse, Message } from "../../domain/core/entities/ChatPreview";
import type { User } from "../../domain/core/entities/User";

export interface ChatUseCase {
    getUserChatPreview(userId: string): Promise<ChatPreviewsResponse>;
    getChatAllMessages(chatId: string): Promise<Message[]>;
    getAllUsers(): Promise<User[]>;
    createChat(chatName: string, memberIds: string[]): Promise<void>;
    sendSync(message: Message, chatId: string): Promise<void>;
}