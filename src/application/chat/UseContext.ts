import { createContext, useContext } from "react";
import type { ChatUseCase } from "./Port";

interface ChatContextValue {
    chatUseCase: ChatUseCase;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
};