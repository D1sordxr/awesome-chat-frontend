import React from 'react';
import { AuthContext } from './UseContext.ts';
import type {AuthUseCase} from "./Port.ts";

export const AuthProvider = ({
    authUseCase,
    children,
}: {
    authUseCase: AuthUseCase;
    children: React.ReactNode;
}) => {
    return (
        <AuthContext.Provider value={{ authUseCase }}>
            {children}
        </AuthContext.Provider>
    );
};