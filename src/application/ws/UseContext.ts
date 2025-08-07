import { createContext, useContext } from "react";
import type {WebSocketService} from "../../domain/core/ports/WebSocketService.ts";

interface WebSocketContextValue {
    client: WebSocketService;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within WebSocketProvider');
    }
    return context;
};