import type {ChatPreviewsResponse, Message} from "../entities/ChatPreview";
import type {User} from "../entities/User";

export interface ChatService {
    getUserChatPreview(user_id: string): Promise<ChatPreviewsResponse>;
    getChatAllMessages(chat_id: string): Promise<Message[]>;
    sendSync(message: Message, chat_id:string):Promise<void>;
    getAllUsers(): Promise<User[]>
    createChat(chat_name:string, member_ids:string[]):Promise<void>
}