import React from 'react';
import type { WSClient } from "../../domain/core/entities/WSClient";
import { WebSocketContext } from './UseContext';

interface WebSocketProviderProps {
    client: WSClient;
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