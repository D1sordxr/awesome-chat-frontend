import type { WebSocketService } from "../../domain/core/ports/WebSocketService.ts";
import type {
    Operation,
    OperationResponse,
    WSMessage,
    WsMessageData
} from "../../domain/core/entities/WebSocket.ts";
import { broadcast, sendMessage } from "../../domain/core/vo/WebSocketOperationConsts.ts";

export interface WSConfig {
    url: string;
    apiUrl: string;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export const createWebSocketServiceImpl = (config: WSConfig): WebSocketService => {
    let socket: WebSocket | null = null;

    const broadcastCallbacks: Array<(data: WsMessageData) => void> = [];
    const sendMessageCallbacks: Array<() => void> = [];

    const isConnected = (): boolean => {
        return socket?.readyState === WebSocket.OPEN;
    };

    const cleanup = (): void => {
        if (!socket) return;

        socket.onopen = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.onclose = null;

        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            socket.close();
        }

        socket = null;
        broadcastCallbacks.length = 0;
        sendMessageCallbacks.length = 0;
    };

    const handleSocketMessage = (event: MessageEvent): void => {
        try {
            const response = JSON.parse(event.data) as OperationResponse;

            switch (response.operation_type) {
                case broadcast:
                    // console.log("Broadcast data:", response.data as WsMessageData);
                    if (response.data) {
                        // console.log("Calling broadcast callback");
                        broadcastCallbacks.forEach(cb => cb(response.data as WsMessageData));
                    }
                    break;
                case sendMessage:
                    console.log("Sent successfully! Message:", response.data as WsMessageData);
                    sendMessageCallbacks.forEach(cb => cb());
                    break;

                default:
                    console.warn("Unknown operation type:", response.operation_type);
            }
        } catch (error) {
            console.error("Message parsing error:", error);
            config.onError?.(new Error("Failed to parse message"));
        }
    };

    const handleSocketError = (event: Event): void => {
        const error = new Error("WebSocket connection error");
        console.error("WebSocket error:", error, "event:", event);
        config.onError?.(error);
        cleanup();
    };

    return {
        async connect(user_id: string): Promise<void> {
            if (socket) {
                if (isConnected()) {
                    console.warn("WebSocket already connected");
                    return;
                }
                cleanup();
            }

            return new Promise((resolve, reject) => {
                socket = new WebSocket(`${config.url}/${user_id}`);

                socket.onopen = () => {
                    console.log("WebSocket connected");
                    config.onConnect?.();
                    resolve();
                };

                socket.onerror = (event) => {
                    handleSocketError(event);
                    reject(new Error("Connection failed"));
                };

                socket.onmessage = handleSocketMessage;

                socket.onclose = () => {
                    console.log("WebSocket closed");
                    config.onDisconnect?.();
                };
            });
        },

        disconnect(): void {
            cleanup();
        },

        onBroadcast(callback: (data: WsMessageData) => void): () => void {
            broadcastCallbacks.push(callback);
            return () => {
                const index = broadcastCallbacks.indexOf(callback);
                if (index !== -1) {
                    broadcastCallbacks.splice(index, 1);
                }
            };
        },

        onSendMessageResponse(callback: () => void): () => void {
            sendMessageCallbacks.push(callback);
            return () => {
                const index = sendMessageCallbacks.indexOf(callback);
                if (index !== -1) {
                    sendMessageCallbacks.splice(index, 1);
                }
            };
        },

        send(message: WSMessage): void {
            if (!isConnected()) {
                throw new Error("WebSocket is not connected");
            }
            socket?.send(JSON.stringify(message));
        },

        sendWithOperation(operation: Operation): void {
            if (!isConnected()) {
                throw new Error("WebSocket is not connected");
            }
            socket?.send(JSON.stringify(operation));
        }
    };
};