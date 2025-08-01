import type { WSClient, WSMessage } from "../../domain/core/entities/WSClient";

export interface WSConfig {
    url: string;
    apiUrl:string;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export const createWSClientImpl = (config: WSConfig): WSClient => {
    let socket: WebSocket | null = null;
    const messageCallbacks: Array<(msg: WSMessage) => void> = [];

    const cleanup = () => {
        if (socket) {
            socket.onopen = null;
            socket.onerror = null;
            socket.onmessage = null;
            socket.onclose = null;
            socket.close();
            socket = null;
        }
        messageCallbacks.length = 0; // Очищаем массив
    };

    const notifyCallbacks = (message: WSMessage) => {
        messageCallbacks.forEach(cb => cb(message));
    };

    return {
        async connect(user_id:string): Promise<void> {
            if (socket) {
                console.warn("WebSocket уже подключен");
                return;
            }

            socket = new WebSocket(config.url + `/${user_id}`);

            return new Promise((resolve, reject) => {
                if (!socket) return;

                socket.onopen = () => {
                    console.log("WebSocket подключен");
                    config.onConnect?.();
                    resolve();
                };

                socket.onerror = (event) => {
                    const error = new Error("WebSocket connection failed");
                    console.error("WebSocket ошибка:", error, "Event type: ",event.type);
                    config.onError?.(error);
                    cleanup();
                    reject(error);
                };

                socket.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data) as WSMessage;
                        notifyCallbacks(message);
                    } catch (e) {
                        console.error("Ошибка парсинга сообщения:", e);
                        config.onError?.(new Error("Failed to parse message"));
                    }
                };

                socket.onclose = () => {
                    console.log("WebSocket закрыт");
                    config.onDisconnect?.();
                    cleanup();
                };
            });
        },

        disconnect() {
            cleanup();
        },

        onMessage(callback: (msg: WSMessage) => void) {
            messageCallbacks.push(callback);
            // Возвращаем функцию для отписки
            return () => {
                const index = messageCallbacks.indexOf(callback);
                if (index !== -1) {
                    messageCallbacks.splice(index, 1);
                }
            };
        },

        send(message: WSMessage) {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                throw new Error("WebSocket is not connected");
            }
            socket.send(JSON.stringify(message));
        }
    };
};