import type {User} from "../entities/User";

export interface AuthService {
    auth():Promise<User>;
    register(username: string, email: string, password: string): Promise<void>;
    login(email: string, password:string):Promise<User>;
    logout():Promise<void>;
}