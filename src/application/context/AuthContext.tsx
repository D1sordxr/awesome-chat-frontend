import { createContext, ReactNode } from 'react';
import { AuthUseCase } from '../useCases/AuthUseCase';
import { AuthServiceImpl } from '../../infrastructure/api/AuthServiceImpl';

const authService = new AuthServiceImpl();
const authUseCase = new AuthUseCase(authService);

export const AuthContext = createContext<AuthUseCase>(authUseCase);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    return (
        <AuthContext.Provider value={authUseCase}>
            {children}
        </AuthContext.Provider>
    );
};