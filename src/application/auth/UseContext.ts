import {createContext, useContext} from "react";
import type {AuthUseCase} from "./Port.ts";

export const AuthContext = createContext<{ authUseCase: AuthUseCase } | null>(null);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
};