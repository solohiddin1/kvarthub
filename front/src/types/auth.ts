// Authentication types

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    is_verified: boolean;
    google_picture_url?: string;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    result: AuthTokens;
}

export interface RegisterRequest {
    email: string;
    password: string;
    first_name?: string;
    phone_number?: string;
}

export interface RegisterResponse {
    success: boolean;
    result: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        is_verified: boolean;
        otp: string;
        send_result: boolean;
    };
}

export interface VerifyOtpRequest {
    email: string;
    code: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    result: AuthTokens;
}

export interface UserProfileResponse {
    success: boolean;
    result: User;
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
    };
}
