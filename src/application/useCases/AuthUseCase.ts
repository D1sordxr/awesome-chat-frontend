import {AuthService} from "../../domain/core/ports/AuthService";
import {User} from "../../domain/core/entities/User";

export class AuthUseCase {
    constructor(private service: AuthService) {}

    async auth():Promise<User>{
        return await this.service.auth()
    }

    async register(username: string, email: string, password: string): Promise<void> {
        if (password.length < 6) {
            throw new Error("Password too short");
        }

        await this.service.register(username, email, password);
    }

    async login(email:string, password:string): Promise<User> {
        try {
            return await this.service.login(email, password);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }

    async logout():Promise<void> {
        return await this.service.logout()
    }
}