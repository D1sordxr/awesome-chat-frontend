import type {AuthResponse} from "./dto/Auth.ts";
import type {RegisterRequest} from "./dto/Register.ts";
import type {LoginRequest, LoginResponse} from "./dto/Login.ts";

interface AuthUseCase {
    auth():Promise<AuthResponse>
    register(req:RegisterRequest): Promise<void>
    login(dto: LoginRequest): Promise<LoginResponse>
    logout():Promise<void>
}

export type {AuthUseCase}