import type {AuthService} from "../../domain/core/ports/AuthService.ts";
import type {LoginRequest, LoginResponse} from "./dto/Login.ts";
import type {User} from "../../domain/core/entities/User.ts";
import type {AuthResponse} from "./dto/Auth.ts";
import type {RegisterRequest} from "./dto/Register.ts";

export const createAuthUseCase = (authService: AuthService) => {
    return {
        async auth():Promise<AuthResponse> {
            const user:User = await authService.auth()
            return {
                user_id: user.user_id,
                username: user.username,
            } as AuthResponse;
        },

        async register(req:RegisterRequest): Promise<void> {
            return await authService.register(req.username,req.email, req.password)
        },

        async login(dto: LoginRequest): Promise<LoginResponse> {
            if (!dto.email || !dto.password) {
                throw new Error('Email and password are required');
            }

            const credentials = {
                email: dto.email, // TODO .trim().toLowerCase(),
                password: dto.password
            };

            const user:User = await authService.login(credentials.email, credentials.password);

            return {
                username:user.username,
                token: user.token,
            } as LoginResponse;
        },

        async logout():Promise<void> {
            return await authService.logout();
        }
    };
};