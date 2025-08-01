import type { AuthService } from "../../domain/core/ports/AuthService";
import type { User } from "../../domain/core/entities/User";
import type { ApiConfig } from "./Config.ts";

export const createAuthServiceImpl = (config: ApiConfig): AuthService => {
    const { baseUrl, errorService, getAuthToken } = config;

    const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
        try {
            const token = getAuthToken?.();
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    ...options.headers,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await errorService.parseErrorResponse(response);
                throw new Error(errorData.message);
            }

            return response;
        } catch (error) {
            errorService.handleError(error, `AuthService: ${endpoint}`);
            throw error;
        }
    };

    return {
        async auth(): Promise<User> {
            const response = await fetchWithAuth('/user/auth-jwt', { method: 'GET' });
            const data = await response.json()
            return {user_id:data.id, username: data.username} as User;
        },

        async register(username: string, email: string, password: string): Promise<void> {
            await fetchWithAuth('/user/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
            });
        },

        async login(email: string, password: string): Promise<User> {
            const response = await fetchWithAuth('/user/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            return {
                user_id: data.user_id,
                username: data.username,
                token: data.token
            } as User;
        },

        async logout(): Promise<void> {
            await fetchWithAuth('/user/logout', { method: 'GET' });
        },
    };
};

