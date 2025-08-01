export interface User {
    id: string,
    username: string,
    email: string,
}

export interface UsersResponse {
    users: User[], //
}