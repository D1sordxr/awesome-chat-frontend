import React from 'react';
import type { ChatUseCase } from './Port';
import { ChatContext } from './UseContext';

interface ChatProviderProps {
    chatUseCase: ChatUseCase;
    children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
    chatUseCase,
    children
}) => {
    return (
        <ChatContext.Provider value={{ chatUseCase }}>
            {children}
        </ChatContext.Provider>
    );
};