import type {Operation, WSMessage, WsMessageData} from "../entities/WebSocket.ts";

export interface WebSocketService {
    connect(user_id: string): Promise<void>;
    disconnect(): void;

    // onMessage(callback: (msg: CallbackData) => void): () => void;

    onBroadcast(callback: (data: WsMessageData) => void): () => void;
    onSendMessageResponse(callback: () => void): () => void;

    send(message: WSMessage): void;
    sendWithOperation(operation: Operation): void;
}