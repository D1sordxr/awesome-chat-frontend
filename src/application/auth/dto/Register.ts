export interface RegisterRequest {
    username: string,
    email: string,
    password: string,
}

export interface RegisterResponse {
    user_id:string,
}