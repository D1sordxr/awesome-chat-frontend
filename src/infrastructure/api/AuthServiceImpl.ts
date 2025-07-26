import {AuthService} from "../../domain/core/ports/AuthService";
import {User} from "../../domain/core/entities/User";

export class AuthServiceImpl implements AuthService {
    async auth():Promise<User> {
        const response = await fetch("http://localhost:8080/user/auth-jwt", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) throw new Error("Auth failed");

        return await response.json();
    }
    async register(username: string, email: string, password: string): Promise<void> {
        const response = await fetch("http://localhost:8080/user/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) throw new Error("Registration failed");
    }
    async login(email: string, password: string): Promise<User> {
        try {
            const response = await fetch("http://localhost:8080/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await this.parseErrorResponse(response);
                throw new Error(errorData.message || "Login failed");
            }

            return await response.json();
        } catch (error) {
            console.error("Login error:", error);
            throw this.normalizeError(error);
        }
    }
    async logout():Promise<void>{
        const response = await fetch("http://localhost:8080/user/logout", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) throw new Error("Logout failed");
    }

    private async parseErrorResponse(response: Response): Promise<{ message: string }> {
        try {
            return await response.json();
        } catch {
            return { message: `HTTP ${response.status}: ${response.statusText}` };
        }
    }

    private normalizeError(error: unknown): Error {
        if (error instanceof Error) return error;
        return new Error(String(error));
    }
}

