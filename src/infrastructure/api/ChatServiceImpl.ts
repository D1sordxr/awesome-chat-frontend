import {ChatService} from "../../domain/core/ports/ChatService";
import {ChatPreviewsResponse, Message} from "../../domain/core/entities/ChatPreview";
import {User} from "../../domain/core/entities/User";

export class ChatServiceImpl implements ChatService {
    async getAllUsers(): Promise<User[]> {
        try {
            const response = await fetch('http://localhost:8080/user/get-all', {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Request failed");
            }

            const data = await response.json();

            return data.users.map((user: any) => ({
                id: user.user_id,
                username: user.username,
                email: user.email
            }));

        } catch (error) {
            throw error;
        }
    }

    async getUserChatPreview(user_id: string): Promise<ChatPreviewsResponse> {
        try {
            const response = await fetch(`http://localhost:8080/chat/${user_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // TODO "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Request failed");
            }

            return await response.json();

        } catch (error) {
            console.error("ChatService error:", error);
            throw new Error("Failed to fetch chat previews");
        }
    }
    async getChatAllMessages(chat_id: string): Promise<Message[]>{
        try {
            const response = await fetch(`http://localhost:8080/chat/messages/${chat_id}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                // TODO "Authorization": `Bearer ${localStorage.getItem('token')}`
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Request failed");
            }

            return await response.json();
        } catch (error) {
            console.error("ChatService error:", error);
            throw new Error("Failed to fetch chat messages");
        }
    }
    async sendSync(message: Message, chat_id:string):Promise<void> {
        try {
            const response = await fetch(`http://localhost:8080/message/send-sync`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    user_id:message.sender_id,
                    chat_id: chat_id,
                    content:message.text,
                }),
            })
        } catch (error) {
            console.error("ChatService error:", error);
            throw new Error("Failed to fetch chat messages");
        }
    }
    async createChat(chat_name:string, member_ids:string[]): Promise<void>{
        try {
            const response = await fetch(`http://localhost:8080/chat`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name:chat_name,
                    member_ids:member_ids,
                }),

            })
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Request failed");
            }

            const data = await response.json();

            if (data.id === "") {
                throw new Error(`Request failed`);
            }
        } catch (error) {
            console.error("ChatService error:", error);
            throw new Error("Failed to create new chat");
        }
    }
}