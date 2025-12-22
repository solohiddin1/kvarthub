import apiClient from './api';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { setTokens, clearTokens } from '../utils/storage';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    UserProfileResponse,
} from '../types/auth';

// Authentication service
export const authService = {
    // Register new user
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await apiClient.post<RegisterResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            data
        );
        return response.data;
    },

    // Verify OTP after registration
    async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
        const response = await apiClient.post<VerifyOtpResponse>(
            API_ENDPOINTS.AUTH.VERIFY_OTP,
            data
        );

        // Store tokens if verification successful
        if (response.data.success && response.data.result) {
            setTokens(response.data.result.access, response.data.result.refresh);
        }

        return response.data;
    },

    // Login user
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            data
        );

        // Store tokens if login successful
        if (response.data.success && response.data.result) {
            setTokens(response.data.result.access, response.data.result.refresh);
        }

        return response.data;
    },

    // Get user profile
    async getProfile(): Promise<UserProfileResponse> {
        const response = await apiClient.get<UserProfileResponse>(
            API_ENDPOINTS.USER.PROFILE
        );
        return response.data;
    },

    // Logout user
    logout(): void {
        clearTokens();
        window.location.href = '/';
    },

    // Redirect to Google OAuth
    loginWithGoogle(): void {
        window.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
    },
};
