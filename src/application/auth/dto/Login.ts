export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user_id: string,
    username: string,
    token: string,
}