export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    username: string,
    token: string,
}