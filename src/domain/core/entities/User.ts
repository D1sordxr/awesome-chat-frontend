interface User {
    user_id: string,
    username: string,
    email: string,
    password: string,
    token: string,
}

interface Users {
    users: User[],
}

export type { User, Users };