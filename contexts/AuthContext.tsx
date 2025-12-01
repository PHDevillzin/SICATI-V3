import React, { createContext, useContext } from 'react';

// This user interface must match the one in App.tsx
export interface AuthUser {
  name: string;
  email: string;
  profile: string;
  unidade: string;
}

interface AuthContextType {
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const AuthProvider = AuthContext.Provider;

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};