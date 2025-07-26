// types.ts
export type WSMessage = {
    type: string;
    data: unknown;
};

export type WsMessageData = {
    user_id: string;
    chat_id: string;
    content: string;
}

export interface WSClient {
    connect(): Promise<void>;
    disconnect(): void;
    onMessage(callback: (msg: WSMessage) => void): void;
}