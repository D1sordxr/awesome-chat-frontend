import {ChatService} from "../../domain/core/ports/ChatService";
import {ChatPreviewsResponse, Message} from "../../domain/core/entities/ChatPreview";

export class ChatUseCase {
    constructor(private service: ChatService) {}

    async getUserChatPreview(userId: string): Promise<ChatPreviewsResponse> {
        return await this.service.getUserChatPreview(userId);
    }

    async getChatAllMessages(chat_id: string): Promise<Message[]> {
        return await this.service.getChatAllMessages(chat_id);
    }

    async sendSync(message: Message, chat_id:string):Promise<void> {
        return await this.service.sendSync(message, chat_id);
    }
}