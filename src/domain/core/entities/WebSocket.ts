export type Operation<T = WsMessageData | SuccessResponse> = {
    id: number;
    operation: string;
    body: T;
};

export type OperationResponse<T = WsMessageData | SuccessResponse> = {
    id: number;
    operation_type: string;
    success: boolean;
    data: T;
    error: string;
};

export type SuccessResponse = {
    message: string;
}
export type CallbackData = OperationResponse | WSMessage;

export type WSMessage = {
    type: string;
    data: unknown;
};

export type WsMessageData = {
    user_id: string;
    chat_id: string;
    content: string;
};