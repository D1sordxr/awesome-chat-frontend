import {WSClient, WSMessage} from "../../domain/core/entities/WSClient";

export class WSClientImpl implements WSClient {
    private socket: WebSocket | null = null;
    private messageCallbacks: Array<(msg: WSMessage) => void> = [];

    constructor(private readonly url: string) {}

    public async connect(): Promise<void> {
        if (this.socket) {
            console.warn("WebSocket уже подключен");
            return;
        }

        this.socket = new WebSocket(this.url);

        return new Promise((resolve, reject) => {
            if (!this.socket) return;

            this.socket.onopen = () => {
                console.log("WebSocket подключен");
                resolve();
            };

            this.socket.onerror = (error) => {
                console.error("WebSocket ошибка:", error);
                reject(new Error("Connection failed"));
                this.cleanup();
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as WSMessage;
                    this.notifyCallbacks(message);
                } catch (e) {
                    console.error("Ошибка парсинга сообщения:", e);
                }
            };

            this.socket.onclose = () => {
                console.log("WebSocket закрыт");
                this.cleanup();
            };
        });
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.cleanup();
        }
    }

    public onMessage(callback: (msg: WSMessage) => void): void {
        this.messageCallbacks.push(callback);
    }

    private notifyCallbacks(message: WSMessage): void {
        this.messageCallbacks.forEach((cb) => cb(message));
    }

    private cleanup(): void {
        if (this.socket) {
            this.socket.onopen = null;
            this.socket.onerror = null;
            this.socket.onmessage = null;
            this.socket.onclose = null;
            this.socket = null;
        }
        this.messageCallbacks = [];
    }
}