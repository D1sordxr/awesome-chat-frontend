import React from 'react';
import type { WebSocketService } from "../../domain/core/entities/WebSocket.ts";
import { WebSocketContext } from './UseContext';

interface WebSocketProviderProps {
    client: WebSocketService;
    children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
                                                                        client,
                                                                        children
                                                                    }) => {
    return (
        <WebSocketContext.Provider value={{ client }}>
            {children}
        </WebSocketContext.Provider>
    );
};