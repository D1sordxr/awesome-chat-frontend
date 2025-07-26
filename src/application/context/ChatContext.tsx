import { createContext, ReactNode } from 'react';
import { ChatUseCase } from '../useCases/ChatUseCase';
import { ChatServiceImpl } from '../../infrastructure/api/ChatServiceImpl';

const chatService = new ChatServiceImpl();
const chatUseCase = new ChatUseCase(chatService);

export const ChatContext = createContext<ChatUseCase>(chatUseCase);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    return (
        <ChatContext.Provider value={chatUseCase}>
            {children}
        </ChatContext.Provider>
    );
};