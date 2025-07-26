import {ChatPreviewsResponse, Message} from "../entities/ChatPreview";

export interface ChatService {
    getUserChatPreview(user_id: string): Promise<ChatPreviewsResponse>;
    getChatAllMessages(chat_id: string): Promise<Message[]>;
    sendSync(message: Message, chat_id:string):Promise<void>;
}