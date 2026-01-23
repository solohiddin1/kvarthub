import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';
import { hasTokens, clearTokens } from '../utils/storage';
import type { ProductsType, User } from '../types/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    saved: ProductsType[]; 
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName?: string, phoneNumber?: string) => Promise<any>;
    verifyOtp: (email: string, code: string) => Promise<void>;
    logout: () => void;
    loginWithGoogle: () => void;
    refreshUser: () => Promise<void>;
    setSaved: React.Dispatch<React.SetStateAction<ProductsType[]>>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saved,setSaved] = useState<ProductsType[]>([])

    // Load user on mount if tokens exist
    useEffect(() => {
        const loadUser = async () => {
            if (hasTokens()) {
                try {
                    const response = await authService.getProfile();
                    if (response.success) {
                        setUser(response.result);
                    }
                } catch (error: any) {
                    // Only clear tokens if it's a 401 Unauthorized error
                    if (error.response?.status === 401) {
                        clearTokens();
                    }
                    // For other errors (network, etc.), keep tokens and let user try again
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login({ email, password });
            if (response.success) {
                // Fetch user profile after login
                const profileResponse = await authService.getProfile();
                if (profileResponse.success) {
                    setUser(profileResponse.result);
                }
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            throw error;
        }
    };

    const register = async (
        email: string,
        password: string,
        fullName?: string,
        phoneNumber?: string
    ) => {
        try {
            const response = await authService.register({
                email,
                password,
                full_name: fullName,
                phone_number: phoneNumber,
            });
            return response;
        } catch (error) {
            throw error;
        }
    };

    const verifyOtp = async (email: string, code: string) => {
        try {
            const response = await authService.verifyOtp({ email, code });
            if (response.success) {
                // Fetch user profile after verification
                const profileResponse = await authService.getProfile();
                if (profileResponse.success) {
                    setUser(profileResponse.result);
                }
            } else {
                throw new Error('OTP verification failed');
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        authService.logout();
    };

    const loginWithGoogle = () => {
        authService.loginWithGoogle();
    };

    const refreshUser = async () => {
        try {
            const response = await authService.getProfile();
            if (response.success) {
                setUser(response.result);
            } else {
                throw new Error('Failed to fetch user profile');
            }
        } catch (error: any) {
            console.error('Failed to refresh user:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        saved,
        login,
        register,
        verifyOtp,
        logout,
        loginWithGoogle,
        refreshUser,
        setSaved
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
