// Authentication types

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone_number?: string;
    is_verified: boolean;
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
    full_name?: string;
    phone_number?: string;
}

export interface RegisterSuccessResponse {
    success: true;
    result: {
        id: string;
        email: string;
        full_name: string;
        phone_number: string;
        is_verified: boolean;
        otp: string;
        send_result: boolean;
    };
}

export interface RegisterErrorResponse {
    success: false;
    error: {
        code: number;
        message: string;
        message_language?: {
            uz: string;
            en: string;
            ru: string;
        };
    };
}

export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;


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

export interface ImageType {
    id:string
  image: string
}

export interface ProductsType {
  id: number
  title: string
  description: string
  price: string
  location:string
  rating: string
  phone_number:string
  floor_of_this_apartment:number
  total_floor_of_building:number
  images: ImageType[]
  rooms: number
}