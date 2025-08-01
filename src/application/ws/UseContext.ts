import { createContext, useContext } from "react";
import type { WSClient } from "../../domain/core/entities/WSClient";

interface WebSocketContextValue {
    client: WSClient;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within WebSocketProvider');
    }
    return context;
};